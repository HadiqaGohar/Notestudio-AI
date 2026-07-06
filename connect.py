"""
NoteStudio AI — Connect to NotebookLM
======================================
STEP 1: Chrome mein https://notebooklm.google.com kholo, login karo
STEP 2: Ye script chalao:  python connect.py
STEP 3: Done! Auto HF Space pe upload ho jayega.

Ye script tumhare EXISTING Chrome se cookies nikaalti hai.
Koi naya browser nahi khulega. Google block nahi karega.
"""
import sys, os, base64, json, shutil, sqlite3, tempfile, glob


def find_chrome_cookie_path():
    """Find Chrome's cookie database on this system."""
    home = os.path.expanduser("~")

    candidates = [
        # Linux
        os.path.join(home, ".config", "google-chrome", "Default", "Cookies"),
        os.path.join(home, ".config", "google-chrome", "Default", "Network", "Cookies"),
        os.path.join(home, ".config", "chromium", "Default", "Cookies"),
        # Mac
        os.path.join(home, "Library", "Application Support", "Google", "Chrome", "Default", "Cookies"),
        # Windows
        os.path.join(home, "AppData", "Local", "Google", "Chrome", "User Data", "Default", "Network", "Cookies"),
        os.path.join(home, "AppData", "Local", "Google", "Chrome", "User Data", "Default", "Cookies"),
    ]

    # Also check all Chrome profiles
    for pattern in [
        os.path.join(home, ".config", "google-chrome", "Profile *", "Cookies"),
        os.path.join(home, ".config", "google-chrome", "Default", "Cookies"),
    ]:
        candidates.extend(glob.glob(pattern))

    for path in candidates:
        if os.path.exists(path):
            return path

    return None


def extract_cookies(db_path):
    """Extract Google/NotebookLM cookies from Chrome's SQLite database."""
    # Copy to temp to avoid lock
    tmp = tempfile.mktemp(suffix=".db")
    shutil.copy2(db_path, tmp)

    try:
        conn = sqlite3.connect(tmp)
        cursor = conn.cursor()

        # Get all Google-related cookies
        cursor.execute("""
            SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly, encrypted_value
            FROM cookies
            WHERE host_key LIKE '%google%'
               OR host_key LIKE '%notebooklm%'
               OR host_key LIKE '%youtube%'
               OR host_key LIKE '%googleapis%'
        """)

        cookies = []
        for row in cursor.fetchall():
            name, value, host, path, expires, secure, httponly, enc_value = row

            # If value is empty but encrypted_value exists, try to use it
            if not value and enc_value:
                # On Linux, encrypted cookies start with v10 or v11
                # We can't decrypt without the key, but some cookies have plain values
                continue

            if value:
                cookies.append({
                    "name": name,
                    "value": value,
                    "domain": host,
                    "path": path,
                    "expires": expires,
                    "secure": bool(secure),
                    "httpOnly": bool(httponly),
                })

        conn.close()
        return cookies

    except Exception as e:
        raise e
    finally:
        os.unlink(tmp)


def build_storage_state(cookies):
    """Build notebooklm-py compatible storage_state.json."""
    playwright_cookies = []

    for c in cookies:
        pc = {
            "name": c["name"],
            "value": c["value"],
            "domain": c["domain"],
            "path": c["path"],
            "secure": c["secure"],
            "httpOnly": c["httpOnly"],
            "sameSite": "Lax",
        }
        # Chrome timestamps: microseconds since 1601-01-01
        if c["expires"] and c["expires"] > 0:
            chrome_epoch_offset = 11644473600
            pc["expires"] = (c["expires"] / 1000000) - chrome_epoch_offset
        else:
            pc["expires"] = -1

        playwright_cookies.append(pc)

    return {
        "cookies": playwright_cookies,
        "origins": []
    }


def upload_to_hf(b64):
    """Upload session to HuggingFace Space."""
    import urllib.request, urllib.error

    # Read HF token
    token = os.environ.get("HF_TOKEN", "")
    if not token:
        for p in [
            os.path.join(os.path.expanduser("~"), ".hf_token"),
            os.path.join(os.path.expanduser("~"), ".hf_token.txt"),
        ]:
            if os.path.exists(p):
                with open(p) as f:
                    token = f.read().strip()
                break

    if not token:
        return False, "No HF token found"

    url = "https://huggingface.co/api/spaces/HadiqaGohar/notestudio-ai-backend/secrets"

    # Try POST first, then PUT
    for method in ["POST", "PUT"]:
        try:
            data = json.dumps({"key": "NBLM_SESSION", "value": b64}).encode()
            if method == "PUT":
                url = url + "/NBLM_SESSION"
            req = urllib.request.Request(
                url, data=data, method=method,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            urllib.request.urlopen(req)
            return True, None
        except urllib.error.HTTPError as e:
            if e.code == 409:  # Conflict = already exists, try PUT
                continue
            continue

    return False, "Upload failed"


def main():
    print("=" * 55)
    print("  NoteStudio AI — Connect to NotebookLM")
    print("=" * 55)

    # Step 1: Check Chrome is logged in
    print("\n  BEFORE running this script:")
    print("  1. Open Chrome")
    print("  2. Go to https://notebooklm.google.com")
    print("  3. Login with Google")
    print("  4. Make sure NotebookLM page is loaded")
    print("  5. Close Chrome (or keep it open)")
    print("  6. Then run this script\n")

    input("  Press Enter after completing steps 1-5... ")

    # Step 2: Find Chrome cookies
    print("\n[1/3] Finding Chrome cookies...")
    cookie_path = find_chrome_cookie_path()
    if not cookie_path:
        print("  [ERROR] Chrome cookie database not found!")
        print("  Make sure Chrome is installed and you have logged in at least once.")
        input("\n  Press Enter to exit...")
        return
    print(f"  Found: {cookie_path}")

    # Step 3: Extract cookies
    print("\n[2/3] Extracting Google cookies...")
    try:
        cookies = extract_cookies(cookie_path)
    except Exception as e:
        print(f"  [ERROR] Could not read cookies: {e}")
        print("  Try: Close ALL Chrome windows first, then run this script again.")
        input("\n  Press Enter to exit...")
        return

    if not cookies:
        print("  [ERROR] No Google cookies found!")
        print("  Make sure you are logged into Google in Chrome.")
        input("\n  Press Enter to exit...")
        return

    google_cookies = [c for c in cookies if "google" in c["domain"]]
    nlm_cookies = [c for c in cookies if "notebooklm" in c["domain"]]
    print(f"  Found {len(google_cookies)} Google cookies")
    print(f"  Found {len(nlm_cookies)} NotebookLM cookies")

    # Step 4: Build session
    print("\n[3/3] Building session & uploading...")
    state = build_storage_state(cookies)
    b64 = base64.b64encode(json.dumps(state).encode()).decode()

    # Save locally
    local_path = os.path.join(os.path.expanduser("~"), "notebooklm_session.txt")
    with open(local_path, "w") as f:
        f.write(b64)
    print(f"  Session saved locally: {local_path}")

    # Upload to HF
    success, error = upload_to_hf(b64)
    if success:
        print("  [OK] Uploaded to HuggingFace Space!")
    else:
        print(f"  [WARN] Auto-upload failed: {error}")

    print("\n" + "=" * 55)
    if success:
        print("  ALL DONE!")
        print("")
        print("  Visit: https://notestudio-ai.vercel.app")
        print("  Click 'NotebookLM' tab -> It will work!")
        print("")
        print("  (If 'Not Connected', wait 1 min for Space to redeploy)")
    else:
        print("  Session saved locally.")
        print("  Upload manually to HF Space as NBLM_SESSION")
    print("=" * 55)

    input("\n  Press Enter to exit...")


if __name__ == "__main__":
    main()

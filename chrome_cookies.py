"""
Chrome se NotebookLM cookies nikaalo
=====================================
STEP 1: Chrome mein https://notebooklm.google.com kholo aur login karo
STEP 2: Ye script chalao:  python chrome_cookies.py
STEP 3: Done! Cookies auto HF Space pe upload ho jayengi.
"""
import sys, os, base64, json, shutil, sqlite3, tempfile, time


def get_chrome_cookies():
    """Extract Google cookies from Chrome's cookie database."""
    home = os.path.expanduser("~")

    # Chrome cookie paths for different OS
    if sys.platform == "win32":
        cookie_path = os.path.join(home, "AppData", "Local", "Google", "Chrome", "User Data", "Default", "Network", "Cookies")
    elif sys.platform == "darwin":
        cookie_path = os.path.join(home, "Library", "Application Support", "Google", "Chrome", "Default", "Cookies")
    else:
        cookie_path = os.path.join(home, ".config", "chromium", "Default", "Cookies")
        if not os.path.exists(cookie_path):
            cookie_path = os.path.join(home, ".config", "google-chrome", "Default", "Cookies")

    if not os.path.exists(cookie_path):
        # Try copying to temp to avoid lock
        alt_paths = []
        if sys.platform == "linux":
            alt_paths = [
                os.path.join(home, ".config", "chromium", "Default", "Cookies"),
                os.path.join(home, ".config", "google-chrome", "Default", "Cookies"),
                os.path.join(home, ".config", "google-chrome-stable", "Default", "Cookies"),
            ]
        for p in alt_paths:
            if os.path.exists(p):
                cookie_path = p
                break

    if not os.path.exists(cookie_path):
        return None, "Chrome cookies not found. Make sure Chrome is installed and you are logged into Google."

    # Copy to temp to avoid lock issues
    tmp = tempfile.mktemp(suffix=".db")
    shutil.copy2(cookie_path, tmp)

    try:
        conn = sqlite3.connect(tmp)
        cursor = conn.cursor()

        # Get Google-related cookies
        cursor.execute("""
            SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly
            FROM cookies
            WHERE host_key LIKE '%google.com%'
               OR host_key LIKE '%notebooklm%'
               OR host_key LIKE '%youtube.com%'
        """)

        cookies = []
        for row in cursor.fetchall():
            name, value, host, path, expires, secure, httponly = row
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
        return cookies, None

    except Exception as e:
        return None, f"Error reading cookies: {e}"
    finally:
        try:
            os.unlink(tmp)
        except:
            pass


def build_storage_state(cookies):
    """Build notebooklm-py compatible storage_state.json from cookies."""
    playwright_cookies = []
    for c in cookies:
        pc = {
            "name": c["name"],
            "value": c["value"],
            "domain": c["domain"],
            "path": c["path"],
            "secure": c["secure"],
            "httpOnly": c["httpOnly"],
        }
        if c["expires"] and c["expires"] > 0:
            # Chrome timestamps are microseconds since 1601-01-01
            # Convert to Unix timestamp
            chrome_epoch = 11644473600  # seconds between 1601 and 1970
            pc["expires"] = (c["expires"] / 1000000) - chrome_epoch
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

    token = os.environ.get("HF_TOKEN", "")
    if not token:
        config_path = os.path.join(os.path.expanduser("~"), ".hf_token")
        if os.path.exists(config_path):
            with open(config_path) as f:
                token = f.read().strip()

    if not token:
        return False

    url = "https://huggingface.co/api/spaces/HadiqaGohar/notestudio-ai-backend/secrets"
    data = json.dumps({"key": "NBLM_SESSION", "value": b64}).encode()
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )

    try:
        urllib.request.urlopen(req)
        return True
    except urllib.error.HTTPError:
        try:
            url2 = url + "/NBLM_SESSION"
            req2 = urllib.request.Request(
                url2, data=json.dumps({"value": b64}).encode(), method="PUT",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            urllib.request.urlopen(req2)
            return True
        except Exception:
            return False


def main():
    print("=" * 55)
    print("  Extract NotebookLM cookies from Chrome")
    print("=" * 55)

    print("\n  Prerequisites:")
    print("  1. Open Chrome")
    print("  2. Go to https://notebooklm.google.com")
    print("  3. Login with Google")
    print("  4. Make sure NotebookLM page is loaded")
    print("  5. Then run this script\n")

    input("  Press Enter after you have NotebookLM open in Chrome... ")

    print("\n[*] Reading Chrome cookies...")
    cookies, error = get_chrome_cookies()

    if error:
        print(f"  [ERROR] {error}")
        input("\n  Press Enter to exit...")
        return

    if not cookies:
        print("  [ERROR] No Google cookies found in Chrome.")
        print("  Make sure you are logged into Google in Chrome.")
        input("\n  Press Enter to exit...")
        return

    print(f"  Found {len(cookies)} Google-related cookies")

    # Check for essential NotebookLM cookies
    nlm_cookies = [c for c in cookies if "notebooklm" in c["domain"].lower()]
    google_cookies = [c for c in cookies if "google.com" in c["domain"].lower()]

    print(f"  - Google cookies: {len(google_cookies)}")
    print(f"  - NotebookLM cookies: {len(nlm_cookies)}")

    if not google_cookies:
        print("  [ERROR] No Google cookies found. Are you logged into Google?")
        input("\n  Press Enter to exit...")
        return

    print("\n[*] Building session...")
    state = build_storage_state(cookies)
    state_json = json.dumps(state)
    b64 = base64.b64encode(state_json.encode()).decode()

    # Save locally
    local_path = os.path.join(os.path.expanduser("~"), "notebooklm_session.txt")
    with open(local_path, "w") as f:
        f.write(b64)
    print(f"  Saved to: {local_path}")

    # Upload to HF
    print("\n[*] Uploading to HuggingFace Space...")
    success = upload_to_hf(b64)

    print("\n" + "=" * 55)
    if success:
        print("  ALL DONE!")
        print("")
        print("  Visit: https://notestudio-ai.vercel.app")
        print("  Click 'NotebookLM' -> It will work!")
        print("")
        print("  (Wait 1 min if it shows 'Not Connected')")
    else:
        print("  Auto-upload failed.")
        print(f"  Your session is saved at: {local_path}")
        print("  Set it manually on HF Space as NBLM_SESSION")
    print("=" * 55)

    input("\n  Press Enter to exit...")


if __name__ == "__main__":
    main()

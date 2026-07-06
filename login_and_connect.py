"""
NoteStudio AI — One-Click NotebookLM Login
==========================================
DOUBLE CLICK this file to connect NotebookLM.

1. Browser opens -> Login with Google
2. Session auto-uploaded to HuggingFace
3. Done! Visit notestudio-ai.vercel.app -> Click NotebookLM
"""
import subprocess, sys, os, base64, json, time, urllib.request, urllib.error


def install_deps():
    print("[1/4] Checking dependencies...")
    try:
        from playwright.sync_api import sync_playwright
        print("  [OK] All ready")
    except ImportError:
        print("  Installing required packages...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "playwright"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        subprocess.check_call(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        print("  [OK] Installed")


def do_login():
    print("\n[2/4] Opening browser...")
    print("  -> Sign in with your Google account")
    print("  -> Wait until NotebookLM page loads")
    print("  -> Then come back here\n")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("https://notebooklm.google.com")
        page.wait_for_url("**/notebooklm.google.com/**", timeout=300000)
        print("  Login detected!")
        time.sleep(3)
        state = browser.storage_state()
        browser.close()

    return state


def upload_to_hf(storage_state):
    print("\n[3/4] Uploading to HuggingFace Space...")

    state_json = json.dumps(storage_state)
    b64 = base64.b64encode(state_json.encode()).decode()

    # Read token from saved config or env
    token = os.environ.get("HF_TOKEN", "")
    if not token:
        config_path = os.path.join(os.path.expanduser("~"), ".hf_token")
        if os.path.exists(config_path):
            with open(config_path) as f:
                token = f.read().strip()

    if not token:
        print("  No HF token found. Saving session locally...")
        save_locally(b64)
        return False, b64

    url = f"https://huggingface.co/api/spaces/HadiqaGohar/notestudio-ai-backend/secrets"
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
        print("  [OK] Session uploaded to HF Space!")
        return True, b64
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
            print("  [OK] Session updated on HF Space!")
            return True, b64
        except Exception:
            pass
        print("  Upload failed. Saving locally...")
        save_locally(b64)
        return False, b64


def save_locally(b64):
    path = os.path.join(os.path.expanduser("~"), "notebooklm_session.txt")
    with open(path, "w") as f:
        f.write(b64)
    print(f"  Saved to: {path}")


def main():
    print("=" * 55)
    print("  NoteStudio AI - NotebookLM Auto-Connect")
    print("  Just login with Google. Rest is automatic.")
    print("=" * 55)

    install_deps()

    try:
        state = do_login()
    except Exception as e:
        print(f"\n  [ERROR] {e}")
        input("\n  Press Enter to exit...")
        return

    success, b64 = upload_to_hf(state)

    if not success:
        # Offer to save token for next time
        print("\n  To auto-upload next time, save your HF token:")
        print("  Option A: Set environment variable HF_TOKEN")
        print("  Option B: Save token to ~/.hf_token file")

    print("\n" + "=" * 55)
    if success:
        print("  ALL DONE!")
        print("")
        print("  Visit: https://notestudio-ai.vercel.app")
        print("  Click 'NotebookLM' -> It will work!")
        print("")
        print("  (Wait 1 min if it shows 'Not Connected')")
    else:
        print("  Session saved locally.")
        print(f"  Copy text from: ~/notebooklm_session.txt")
        print("  Set as NBLM_SESSION on HF Space manually.")
    print("=" * 55)

    input("\n  Press Enter to exit...")


if __name__ == "__main__":
    main()

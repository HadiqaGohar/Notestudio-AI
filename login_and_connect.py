"""
NoteStudio AI — NotebookLM Login Helper
========================================
TWO OPTIONS — jo easy ho wo karo:

OPTION A: Auto (browser opens automatically)
  -> python login_and_connect.py

OPTION B: Manual (your regular Chrome browser)
  -> Open https://notebooklm.google.com in Chrome
  -> Login with Google
  -> Then run: python login_from_chrome.py
  -> Cookies auto-extracted from Chrome and uploaded!
"""
import subprocess, sys, os, base64, json, time, shutil, sqlite3, http.cookiejar


def install_deps():
    print("[1/3] Checking dependencies...")
    try:
        from playwright.sync_api import sync_playwright
        print("  [OK] All ready")
    except ImportError:
        print("  Installing playwright...")
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
    print("\n[2/3] Opening browser...")
    print("  -> Sign in with your Google account")
    print("  -> Wait until NotebookLM loads")
    print("  -> Then come back here\n")

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto("https://accounts.google.com", timeout=120000, wait_until="domcontentloaded")
            print(f"  Page loaded: {page.url}")
        except Exception as e:
            print(f"  Page load issue: {e}")
            print("  Please navigate to https://notebooklm.google.com manually")
            input("  Press Enter after you have navigated there... ")

        print("\n  Please login with Google in the browser window.")
        print("  After login, navigate to https://notebooklm.google.com")
        print("  Then press Enter here...")
        input("\n  Press Enter when you see NotebookLM loaded in browser: ")

        time.sleep(3)
        storage_state = context.storage_state()
        context.close()
        browser.close()

    return storage_state


def upload_to_hf(storage_state):
    print("\n[3/3] Uploading to HuggingFace Space...")

    state_json = json.dumps(storage_state)
    b64 = base64.b64encode(state_json.encode()).decode()

    token = os.environ.get("HF_TOKEN", "")
    if not token:
        config_path = os.path.join(os.path.expanduser("~"), ".hf_token")
        if os.path.exists(config_path):
            with open(config_path) as f:
                token = f.read().strip()

    if not token:
        save_locally(b64)
        return False, b64

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

    print("\n" + "=" * 55)
    if success:
        print("  ALL DONE!")
        print("")
        print("  Visit: https://notestudio-ai.vercel.app")
        print("  Click 'NotebookLM' -> It will work!")
    else:
        print("  Session saved locally.")
        print("  Follow instructions above to set manually.")
    print("=" * 55)

    input("\n  Press Enter to exit...")


if __name__ == "__main__":
    main()

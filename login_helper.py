"""
NotebookLM Login Helper
=======================
Double-click this file to login and export your session.

Steps:
1. Browser will open → Sign in with your Google account
2. After login, this script will print your session cookie
3. Copy the printed text and paste it in the NoteStudio portal

If you get errors, run: pip install "notebooklm-py[browser]" && playwright install chromium
"""
import subprocess
import sys
import os
import base64
import json
import time


def install_deps():
    print("[1/4] Checking dependencies...")
    try:
        import notebooklm
        print("  notebooklm-py: OK")
    except ImportError:
        print("  Installing notebooklm-py...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "notebooklm-py[browser]"], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("  notebooklm-py: Installed")

    try:
        from playwright.sync_api import sync_playwright
        print("  playwright: OK")
    except ImportError:
        print("  Installing playwright...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("  playwright: Installed")


def do_login():
    print("\n[2/4] Opening browser for Google login...")
    print("  -> Sign in with your Google account")
    print("  -> After login, come back to this window\n")

    from notebooklm.auth import login as nlm_login
    nlm_login()
    print("  Login successful!")


def export_session():
    print("\n[3/4] Exporting session...")

    session_path = os.path.expanduser("~/.notebooklm/storage_state.json")
    if not os.path.exists(session_path):
        print(f"  ERROR: Session file not found at {session_path}")
        return None

    with open(session_path, "rb") as f:
        data = f.read()

    b64 = base64.b64encode(data).decode("utf-8")
    print("  Session exported!")
    return b64


def save_to_file(b64_text):
    print("\n[4/4] Saving to file...")
    output_path = os.path.join(os.path.expanduser("~"), "notebooklm_session.txt")
    with open(output_path, "w") as f:
        f.write(b64_text)
    print(f"  Saved to: {output_path}")
    return output_path


def main():
    print("=" * 60)
    print("  NotebookLM Login Helper")
    print("  This will open Google login in your browser")
    print("=" * 60)

    install_deps()

    try:
        do_login()
    except Exception as e:
        print(f"\n  Login error: {e}")
        print("  Try again or check your internet connection.")
        input("\n  Press Enter to exit...")
        return

    b64 = export_session()
    if not b64:
        input("\n  Press Enter to exit...")
        return

    filepath = save_to_file(b64)

    print("\n" + "=" * 60)
    print("  DONE! Your session is ready.")
    print(f"  File saved at: {filepath}")
    print("")
    print("  NOW: Open this file, copy ALL the text inside,")
    print("  and paste it in the NoteStudio portal at:")
    print("  https://notestudio-ai.vercel.app")
    print("")
    print("  OR send it to your friend who will set it on HF Space.")
    print("=" * 60)

    # Also print the base64 text directly
    print("\n  Your session token (copy this):\n")
    print(b64)
    print("\n" + "=" * 60)

    input("\n  Press Enter to exit...")


if __name__ == "__main__":
    main()

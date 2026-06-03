#!/usr/bin/env python3
"""
Lumus Gmail Setup — run this ONCE on your laptop.

What it does:
  1. Asks for your Google OAuth credentials (client_id + client_secret)
  2. Opens your browser to authorise Gmail access
  3. Prints the three GitHub secrets you need to paste

Usage:
  pip install google-auth-oauthlib
  python3 setup/setup_gmail.py
"""

import sys
import webbrowser

SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
]

CONSOLE_URL = "https://console.cloud.google.com/"

def pause(msg="Press Enter to continue..."):
    input(f"\n{msg}")

def main():
    print()
    print("=" * 60)
    print("  LUMUS — Gmail API One-Time Setup")
    print("=" * 60)

    # ── Step 1: check dependency ───────────────────────────────────
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("\n[!] Missing package. Run this first:\n")
        print("    pip install google-auth-oauthlib\n")
        sys.exit(1)

    # ── Step 2: Google Cloud Console walkthrough ───────────────────
    print("""
STEP 1 — Create OAuth credentials in Google Cloud Console
──────────────────────────────────────────────────────────
Opening the Google Cloud Console now...
""")
    pause("Press Enter and the console will open in your browser...")
    webbrowser.open(CONSOLE_URL)

    print("""
In the console, do this (takes about 3 minutes):

  1. Select or create a project  (top-left dropdown → "New Project")
     Name it anything, e.g. "Lumus Agency"

  2. Left menu → APIs & Services → Library
     Search "Gmail API" → click Enable

  3. Left menu → APIs & Services → OAuth consent screen
     - User type: External → Create
     - App name: Lumus  |  Support email: your Gmail
     - Scopes: click "Add or remove scopes"
       Add:  .../auth/gmail.compose
             .../auth/gmail.send
     - Test users: add  dnpebusiness@gmail.com
     - Save and continue

  4. Left menu → APIs & Services → Credentials
     Click "Create Credentials" → "OAuth client ID"
     Application type: Desktop app
     Name: Lumus Gmail Bot → Create

  5. Download the JSON file (the download button next to the new credential)
     Save it as:  credentials.json  in this folder
""")
    pause("Done? Press Enter once credentials.json is saved in this folder...")

    import os
    creds_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "credentials.json")
    if not os.path.exists(creds_file):
        print(f"\n[!] credentials.json not found at:\n    {creds_file}")
        print("    Save the downloaded file there and run this script again.\n")
        sys.exit(1)

    # ── Step 3: OAuth browser flow ─────────────────────────────────
    print("""
STEP 2 — Authorise Gmail access
────────────────────────────────
Your browser will open. Sign in as  dnpebusiness@gmail.com  and click Allow.
""")
    pause("Press Enter to open the authorisation page...")

    flow = InstalledAppFlow.from_client_secrets_file(creds_file, scopes=SCOPES)
    creds = flow.run_local_server(port=0, open_browser=True)

    # ── Step 4: print secrets ──────────────────────────────────────
    print()
    print("=" * 60)
    print("  SUCCESS — Copy these 3 values to GitHub Secrets")
    print("=" * 60)
    print("""
Go to:
  https://github.com/dnpebusiness-lab/lumusagency
  → Settings → Secrets and variables → Actions → New repository secret

Add these one at a time:
""")
    print(f"  Secret name:   GMAIL_CLIENT_ID")
    print(f"  Secret value:  {creds.client_id}")
    print()
    print(f"  Secret name:   GMAIL_CLIENT_SECRET")
    print(f"  Secret value:  {creds.client_secret}")
    print()
    print(f"  Secret name:   GMAIL_REFRESH_TOKEN")
    print(f"  Secret value:  {creds.refresh_token}")
    print()
    print("=" * 60)
    print("  Also add (if not already there):")
    print("  GOOGLE_PLACES_API_KEY — your Google Places API key")
    print("  ANTHROPIC_API_KEY     — your Anthropic API key (optional)")
    print("=" * 60)
    print("""
Once all secrets are added:
  → Go to GitHub → Actions → "Lumus Daily Gmail Drafts" → Run workflow
  to test it runs correctly. After that it runs automatically at 7am.
""")

    # Clean up credentials file (contains sensitive data)
    try:
        os.remove(creds_file)
        print("(credentials.json deleted — no longer needed)\n")
    except Exception:
        print(f"(Remember to delete credentials.json from {creds_file})\n")


if __name__ == "__main__":
    main()

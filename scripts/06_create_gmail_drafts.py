#!/usr/bin/env python3
"""
Lumus Gmail Draft Creator — Step 6
Reads HOT/WARM leads from the current week's CSV and creates Gmail drafts
for every lead that has an email address and hasn't had a draft created yet.

Requires environment variables:
  GMAIL_CLIENT_ID       — OAuth2 client ID from Google Cloud Console
  GMAIL_CLIENT_SECRET   — OAuth2 client secret
  GMAIL_REFRESH_TOKEN   — Refresh token (obtained once via auth setup)

HOW TO USE:
  python3 scripts/06_create_gmail_drafts.py

INPUT:
  leads/leads_YYYY-WW.csv  — current week's leads (with Email Version A populated)

OUTPUT:
  Gmail Drafts — one per HOT/WARM lead with a valid email address
  data/gmail_drafts_log.json — tracks which businesses already have drafts (avoids dupes)
"""

import base64
import csv
import json
import os
import sys
from datetime import datetime
from email.mime.text import MIMEText

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DATA_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DRAFTS_LOG = os.path.join(DATA_DIR, "gmail_drafts_log.json")

# Priority labels to include (skip COLD leads)
INCLUDE_PRIORITIES = {"HOT", "WARM"}


# ── Auth ───────────────────────────────────────────────────────────────────────

def get_gmail_service():
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        print("[gmail] google-api-python-client not installed.")
        print("  Run: pip install google-api-python-client google-auth")
        sys.exit(1)

    required = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"]
    missing = [v for v in required if not os.environ.get(v)]
    if missing:
        print(f"[gmail] Missing environment variables: {', '.join(missing)}")
        print("  See docs/gmail_setup.md for setup instructions.")
        sys.exit(1)

    creds = Credentials(
        token=None,
        refresh_token=os.environ["GMAIL_REFRESH_TOKEN"],
        client_id=os.environ["GMAIL_CLIENT_ID"],
        client_secret=os.environ["GMAIL_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/gmail.compose"],
    )
    return build("gmail", "v1", credentials=creds)


# ── Draft log (prevents duplicates) ───────────────────────────────────────────

def load_drafts_log() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DRAFTS_LOG):
        with open(DRAFTS_LOG) as f:
            return json.load(f)
    return {}


def save_drafts_log(log: dict):
    with open(DRAFTS_LOG, "w") as f:
        json.dump(log, f, indent=2)


# ── CSV reading ────────────────────────────────────────────────────────────────

def get_current_week_csv() -> str | None:
    files = sorted([f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")])
    return os.path.join(LEADS_DIR, files[-1]) if files else None


def load_leads(filepath: str) -> list[dict]:
    rows = []
    with open(filepath, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row.get("Business Name", "").strip()
            email = row.get("Email", "").strip()
            priority = row.get("Priority Score", "").strip()
            label = priority.split()[0] if priority else ""
            if name and email and label in INCLUDE_PRIORITIES:
                rows.append(dict(row))
    return rows


# ── Template fallback (for WARM leads with no Email Version A) ────────────────

def _build_email_body(lead: dict) -> str:
    from config.lumus_config import AGENCY_EMAIL, AGENCY_WEBSITE
    name     = lead.get("Business Name", "your business")
    sector   = lead.get("Sector", "local business").lower()
    location = lead.get("Location", "your area")
    weakness = lead.get("Main Weakness", "limited online presence")
    service  = lead.get("Recommended Lumus Service", "digital presence")
    angle    = lead.get("Outreach Angle", weakness)

    return (
        f"Hi,\n\n"
        f"I was looking at {sector}s in {location} and came across {name}.\n\n"
        f"{angle}.\n\n"
        f"At Lumus we help local businesses fix this quickly — no jargon, no long contracts. "
        f"Specifically, we'd look at your {service.lower()} and get it working properly within a few weeks.\n\n"
        f"Worth a quick 15-minute call?\n\n"
        f"— Lumus\n{AGENCY_EMAIL} | {AGENCY_WEBSITE}"
    )


def _build_subject(lead: dict) -> str:
    name = lead.get("Business Name", "your business")
    weakness = lead.get("Main Weakness", "")
    if "No website" in weakness and "No Google" in weakness:
        return f"{name} — invisible online right now"
    elif "No website" in weakness:
        return f"{name} — one thing costing you customers right now"
    elif "No Google" in weakness:
        return f"{name} — not showing up on Google Maps"
    return f"{name} — one thing costing you customers right now"


# ── Draft creation ─────────────────────────────────────────────────────────────

def create_draft(service, to_email: str, subject: str, body: str) -> str:
    msg = MIMEText(body)
    msg["to"] = to_email
    msg["subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    result = service.users().drafts().create(
        userId="me",
        body={"message": {"raw": raw}},
    ).execute()
    return result.get("id", "")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Lumus Gmail Draft Creator")
    print("-" * 40)

    csv_path = get_current_week_csv()
    if not csv_path:
        print("[gmail] No leads CSV found in leads/ — run 01_find_leads.py first.")
        sys.exit(0)

    print(f"Reading: {os.path.basename(csv_path)}")
    leads = load_leads(csv_path)

    if not leads:
        print("[gmail] No HOT/WARM leads with email addresses found.")
        sys.exit(0)

    print(f"Found {len(leads)} leads with email addresses")

    drafts_log = load_drafts_log()
    service = get_gmail_service()

    created = 0
    skipped = 0

    for lead in leads:
        name  = lead.get("Business Name", "").strip()
        email = lead.get("Email", "").strip()
        week  = os.path.basename(csv_path).replace("leads_", "").replace(".csv", "")
        log_key = f"{week}::{name}"

        if log_key in drafts_log:
            print(f"  [skip] Draft already created for: {name}")
            skipped += 1
            continue

        # Use Email Version A if available; fall back to template
        email_a = lead.get("Email Version A", "").strip()
        if email_a and "\n\n" in email_a:
            lines = email_a.split("\n")
            subject_line = next((l for l in lines if l.lower().startswith("subject:")), "")
            subject = subject_line.replace("Subject:", "").replace("subject:", "").strip()
            body = "\n".join(l for l in lines if not l.lower().startswith("subject:")).strip()
        else:
            subject = _build_subject(lead)
            body    = _build_email_body(lead)

        try:
            draft_id = create_draft(service, email, subject, body)
            drafts_log[log_key] = {
                "draft_id": draft_id,
                "email": email,
                "subject": subject,
                "created_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
            }
            print(f"  [OK] Draft created: {name} → {email}")
            created += 1
        except Exception as e:
            print(f"  [ERROR] Failed for {name}: {e}")

    save_drafts_log(drafts_log)
    print()
    print(f"[gmail] Done — {created} new drafts created, {skipped} skipped (already done)")


if __name__ == "__main__":
    main()

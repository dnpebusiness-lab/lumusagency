#!/usr/bin/env python3
"""
Lumus Instagram DM Brief — Step 7
Reads HOT/WARM leads with Instagram handles from the current week's CSV,
generates personalized DM text for each, and emails a formatted copy-paste
brief to the Lumus owner every morning.

Requires environment variables:
  GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
  ANTHROPIC_API_KEY (optional — falls back to templates if absent)

OUTPUT:
  One email to dnpebusiness@gmail.com with all DMs ready to copy-paste.
  data/dm_brief_log.json — tracks which businesses were already briefed.
"""

import base64
import csv
import json
import os
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import AGENCY_EMAIL, AGENCY_NAME

LEADS_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DATA_DIR   = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DM_LOG     = os.path.join(DATA_DIR, "dm_brief_log.json")
OWNER_EMAIL = "dnpebusiness@gmail.com"
INCLUDE_PRIORITIES = {"HOT", "WARM"}


# ── Auth ───────────────────────────────────────────────────────────────────────

def get_gmail_service():
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        print("[dm-brief] google-api-python-client not installed — pip install google-api-python-client google-auth")
        sys.exit(1)

    missing = [v for v in ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"] if not os.environ.get(v)]
    if missing:
        print(f"[dm-brief] Missing env vars: {', '.join(missing)}")
        sys.exit(1)

    creds = Credentials(
        token=None,
        refresh_token=os.environ["GMAIL_REFRESH_TOKEN"],
        client_id=os.environ["GMAIL_CLIENT_ID"],
        client_secret=os.environ["GMAIL_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )
    return build("gmail", "v1", credentials=creds)


# ── DM log ─────────────────────────────────────────────────────────────────────

def load_dm_log() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    return json.load(open(DM_LOG)) if os.path.exists(DM_LOG) else {}


def save_dm_log(log: dict):
    with open(DM_LOG, "w") as f:
        json.dump(log, f, indent=2)


# ── Lead loading ───────────────────────────────────────────────────────────────

def get_current_csv() -> str | None:
    files = sorted([f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")])
    return os.path.join(LEADS_DIR, files[-1]) if files else None


def load_instagram_leads(filepath: str) -> list[dict]:
    rows = []
    with open(filepath, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name     = row.get("Business Name", "").strip()
            handle   = row.get("Instagram", "").strip()
            priority = row.get("Priority Score", "").strip()
            label    = priority.split()[0] if priority else ""
            if name and handle and handle.lower() not in ("none", "n/a", "-", ""):
                if label in INCLUDE_PRIORITIES:
                    rows.append(dict(row))
    # HOT leads first
    rows.sort(key=lambda r: 0 if r.get("Priority Score", "").startswith("HOT") else 1)
    return rows


# ── DM generation ─────────────────────────────────────────────────────────────

def _template_dm(lead: dict) -> str:
    name     = lead.get("Business Name", "")
    sector   = lead.get("Sector", "local business").lower()
    location = lead.get("Location", "your area")
    service  = lead.get("Recommended Lumus Service", "digital presence").lower()
    weakness = lead.get("Main Weakness", "")
    notes    = lead.get("Notes", "")

    # Pick a specific opening hook based on what we know
    if "followers" in notes:
        import re
        m = re.search(r"([\d,]+)\s+followers", notes)
        followers = m.group(1) if m else ""
        hook = f"Hi! {name} came up while I was looking at {sector}s in {location} — {followers} followers is impressive."
    elif "years" in notes:
        import re
        m = re.search(r"(\d+)\s+years", notes)
        years = m.group(1) if m else ""
        hook = f"Hi! Came across {name} — {years} years in {location}, that's brilliant."
    else:
        hook = f"Hi! Came across {name} while looking at {sector}s in {location}."

    if "No Google" in weakness and "No website" in weakness:
        problem = "Quick question — have you thought about getting a Google listing and website sorted? You're missing people who search for you online."
    elif "No Google" in weakness:
        problem = "Quick question — have you set up a Google Business Profile yet? People searching in {location} can't find you on Maps right now.".format(location=location)
    elif "No website" in weakness:
        problem = f"Quick question — have you sorted a website yet? A lot of {sector}s lose bookings without one."
    else:
        problem = f"Quick question — have you looked at your {service} recently? There's a straightforward fix that could bring in more customers."

    return f"{hook}\n\n{problem}\n\nHappy to share a few ideas if you're curious — no strings. — Lumus"


def _claude_dm(lead: dict) -> str | None:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return None
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        name     = lead.get("Business Name", "")
        sector   = lead.get("Sector", "")
        location = lead.get("Location", "")
        weakness = lead.get("Main Weakness", "")
        notes    = lead.get("Notes", "")
        service  = lead.get("Recommended Lumus Service", "")

        prompt = (
            f"Business: {name} | Sector: {sector} | Location: {location}\n"
            f"Main weakness: {weakness}\n"
            f"Research notes: {notes}\n"
            f"Recommended service: {service}\n\n"
            f"Write an Instagram DM to this business from Lumus, a small marketing agency in Galway.\n"
            f"Rules:\n"
            f"- Under 80 words total\n"
            f"- Open with something specific about THIS business (from the notes above)\n"
            f"- One concrete question or offer — not a pitch\n"
            f"- Friendly, like a real person from Galway — not a sales template\n"
            f"- End with '— Lumus'\n"
            f"- No subject line, no labels, just the message"
        )
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            system="You write short Instagram DMs for a local marketing agency. Sound human, specific, not salesy. British/Irish English.",
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text.strip()
    except Exception as e:
        print(f"  [dm-brief] Claude error for {lead.get('Business Name')}: {e}")
        return None


def get_dm_text(lead: dict) -> str:
    # Try existing DM from CSV first
    existing = lead.get("Instagram DM", "").strip()
    if existing and len(existing) > 30:
        return existing

    # Try Claude, fall back to template
    claude_dm = _claude_dm(lead)
    return claude_dm if claude_dm else _template_dm(lead)


# ── Email building ─────────────────────────────────────────────────────────────

def build_email(leads_with_dms: list[tuple]) -> tuple[str, str, str]:
    today = datetime.now().strftime("%A %d %b")
    count = len(leads_with_dms)
    subject = f"Lumus — {count} Instagram DM{'s' if count != 1 else ''} for today ({today})"

    # Plain text version
    plain_lines = [
        f"Morning! Here are today's {count} Instagram DM{'s' if count != 1 else ''} — copy each one, find the account on Instagram, paste and send.",
        "",
    ]
    for i, (lead, dm) in enumerate(leads_with_dms, 1):
        handle   = lead.get("Instagram", "").strip()
        name     = lead.get("Business Name", "").strip()
        sector   = lead.get("Sector", "")
        location = lead.get("Location", "")
        priority = lead.get("Priority Score", "").split()[0]
        plain_lines += [
            f"{'─' * 50}",
            f"{i}. {handle}  [{priority}]",
            f"   {name} | {sector} | {location}",
            "",
            dm,
            "",
        ]
    plain_lines += [
        "─" * 50,
        "Leads with no Instagram handle need a phone call or email instead.",
        "",
        "— Lumus system",
    ]
    plain_body = "\n".join(plain_lines)

    # HTML version
    items_html = ""
    for i, (lead, dm) in enumerate(leads_with_dms, 1):
        handle   = lead.get("Instagram", "").strip()
        name     = lead.get("Business Name", "").strip()
        sector   = lead.get("Sector", "")
        location = lead.get("Location", "")
        priority = lead.get("Priority Score", "").split()[0]
        badge_color = "#c0392b" if priority == "HOT" else "#e67e22"
        dm_escaped = dm.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
        items_html += f"""
        <div style="border:1px solid #ddd;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:18px;font-weight:700;color:#222;">{i}. {handle}</span>
            <span style="background:{badge_color};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">{priority}</span>
          </div>
          <div style="color:#888;font-size:13px;margin-bottom:14px;">{name} &nbsp;·&nbsp; {sector} &nbsp;·&nbsp; {location}</div>
          <div style="background:#f7f7f7;border-left:3px solid #2c3e50;padding:14px;border-radius:4px;font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#333;">{dm_escaped}</div>
          <div style="margin-top:10px;font-size:12px;color:#aaa;">Copy the message above → open Instagram → find {handle} → send as DM</div>
        </div>"""

    html_body = f"""<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#2c3e50;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
    <div style="font-size:20px;font-weight:700;">Lumus — Instagram DMs</div>
    <div style="font-size:13px;opacity:0.8;margin-top:4px;">{today} &nbsp;·&nbsp; {count} to send</div>
  </div>
  <p style="color:#555;margin-bottom:24px;">Copy each message below, find the account on Instagram, and send as a DM. Takes about 5 minutes total.</p>
  {items_html}
  <div style="border-top:1px solid #eee;margin-top:24px;padding-top:16px;font-size:12px;color:#aaa;">
    Lumus automated brief &nbsp;·&nbsp; {AGENCY_EMAIL}
  </div>
</body></html>"""

    return subject, plain_body, html_body


def send_email(service, subject: str, plain_body: str, html_body: str):
    msg = MIMEMultipart("alternative")
    msg["to"]      = OWNER_EMAIL
    msg["from"]    = OWNER_EMAIL
    msg["subject"] = subject
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Lumus Instagram DM Brief")
    print("-" * 40)

    csv_path = get_current_csv()
    if not csv_path:
        print("[dm-brief] No leads CSV found — run 01_find_leads.py first.")
        sys.exit(0)

    print(f"Reading: {os.path.basename(csv_path)}")
    leads = load_instagram_leads(csv_path)

    if not leads:
        print("[dm-brief] No HOT/WARM leads with Instagram handles today — nothing to send.")
        sys.exit(0)

    dm_log  = load_dm_log()
    week    = os.path.basename(csv_path).replace("leads_", "").replace(".csv", "")
    today   = datetime.now().strftime("%Y-%m-%d")

    to_send = []
    for lead in leads:
        name    = lead.get("Business Name", "").strip()
        log_key = f"{today}::{name}"
        if log_key in dm_log:
            print(f"  [skip] Already briefed today: {name}")
            continue
        dm_text = get_dm_text(lead)
        to_send.append((lead, dm_text))
        print(f"  [OK] DM ready: {name} → {lead.get('Instagram')}")

    if not to_send:
        print("[dm-brief] All leads already briefed today.")
        sys.exit(0)

    service = get_gmail_service()
    subject, plain_body, html_body = build_email(to_send)
    send_email(service, subject, plain_body, html_body)

    for lead, _ in to_send:
        name = lead.get("Business Name", "").strip()
        dm_log[f"{today}::{name}"] = {"sent_at": datetime.now().strftime("%d/%m/%Y %H:%M")}
    save_dm_log(dm_log)

    print(f"\n[dm-brief] Brief sent to {OWNER_EMAIL} — {len(to_send)} DM{'s' if len(to_send) != 1 else ''} included")


if __name__ == "__main__":
    main()

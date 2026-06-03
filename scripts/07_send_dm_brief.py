#!/usr/bin/env python3
"""
Lumus Instagram DM Brief — Step 7
Reads HOT/WARM leads with Instagram handles from the current week's CSV,
generates personalized DM text, and emails a copy-paste brief to the owner.

Requires environment variables:
  GMAIL_APP_PASSWORD  — Gmail App Password (myaccount.google.com/apppasswords)
  GMAIL_USER          — your Gmail address (defaults to dnpebusiness@gmail.com)
  ANTHROPIC_API_KEY   — optional, improves DM personalisation

OUTPUT:
  One email to GMAIL_USER with all DMs ready to copy-paste into Instagram.
  data/dm_brief_log.json — tracks which businesses were already briefed today.
"""

import csv
import json
import os
import re
import smtplib
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import AGENCY_EMAIL

LEADS_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DATA_DIR   = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DM_LOG     = os.path.join(DATA_DIR, "dm_brief_log.json")
DEFAULT_USER = "dnpebusiness@gmail.com"
INCLUDE_PRIORITIES = {"HOT", "WARM"}


# ── Auth ───────────────────────────────────────────────────────────────────────

def get_smtp(gmail_user: str, app_password: str):
    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp.login(gmail_user, app_password)
    return smtp


# ── Log ────────────────────────────────────────────────────────────────────────

def load_log() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    return json.load(open(DM_LOG)) if os.path.exists(DM_LOG) else {}


def save_log(log: dict):
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

    if "followers" in notes:
        m = re.search(r"([\d,]+)\s+followers", notes)
        followers = m.group(1) if m else ""
        hook = f"Hi! {name} came up while I was looking at {sector}s in {location} — {followers} followers is impressive."
    elif "years" in notes:
        m = re.search(r"(\d+)\s+years", notes)
        years = m.group(1) if m else ""
        hook = f"Hi! Came across {name} — {years} years in {location}, that's brilliant."
    else:
        hook = f"Hi! Came across {name} while looking at {sector}s in {location}."

    if "No Google" in weakness and "No website" in weakness:
        problem = "Quick question — have you thought about getting a Google listing and website sorted? You're missing people who search for you online."
    elif "No Google" in weakness:
        problem = f"Quick question — have you set up a Google Business Profile yet? People searching in {location} can't find you on Maps right now."
    elif "No website" in weakness:
        problem = f"Quick question — have you sorted a website yet? A lot of {sector}s lose bookings without one."
    else:
        problem = f"Quick question — have you looked at your {service} recently? There's a fix that could bring in more customers."

    return f"{hook}\n\n{problem}\n\nHappy to share a few ideas — no strings. — Lumus"


def _claude_dm(lead: dict) -> str | None:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return None
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        prompt = (
            f"Business: {lead.get('Business Name')} | Sector: {lead.get('Sector')} | Location: {lead.get('Location')}\n"
            f"Main weakness: {lead.get('Main Weakness')}\n"
            f"Research notes: {lead.get('Notes')}\n"
            f"Recommended service: {lead.get('Recommended Lumus Service')}\n\n"
            f"Write an Instagram DM from Lumus (small marketing agency, Galway).\n"
            f"Rules: under 80 words · open with something specific about THIS business · "
            f"one question or offer · friendly, not salesy · British/Irish English · end with '— Lumus' · no labels"
        )
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            system="Write short Instagram DMs for a local marketing agency. Sound human and specific. British/Irish English.",
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.content[0].text.strip()
    except Exception as e:
        print(f"  [dm-brief] Claude error for {lead.get('Business Name')}: {e}")
        return None


def get_dm_text(lead: dict) -> str:
    existing = lead.get("Instagram DM", "").strip()
    if existing and len(existing) > 30:
        return existing
    return _claude_dm(lead) or _template_dm(lead)


# ── Email building ─────────────────────────────────────────────────────────────

def build_email(leads_with_dms: list[tuple]) -> tuple[str, str, str]:
    today   = datetime.now().strftime("%A %d %b")
    count   = len(leads_with_dms)
    subject = f"Lumus — {count} Instagram DM{'s' if count != 1 else ''} for today ({today})"

    plain_lines = [
        f"Morning! {count} Instagram DM{'s' if count != 1 else ''} ready to send.",
        "Copy each message, find the account on Instagram, paste and send.",
        "",
    ]
    items_html = ""

    for i, (lead, dm) in enumerate(leads_with_dms, 1):
        handle   = lead.get("Instagram", "").strip()
        name     = lead.get("Business Name", "").strip()
        sector   = lead.get("Sector", "")
        location = lead.get("Location", "")
        priority = lead.get("Priority Score", "").split()[0]
        plain_lines += [
            "─" * 50,
            f"{i}. {handle}  [{priority}]",
            f"   {name} | {sector} | {location}",
            "",
            dm,
            "",
        ]
        badge  = "#c0392b" if priority == "HOT" else "#e67e22"
        dm_esc = dm.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\n","<br>")
        items_html += f"""
        <div style="border:1px solid #ddd;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:17px;font-weight:700;color:#222;">{i}. {handle}</span>
            <span style="background:{badge};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;">{priority}</span>
          </div>
          <div style="color:#888;font-size:13px;margin-bottom:12px;">{name} &nbsp;·&nbsp; {sector} &nbsp;·&nbsp; {location}</div>
          <div style="background:#f7f7f7;border-left:3px solid #2c3e50;padding:14px;border-radius:4px;font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#333;">{dm_esc}</div>
          <div style="margin-top:8px;font-size:12px;color:#aaa;">Copy above → Instagram → {handle} → send as DM</div>
        </div>"""

    plain_body = "\n".join(plain_lines)
    html_body  = f"""<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#2c3e50;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
    <div style="font-size:20px;font-weight:700;">Lumus — Instagram DMs</div>
    <div style="font-size:13px;opacity:0.8;margin-top:4px;">{today} &nbsp;·&nbsp; {count} to send</div>
  </div>
  <p style="color:#555;margin-bottom:20px;">Copy each message, find the account on Instagram, paste and send. ~5 minutes total.</p>
  {items_html}
  <div style="border-top:1px solid #eee;margin-top:24px;padding-top:14px;font-size:12px;color:#aaa;">Lumus automated brief &nbsp;·&nbsp; {AGENCY_EMAIL}</div>
</body></html>"""

    return subject, plain_body, html_body


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Lumus Instagram DM Brief")
    print("-" * 40)

    app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    gmail_user   = os.environ.get("GMAIL_USER", DEFAULT_USER)
    if not app_password:
        print("[dm-brief] GMAIL_APP_PASSWORD not set.")
        print("  Go to myaccount.google.com/apppasswords → create 'Lumus' → add as GitHub secret.")
        sys.exit(1)

    csv_path = get_current_csv()
    if not csv_path:
        print("[dm-brief] No leads CSV found.")
        sys.exit(0)

    print(f"Reading: {os.path.basename(csv_path)}")
    leads = load_instagram_leads(csv_path)
    if not leads:
        print("[dm-brief] No HOT/WARM leads with Instagram handles today.")
        sys.exit(0)

    log   = load_log()
    today = datetime.now().strftime("%Y-%m-%d")

    to_send = []
    for lead in leads:
        name    = lead.get("Business Name", "").strip()
        log_key = f"{today}::{name}"
        if log_key in log:
            print(f"  [skip] Already briefed today: {name}")
            continue
        dm_text = get_dm_text(lead)
        to_send.append((lead, dm_text))
        print(f"  [OK] DM ready: {name} → {lead.get('Instagram')}")

    if not to_send:
        print("[dm-brief] All leads already briefed today.")
        sys.exit(0)

    subject, plain, html = build_email(to_send)
    smtp = get_smtp(gmail_user, app_password)
    msg  = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = gmail_user
    msg["To"]      = gmail_user
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))
    smtp.sendmail(gmail_user, gmail_user, msg.as_string())
    smtp.quit()

    for lead, _ in to_send:
        name = lead.get("Business Name", "").strip()
        log[f"{today}::{name}"] = {"sent_at": datetime.now().strftime("%d/%m/%Y %H:%M")}
    save_log(log)

    print(f"\n[dm-brief] Brief sent to {gmail_user} — {len(to_send)} DM{'s' if len(to_send)!=1 else ''} included")


if __name__ == "__main__":
    main()

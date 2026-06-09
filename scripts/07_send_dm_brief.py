#!/usr/bin/env python3
"""
Lumus Instagram DM Brief — Step 7
Emails 10 Instagram DMs to the owner every morning at 10am.
Each DM is specific to that business. No em dashes. No AI clichés.

Requires:
  GMAIL_APP_PASSWORD  — Gmail App Password
  GMAIL_USER          — your Gmail (default: dnpebusiness@gmail.com)
  ANTHROPIC_API_KEY   — optional, improves DM quality

OUTPUT:
  Email to GMAIL_USER with 10 copy-paste DMs.
  data/dm_brief_log.json — tracks which businesses were already sent today.
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

LEADS_DIR    = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DATA_DIR     = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DM_LOG       = os.path.join(DATA_DIR, "dm_brief_log.json")
DEFAULT_USER = "lumus.marketing.agency@gmail.com"
DMS_PER_DAY  = 10
INCLUDE_PRIORITIES = {"HOT", "WARM"}


# ── Auth ───────────────────────────────────────────────────────────────────────

def get_smtp(user: str, password: str):
    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp.login(user, password)
    return smtp


# ── Log ────────────────────────────────────────────────────────────────────────

def load_log() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    return json.load(open(DM_LOG)) if os.path.exists(DM_LOG) else {}


def save_log(log: dict):
    with open(DM_LOG, "w") as f:
        json.dump(log, f, indent=2)


# ── Lead loading ───────────────────────────────────────────────────────────────

def get_all_csvs() -> list[str]:
    files = sorted([
        os.path.join(LEADS_DIR, f)
        for f in os.listdir(LEADS_DIR)
        if f.startswith("leads_") and f.endswith(".csv")
    ])
    return files


def load_instagram_leads() -> list[dict]:
    rows = []
    seen = set()
    for filepath in get_all_csvs():
        with open(filepath, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                name     = row.get("Business Name", "").strip()
                handle   = row.get("Instagram", "").strip()
                priority = row.get("Priority Score", "").strip()
                label    = priority.split()[0] if priority else ""
                if (name and handle
                        and handle.lower() not in ("none", "n/a", "-", "")
                        and label in INCLUDE_PRIORITIES
                        and name not in seen):
                    seen.add(name)
                    rows.append(dict(row))
    # HOT first, then WARM
    rows.sort(key=lambda r: 0 if r.get("Priority Score", "").startswith("HOT") else 1)
    return rows


# ── DM generation ─────────────────────────────────────────────────────────────

def _template_dm(lead: dict) -> str:
    name     = lead.get("Business Name", "")
    sector   = lead.get("Sector", "local business").lower()
    location = lead.get("Location", "your area")
    weakness = lead.get("Main Weakness", "")
    notes    = lead.get("Notes", "")

    # Specific opening based on what we know about the business
    if "followers" in notes:
        m = re.search(r"([\d,]+)\s+followers", notes)
        followers = m.group(1) if m else ""
        opening = f"Hi! Came across {name} while looking at {sector}s in {location}. {followers} followers is seriously impressive."
    elif "years" in notes:
        m = re.search(r"(\d+)\s+years", notes)
        years = m.group(1) if m else ""
        opening = f"Hi! Came across {name}. {years} years in {location} is no joke, well done."
    else:
        opening = f"Hi! Came across {name} while looking at {sector}s in {location}."

    # Specific problem
    if "No Google" in weakness and "No website" in weakness:
        problem = f"Quick question. You have got a great Instagram but no Google listing or website. Anyone searching for a {sector} in {location} online right now won't find you."
    elif "No Google" in weakness:
        problem = f"Quick question. No Google Business Profile found for {name}. People searching in {location} on Maps can't find you even if they've heard of you."
    elif "No website" in weakness:
        problem = f"Quick question. No website found for {name}. A lot of {sector}s in {location} lose bookings just because of this."
    else:
        problem = f"Quick question. Noticed a gap in {name}'s online presence that's probably costing you customers."

    return f"{opening}\n\n{problem}\n\nHappy to share a few ideas if you're interested, no strings attached. Lumus"


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
            f"Business: {name}\n"
            f"Sector: {sector}\n"
            f"Location: {location}\n"
            f"Main weakness: {weakness}\n"
            f"Notes: {notes}\n"
            f"Service we offer: {service}\n\n"
            f"Write an Instagram DM from Lumus, a small marketing agency in Galway, Ireland.\n"
            f"The DM goes to this specific business."
        )

        system = """You write Instagram DMs for Lumus, a small marketing agency in Galway, Ireland.

Rules you must follow without exception:
- Under 80 words
- Never use em dashes or hyphens as punctuation (no — or --)
- Open with something specific about THIS business from the notes, not a generic line
- Ask one question or make one offer, not multiple
- Sound like a real person from Galway, casual and direct
- British and Irish English only
- Sign off with just "Lumus" on its own line, nothing else
- No subject line, no labels, no commentary, just the message
- Short sentences. No filler words. No "I hope this finds you well" type openers."""

        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        text = resp.content[0].text.strip()
        # Safety strip: remove any em dashes that slipped through
        text = text.replace(" — ", " ").replace("—", "")
        return text
    except Exception as e:
        print(f"  [dm-brief] Claude error for {lead.get('Business Name')}: {e}")
        return None


def get_dm(lead: dict) -> str:
    existing = lead.get("Instagram DM", "").strip()
    if existing and len(existing) > 30:
        # Clean dashes from existing DMs too
        return existing.replace(" — ", " ").replace("—", "")
    dm = _claude_dm(lead) or _template_dm(lead)
    return dm.replace(" — ", " ").replace("—", "")


# ── Email building ─────────────────────────────────────────────────────────────

def build_email(leads_with_dms: list[tuple]) -> tuple[str, str, str]:
    today   = datetime.now().strftime("%A %d %b")
    count   = len(leads_with_dms)
    subject = f"Lumus — {count} Instagram DMs ({today})"

    plain_lines = [
        f"Morning. {count} Instagram DMs ready to send.",
        "Copy each one, find the account, paste and send.",
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
            "─" * 48,
            f"{i}. {handle}  [{priority}]",
            f"   {name} | {sector} | {location}",
            "",
            dm,
            "",
        ]

        badge    = "#c0392b" if priority == "HOT" else "#e67e22"
        dm_esc   = dm.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\n","<br>")
        items_html += f"""
        <div style="border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="font-size:16px;font-weight:700;color:#111;">{i}. {handle}</span>
            <span style="background:{badge};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:.5px;">{priority}</span>
          </div>
          <div style="color:#999;font-size:12px;margin-bottom:12px;">{name} &nbsp;&middot;&nbsp; {sector} &nbsp;&middot;&nbsp; {location}</div>
          <div style="background:#f9f9f9;border-left:3px solid #2c3e50;padding:14px 16px;border-radius:4px;font-size:15px;line-height:1.65;color:#333;">{dm_esc}</div>
          <div style="margin-top:8px;font-size:11px;color:#bbb;">Copy text above &rarr; Instagram &rarr; {handle} &rarr; send as DM</div>
        </div>"""

    plain_body = "\n".join(plain_lines)
    html_body  = f"""<!DOCTYPE html>
<html><body style="font-family:-apple-system,Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#333;background:#fff;">
  <div style="background:#1a252f;color:#fff;padding:18px 22px;border-radius:8px;margin-bottom:24px;">
    <div style="font-size:18px;font-weight:700;letter-spacing:-.3px;">Lumus &nbsp; Instagram DMs</div>
    <div style="font-size:12px;opacity:.65;margin-top:4px;">{today} &nbsp;&middot;&nbsp; {count} to send</div>
  </div>
  <p style="color:#666;font-size:14px;margin-bottom:20px;">Copy each message, find the account on Instagram, paste and send.</p>
  {items_html}
  <div style="border-top:1px solid #eee;margin-top:24px;padding-top:14px;font-size:11px;color:#ccc;">Lumus &nbsp;&middot;&nbsp; {AGENCY_EMAIL}</div>
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
        print("  myaccount.google.com/apppasswords -> create Lumus -> add as GitHub secret")
        sys.exit(1)

    leads = load_instagram_leads()
    if not leads:
        print("[dm-brief] No HOT/WARM leads with Instagram handles found.")
        sys.exit(0)

    print(f"Found {len(leads)} leads with Instagram handles")

    log   = load_log()
    today = datetime.now().strftime("%Y-%m-%d")

    pending = []
    for lead in leads:
        name    = lead.get("Business Name", "").strip()
        log_key = f"{today}::{name}"
        if log_key not in log:
            pending.append(lead)

    if not pending:
        print("[dm-brief] All leads already briefed today.")
        sys.exit(0)

    # Take up to DMS_PER_DAY
    to_send = pending[:DMS_PER_DAY]
    print(f"Preparing {len(to_send)} DMs ({len(pending)} pending, {DMS_PER_DAY} max per day)")

    leads_with_dms = []
    for lead in to_send:
        name = lead.get("Business Name", "").strip()
        dm   = get_dm(lead)
        leads_with_dms.append((lead, dm))
        print(f"  [OK] {name} -> {lead.get('Instagram')}")

    subject, plain, html = build_email(leads_with_dms)

    smtp = get_smtp(gmail_user, app_password)
    msg  = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = gmail_user
    msg["To"]      = gmail_user
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))
    smtp.sendmail(gmail_user, gmail_user, msg.as_string())
    smtp.quit()

    for lead, _ in leads_with_dms:
        name = lead.get("Business Name", "").strip()
        log[f"{today}::{name}"] = {"sent_at": datetime.now().strftime("%d/%m/%Y %H:%M")}
    save_log(log)

    print(f"\n[dm-brief] Sent to {gmail_user} — {len(leads_with_dms)} DMs")


if __name__ == "__main__":
    main()

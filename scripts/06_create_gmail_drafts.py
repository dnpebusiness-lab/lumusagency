#!/usr/bin/env python3
"""
Lumus Gmail Outreach Sender — Step 6
Reads HOT/WARM leads with email addresses from the current week's CSV and
sends a daily outreach brief to the Lumus owner (dnpebusiness@gmail.com)
with all email copy ready to review and forward.

Requires environment variables:
  GMAIL_APP_PASSWORD  — Gmail App Password (myaccount.google.com/apppasswords)
  GMAIL_USER          — your Gmail address (defaults to dnpebusiness@gmail.com)

HOW TO USE:
  python3 scripts/06_create_gmail_drafts.py

OUTPUT:
  One email to GMAIL_USER with all outreach copy for leads with emails.
  data/gmail_drafts_log.json — tracks which businesses already sent (avoids dupes)
"""

import csv
import json
import os
import smtplib
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LEADS_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DATA_DIR   = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DRAFTS_LOG = os.path.join(DATA_DIR, "gmail_drafts_log.json")
INCLUDE_PRIORITIES = {"HOT", "WARM"}
DEFAULT_USER = "dnpebusiness@gmail.com"


# ── Auth ───────────────────────────────────────────────────────────────────────

def get_smtp_connection():
    app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    gmail_user   = os.environ.get("GMAIL_USER", DEFAULT_USER)
    if not app_password:
        print("[outreach] GMAIL_APP_PASSWORD not set.")
        print("  Go to myaccount.google.com/apppasswords → create 'Lumus' → add as GitHub secret.")
        sys.exit(1)
    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp.login(gmail_user, app_password)
    return smtp, gmail_user


# ── Log (prevents duplicates) ──────────────────────────────────────────────────

def load_log() -> dict:
    os.makedirs(DATA_DIR, exist_ok=True)
    return json.load(open(DRAFTS_LOG)) if os.path.exists(DRAFTS_LOG) else {}


def save_log(log: dict):
    with open(DRAFTS_LOG, "w") as f:
        json.dump(log, f, indent=2)


# ── CSV reading ────────────────────────────────────────────────────────────────

def get_current_csv() -> str | None:
    files = sorted([f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")])
    return os.path.join(LEADS_DIR, files[-1]) if files else None


def load_email_leads(filepath: str) -> list[dict]:
    rows = []
    with open(filepath, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name     = row.get("Business Name", "").strip()
            email    = row.get("Email", "").strip()
            priority = row.get("Priority Score", "").strip()
            label    = priority.split()[0] if priority else ""
            if name and email and label in INCLUDE_PRIORITIES:
                rows.append(dict(row))
    rows.sort(key=lambda r: 0 if r.get("Priority Score", "").startswith("HOT") else 1)
    return rows


# ── Template fallback ──────────────────────────────────────────────────────────

def _build_email_body(lead: dict) -> str:
    from config.lumus_config import AGENCY_EMAIL, AGENCY_WEBSITE
    name     = lead.get("Business Name", "your business")
    sector   = lead.get("Sector", "local business").lower()
    location = lead.get("Location", "your area")
    weakness = lead.get("Main Weakness", "limited online presence")
    service  = lead.get("Recommended Lumus Service", "digital presence")
    return (
        f"Hi,\n\n"
        f"I was looking at {sector}s in {location} and came across {name}.\n\n"
        f"{weakness}.\n\n"
        f"At Lumus we help local businesses fix this quickly — no jargon, no long contracts. "
        f"Specifically, we'd look at your {service.lower()} and get it working properly within a few weeks.\n\n"
        f"Worth a quick 15-minute call?\n\n"
        f"— Lumus\n{AGENCY_EMAIL} | {AGENCY_WEBSITE}"
    )


def _build_subject(lead: dict) -> str:
    name     = lead.get("Business Name", "your business")
    weakness = lead.get("Main Weakness", "")
    if "No website" in weakness and "No Google" in weakness:
        return f"{name} — invisible online right now"
    elif "No Google" in weakness:
        return f"{name} — not showing up on Google Maps"
    return f"{name} — one thing costing you customers right now"


# ── Email building ─────────────────────────────────────────────────────────────

def build_brief(leads: list[dict]) -> tuple[str, str, str]:
    today   = datetime.now().strftime("%A %d %b")
    count   = len(leads)
    subject = f"Lumus — {count} email outreach ready ({today})"

    plain_lines = [
        f"Morning! {count} lead{'s' if count != 1 else ''} with email addresses today.",
        "Review each email below and forward/send from your own inbox.",
        "",
    ]
    items_html = ""

    for i, lead in enumerate(leads, 1):
        name     = lead.get("Business Name", "").strip()
        to_email = lead.get("Email", "").strip()
        priority = lead.get("Priority Score", "").split()[0]
        sector   = lead.get("Sector", "")
        location = lead.get("Location", "")

        email_a = lead.get("Email Version A", "").strip()
        if email_a and "\n\n" in email_a:
            lines      = email_a.split("\n")
            subj_line  = next((l for l in lines if l.lower().startswith("subject:")), "")
            email_subj = subj_line.replace("Subject:", "").replace("subject:", "").strip()
            email_body = "\n".join(l for l in lines if not l.lower().startswith("subject:")).strip()
        else:
            email_subj = _build_subject(lead)
            email_body = _build_email_body(lead)

        plain_lines += [
            "─" * 50,
            f"{i}. {name}  [{priority}]  →  {to_email}",
            f"   {sector} | {location}",
            f"   Subject: {email_subj}",
            "",
            email_body,
            "",
        ]

        badge_color  = "#c0392b" if priority == "HOT" else "#e67e22"
        body_escaped = email_body.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\n","<br>")
        items_html += f"""
        <div style="border:1px solid #ddd;border-radius:8px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <span style="font-size:17px;font-weight:700;color:#222;">{i}. {name}</span>
            <span style="background:{badge_color};color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;">{priority}</span>
          </div>
          <div style="color:#888;font-size:13px;margin-bottom:4px;">{sector} &nbsp;·&nbsp; {location}</div>
          <div style="color:#555;font-size:13px;margin-bottom:14px;">To: <strong>{to_email}</strong> &nbsp;|&nbsp; Subject: <em>{email_subj}</em></div>
          <div style="background:#f7f7f7;border-left:3px solid #2c3e50;padding:14px;border-radius:4px;font-family:Georgia,serif;font-size:15px;line-height:1.6;color:#333;">{body_escaped}</div>
        </div>"""

    plain_body = "\n".join(plain_lines)
    html_body  = f"""<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#2c3e50;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
    <div style="font-size:20px;font-weight:700;">Lumus — Email Outreach</div>
    <div style="font-size:13px;opacity:0.8;margin-top:4px;">{today} &nbsp;·&nbsp; {count} to send</div>
  </div>
  <p style="color:#555;margin-bottom:20px;">Review each email below. Copy and send from your Gmail to each recipient.</p>
  {items_html}
  <div style="border-top:1px solid #eee;margin-top:24px;padding-top:14px;font-size:12px;color:#aaa;">Lumus automated brief</div>
</body></html>"""

    return subject, plain_body, html_body


def send_brief(smtp, from_addr: str, subject: str, plain: str, html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = from_addr
    msg["To"]      = from_addr
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html,  "html"))
    smtp.sendmail(from_addr, from_addr, msg.as_string())


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Lumus Email Outreach Brief")
    print("-" * 40)

    csv_path = get_current_csv()
    if not csv_path:
        print("[outreach] No leads CSV found — run 01_find_leads.py first.")
        sys.exit(0)

    print(f"Reading: {os.path.basename(csv_path)}")
    leads = load_email_leads(csv_path)
    if not leads:
        print("[outreach] No HOT/WARM leads with email addresses today.")
        sys.exit(0)

    log  = load_log()
    week = os.path.basename(csv_path).replace("leads_", "").replace(".csv", "")

    to_send = []
    for lead in leads:
        name    = lead.get("Business Name", "").strip()
        log_key = f"{week}::{name}"
        if log_key in log:
            print(f"  [skip] Already sent brief for: {name}")
            continue
        to_send.append(lead)

    if not to_send:
        print("[outreach] All leads already briefed this week.")
        sys.exit(0)

    smtp, gmail_user = get_smtp_connection()
    subject, plain, html = build_brief(to_send)
    send_brief(smtp, gmail_user, subject, plain, html)
    smtp.quit()

    for lead in to_send:
        name = lead.get("Business Name", "").strip()
        log[f"{week}::{name}"] = {"sent_at": datetime.now().strftime("%d/%m/%Y %H:%M")}
    save_log(log)

    print(f"[outreach] Brief sent to {gmail_user} — {len(to_send)} lead{'s' if len(to_send)!=1 else ''} included")


if __name__ == "__main__":
    main()

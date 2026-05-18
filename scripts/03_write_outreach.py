#!/usr/bin/env python3
"""
Lumus Outreach Writer — Step 3
Generates personalised Email A, Email B, Instagram DM, Follow-Up 1 and Follow-Up 2
for every HOT and WARM lead in the current leads file.

HOW TO USE:
  python3 scripts/03_write_outreach.py

INPUT:
  leads/leads_YYYY-WW.csv

OUTPUT:
  Same file, updated with outreach columns filled in.
  Also prints a preview of messages for HOT leads.

HOW PERSONALISATION WORKS:
  Each message is built from the business name, sector, location,
  main weakness, outreach angle and recommended service.
  Two email versions (A and B) use different psychological angles:
    - Version A: Problem/Pain (what they're losing)
    - Version B: Opportunity/Gain (what they could have)
"""

import csv
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import (
    AGENCY_EMAIL,
    AGENCY_NAME,
    AGENCY_WEBSITE,
    CSV_COLUMNS,
)

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "outreach", "templates")


# ─── Email Template A (Problem / Pain angle) ─────────────────────────────────

def email_version_a(name, sector, location, weakness, service, angle):
    return f"""Subject: {name} — one thing costing you customers right now

Hi there,

I was looking at local {sector.lower()}s in {location} this week and came across {name}.

{angle}.

That's a real problem for a business like yours — customers are searching online every day, and if they can't find you or what they see doesn't build trust, they move on to the next option.

At Lumus, we help local businesses in Galway and Mayo fix exactly this. We're not a big agency — we're a small, focused team that works with {sector.lower()}s, restaurants, salons and independents to sort out their digital presence quickly and without the jargon.

Specifically, we'd look at your {service.lower()} and get it working properly within a few weeks.

Would it be worth a quick 15-minute call to see if we can help?

No pitch, no pressure — just an honest look at what's holding you back online.

Best,
The Lumus Team
{AGENCY_EMAIL}
{AGENCY_WEBSITE}
""".strip()


# ─── Email Template B (Opportunity / Gain angle) ─────────────────────────────

def email_version_b(name, sector, location, weakness, service, angle):
    return f"""Subject: What a stronger online presence could mean for {name}

Hi,

I noticed {name} while researching {sector.lower()}s in {location} — and I think there's a straightforward opportunity here.

{angle}.

Businesses in your sector that have sorted their {service.lower()} are consistently getting more enquiries, more bookings and more footfall — just from being easier to find and looking more credible online.

At Lumus, we work specifically with local businesses like yours. We handle {service.lower()} end to end, so you don't have to think about it.

If you'd like, I can put together a free, no-obligation snapshot of what we'd improve for {name} — takes us about 20 minutes to do, and it's yours to keep even if you don't work with us.

Worth a look?

Best,
The Lumus Team
{AGENCY_EMAIL}
{AGENCY_WEBSITE}
""".strip()


# ─── Instagram DM ─────────────────────────────────────────────────────────────

def instagram_dm(name, sector, location, weakness, service):
    short_weakness = weakness.split("|")[0].strip() if "|" in weakness else weakness
    return f"""Hi! 👋 I came across {name} and really like what you're doing.

Quick question — have you thought about {service.lower()}? A lot of {sector.lower()}s in {location} are missing out on customers just because of this.

We help local businesses sort it quickly. Happy to share a few ideas if you're interested — no strings attached.

— Lumus 🌟""".strip()


# ─── Follow-Up 1 (5–7 days after first contact) ──────────────────────────────

def follow_up_1(name, sector, service):
    return f"""Subject: Re: {name} — just checking in

Hi,

I sent a quick note last week about {service.lower()} for {name} — just wanted to follow up in case it got buried.

If now isn't the right time, no worries at all — just say the word and I'll leave you to it.

But if you are curious, I'm happy to send over a free snapshot of what we'd fix first. Takes two minutes to read.

Best,
The Lumus Team
{AGENCY_EMAIL}
""".strip()


# ─── Follow-Up 2 (10–14 days after first contact) ────────────────────────────

def follow_up_2(name, sector, service):
    return f"""Subject: Last one from me — {name}

Hi,

This will be my last message — I don't want to be a nuisance.

If {name} ever wants help with {service.lower()}, we're here. We work with a small number of local businesses at a time so we can give proper attention to each one.

Feel free to reach out whenever it makes sense.

Wishing you a great week,
The Lumus Team
{AGENCY_EMAIL}
{AGENCY_WEBSITE}
""".strip()


# ─── Main ─────────────────────────────────────────────────────────────────────

def get_latest_leads_file():
    files = [f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")]
    if not files:
        return None
    files.sort(reverse=True)
    return os.path.join(LEADS_DIR, files[0])


def process_outreach(filepath):
    rows = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))

    written = 0
    previewed = 0

    for row in rows:
        name = row.get("Business Name", "").strip()
        if not name:
            continue

        score_str = row.get("Priority Score", "COLD")
        if "COLD" in score_str:
            continue  # Skip cold leads for outreach

        sector = row.get("Sector", "local business")
        location = row.get("Location", "your area")
        weakness = row.get("Main Weakness", "limited online presence")
        service = row.get("Recommended Lumus Service", "digital presence")
        angle = row.get("Outreach Angle", "Your digital presence could be stronger")

        row["Email Version A"] = email_version_a(name, sector, location, weakness, service, angle)
        row["Email Version B"] = email_version_b(name, sector, location, weakness, service, angle)
        row["Instagram DM"] = instagram_dm(name, sector, location, weakness, service)
        row["Follow-Up 1"] = follow_up_1(name, sector, service)
        row["Follow-Up 2"] = follow_up_2(name, sector, service)

        if row.get("Status") == "Researched":
            row["Status"] = "Researched"  # Keep — outreach not yet sent

        written += 1

        # Preview HOT leads
        if "HOT" in score_str and previewed < 3:
            print(f"\n{'='*60}")
            print(f"HOT LEAD PREVIEW: {name} ({sector}, {location})")
            print(f"Score: {score_str}")
            print(f"Weakness: {weakness}")
            print(f"Service: {service}")
            print(f"\n--- EMAIL A ---")
            print(row["Email Version A"][:400] + "...")
            print(f"\n--- INSTAGRAM DM ---")
            print(row["Instagram DM"])
            previewed += 1

    # Write back
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in rows:
            out_row = {col: row.get(col, "") for col in CSV_COLUMNS}
            writer.writerow(out_row)

    print(f"\n[OK] Outreach written for {written} HOT/WARM leads")
    print()
    print("NEXT STEPS:")
    print("  1. Open the CSV and review each outreach message")
    print("  2. Personalise any messages that feel generic")
    print("  3. Send Email A first, then Instagram DM if no reply after 3 days")
    print("  4. After sending, update the 'Status' column in the CSV")
    print("  5. After two weeks, run: python3 scripts/04_weekly_report.py")


if __name__ == "__main__":
    filepath = get_latest_leads_file()
    if not filepath:
        print("[ERROR] No leads file found. Run Step 1 and Step 2 first.")
        sys.exit(1)

    print("Lumus Outreach Writer")
    print(f"File: {filepath}")
    print("-" * 40)
    process_outreach(filepath)

#!/usr/bin/env python3
"""
Lumus Lead Scorer — Step 2
Analyses each lead's digital presence and assigns a priority score.

HOW TO USE:
  python3 scripts/02_score_leads.py

INPUT:
  leads/leads_YYYY-WW.csv  — your filled-in leads file

OUTPUT:
  Same file, updated with:
  - Main Weakness
  - Commercial Opportunity
  - Recommended Lumus Service
  - Priority Score
  - Outreach Angle

SCORING LOGIC (0–100):
  +25 → No website at all
  +15 → Has a website but it looks outdated/poor (you flag this manually)
  +20 → No Google Business Profile
  +10 → Google Business Profile has fewer than 20 reviews or under 4.0 stars
  +15 → No Instagram account
  +5  → Has Instagram but very low engagement
  +10 → In a priority sector (café, restaurant, salon, gym, clinic)
  +5  → In a priority location (Galway, Salthill, Oranmore)

HOT = 70+   → Contact immediately
WARM = 45+  → Worth contacting
COLD = <45  → Monitor or skip this week
"""

import csv
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import (
    CSV_COLUMNS,
    LUMUS_SERVICES,
    PRIORITY_THRESHOLDS,
    SCORING_WEIGHTS,
    TARGET_LOCATIONS,
    TARGET_SECTORS,
)

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")

HIGH_VALUE_SECTORS = ["Café", "Restaurant", "Hair Salon", "Beauty Salon", "Gym", "Clinic", "Pub"]
HIGH_VALUE_LOCATIONS = ["Galway City", "Salthill", "Oranmore"]


def score_lead(row):
    score = 0
    weaknesses = []
    opportunities = []
    services = []

    website = row.get("Website", "").strip()
    instagram = row.get("Instagram", "").strip()
    gbp = row.get("Google Business Profile", "").strip()
    main_weakness = row.get("Main Weakness", "").strip().lower()
    sector = row.get("Sector", "").strip()
    location = row.get("Location", "").strip()

    # Website
    if not website or website in ("none", "n/a", "-", "no"):
        score += 25
        weaknesses.append("No website")
        opportunities.append("Build a professional website from scratch")
        services.append("Website Redesign")
    elif any(kw in main_weakness for kw in ["old", "outdated", "slow", "poor", "basic", "bad"]):
        score += 15
        weaknesses.append("Outdated or poor website")
        opportunities.append("Modernise website to improve trust and conversions")
        services.append("Website Redesign")

    # Google Business Profile
    if not gbp or gbp in ("none", "n/a", "-", "no"):
        score += 20
        weaknesses.append("No Google Business Profile")
        opportunities.append("Set up and optimise Google Business Profile for local search visibility")
        services.append("Google Business Profile Optimisation")
    elif any(kw in main_weakness for kw in ["few reviews", "low rating", "bad reviews", "no reviews"]):
        score += 10
        weaknesses.append("Weak Google presence or reviews")
        opportunities.append("Reputation management and review strategy")
        services.append("Reputation Management (Reviews)")

    # Instagram
    if not instagram or instagram in ("none", "n/a", "-", "no"):
        score += 15
        weaknesses.append("No Instagram")
        opportunities.append("Launch Instagram presence to reach local audience")
        services.append("Instagram Content & Management")
    elif any(kw in main_weakness for kw in ["low engagement", "irregular", "no posts", "inactive"]):
        score += 5
        weaknesses.append("Low Instagram engagement")
        opportunities.append("Improve content quality and posting consistency")
        services.append("Social Media Audit & Strategy")

    # Sector fit
    if sector in HIGH_VALUE_SECTORS:
        score += 10

    # Location fit
    if any(loc in location for loc in HIGH_VALUE_LOCATIONS):
        score += 5

    # Build summary strings
    weakness_str = " | ".join(weaknesses) if weaknesses else row.get("Main Weakness", "Needs research")
    opportunity_str = " | ".join(opportunities) if opportunities else "General digital improvement"

    # Pick top service
    top_service = services[0] if services else "Full Digital Presence Audit"
    if len(services) > 1:
        top_service = "Full Digital Presence Audit"

    # Outreach angle
    outreach_angle = build_outreach_angle(weaknesses, sector, location)

    # Priority label
    if score >= PRIORITY_THRESHOLDS["hot"]:
        priority_label = f"HOT ({score})"
    elif score >= PRIORITY_THRESHOLDS["warm"]:
        priority_label = f"WARM ({score})"
    else:
        priority_label = f"COLD ({score})"

    return {
        "Main Weakness": weakness_str,
        "Commercial Opportunity": opportunity_str,
        "Recommended Lumus Service": top_service,
        "Priority Score": priority_label,
        "Outreach Angle": outreach_angle,
    }


def build_outreach_angle(weaknesses, sector, location):
    if "No website" in weaknesses:
        return f"No online presence — losing customers to competitors every day"
    if "Outdated or poor website" in weaknesses:
        return f"Website is holding back bookings/enquiries — easy win with a refresh"
    if "No Google Business Profile" in weaknesses:
        return f"Invisible on Google Maps — missing local searches daily"
    if "Weak Google presence or reviews" in weaknesses:
        return f"Low reviews hurting trust — structured review strategy fixes this fast"
    if "No Instagram" in weaknesses:
        return f"No visual presence on Instagram — competitors are stealing attention"
    if "Low Instagram engagement" in weaknesses:
        return f"Instagram is posting but not converting — content strategy needed"
    return f"Digital presence below sector average for {location}"


def get_latest_leads_file():
    files = [f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")]
    if not files:
        return None
    files.sort(reverse=True)
    return os.path.join(LEADS_DIR, files[0])


def process_leads(filepath):
    rows = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))

    updated = 0
    skipped = 0
    for row in rows:
        name = row.get("Business Name", "").strip()
        if not name:
            skipped += 1
            continue

        scores = score_lead(row)
        row.update(scores)

        if row.get("Status", "") in ("", "New"):
            row["Status"] = "Researched"
        updated += 1

    # Write back
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in rows:
            # Ensure all columns exist
            out_row = {col: row.get(col, "") for col in CSV_COLUMNS}
            writer.writerow(out_row)

    print(f"[OK] Scored {updated} leads ({skipped} rows skipped — no business name)")
    print()

    # Summary
    hot = sum(1 for r in rows if "HOT" in r.get("Priority Score", ""))
    warm = sum(1 for r in rows if "WARM" in r.get("Priority Score", ""))
    cold = sum(1 for r in rows if "COLD" in r.get("Priority Score", ""))

    print("PRIORITY BREAKDOWN:")
    print(f"  HOT  (contact immediately) : {hot}")
    print(f"  WARM (worth contacting)    : {warm}")
    print(f"  COLD (monitor/skip)        : {cold}")
    print()
    print("NEXT STEP:")
    print("  Run: python3 scripts/03_write_outreach.py")


if __name__ == "__main__":
    filepath = get_latest_leads_file()
    if not filepath:
        print("[ERROR] No leads file found in /leads/")
        print("        Run: python3 scripts/01_find_leads.py first")
        sys.exit(1)

    print(f"Lumus Lead Scorer")
    print(f"File: {filepath}")
    print("-" * 40)
    process_leads(filepath)

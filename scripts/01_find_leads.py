#!/usr/bin/env python3
"""
Lumus Lead Finder — Step 1
Generates a structured lead list for manual or semi-automated research.

HOW TO USE:
  python3 scripts/01_find_leads.py

OUTPUT:
  leads/leads_YYYY-WW.csv  — new leads file for the current week

WHAT IT DOES:
  1. Creates a blank CSV with all required columns
  2. Pre-fills location and sector combinations as a research checklist
  3. You then fill in the business details manually (or paste from Google Maps)

TIPS FOR FINDING LEADS:
  - Google Maps: search "[sector] in [location]"
  - Instagram: search #galwaycafe #salthillrestaurant etc.
  - Yelp, TripAdvisor, Golden Pages (goldenpages.ie)
  - Facebook local business groups
  - Your own walking/driving around the area
"""

import csv
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import (
    CSV_COLUMNS,
    EFFICIENCY,
    TARGET_LOCATIONS,
    TARGET_SECTORS,
)

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")


def get_week_label():
    now = datetime.now()
    return now.strftime("%Y-W%V")


def get_leads_filename():
    return os.path.join(LEADS_DIR, f"leads_{get_week_label()}.csv")


def create_blank_leads_file(filepath, seed_rows=True):
    os.makedirs(LEADS_DIR, exist_ok=True)

    if os.path.exists(filepath):
        print(f"[INFO] Leads file already exists: {filepath}")
        print("       Delete it or rename it if you want a fresh start.")
        return False

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()

        if seed_rows:
            today = datetime.now().strftime("%d/%m/%Y")
            limit = EFFICIENCY["max_leads_per_run"]
            combos = [(loc, sec) for loc in TARGET_LOCATIONS for sec in TARGET_SECTORS]
            for location, sector in combos[:limit]:
                row = {col: "" for col in CSV_COLUMNS}
                row["Date Added"] = today
                row["Location"] = location
                row["Sector"] = sector
                row["Status"] = "New"
                row["Result"] = "Pending"
                writer.writerow(row)

    limit = EFFICIENCY["max_leads_per_run"]
    print(f"[OK] Created new leads file: {filepath}")
    print(f"     {limit} placeholder rows (max_leads_per_run={limit}).")
    print()
    print("NEXT STEPS:")
    print("  1. Open the CSV in Excel or Google Sheets")
    print("  2. For each row, search Google Maps for real businesses")
    print("  3. Fill in: Business Name, Website, Instagram, Email, Phone")
    print("  4. Delete rows where you found no businesses")
    print("  5. Save the file, then run: python3 scripts/02_score_leads.py")
    return True


def print_research_guide():
    print()
    print("=" * 60)
    print("LUMUS LEAD RESEARCH GUIDE")
    print("=" * 60)
    print()
    print("GOOGLE MAPS SEARCHES TO RUN:")
    for location in TARGET_LOCATIONS:
        for sector in TARGET_SECTORS:
            print(f"  → {sector} in {location}")
    print()
    print("INSTAGRAM HASHTAGS TO CHECK:")
    hashtags = []
    for loc in ["galway", "salthill", "oranmore", "westport", "mayo"]:
        for sec in ["cafe", "restaurant", "pub", "barber", "salon", "gym"]:
            hashtags.append(f"#{loc}{sec}")
    print("  " + "  ".join(hashtags[:20]))
    print()
    print("USEFUL DIRECTORIES:")
    print("  goldenpages.ie — Irish business directory")
    print("  tripadvisor.com → search by location")
    print("  yelp.ie → restaurants, beauty, health")
    print("  booking.com → B&Bs and hotels in Galway/Mayo")
    print()


if __name__ == "__main__":
    filepath = get_leads_filename()
    print(f"Lumus Lead Finder — Week {get_week_label()}")
    print("-" * 40)
    created = create_blank_leads_file(filepath, seed_rows=True)
    if created:
        print_research_guide()

#!/usr/bin/env python3
"""
Lumus Learning Engine — Step 5
Reads the weekly report and all historical data to update strategy for next week.

HOW TO USE:
  python3 scripts/05_learn_and_adapt.py

INPUT:
  reports/report_YYYY-WW.txt  — latest weekly report
  leads/leads_*.csv            — all historical lead files
  data/strategy.json           — current strategy (created on first run)

OUTPUT:
  data/strategy.json           — updated strategy for next week
  data/learning_log.txt        — running log of what the system has learnt
  Prints a brief next-week briefing
"""

import csv
import json
import os
import sys
from collections import defaultdict, Counter
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import TARGET_SECTORS, TARGET_LOCATIONS

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
STRATEGY_FILE = os.path.join(DATA_DIR, "strategy.json")
LEARNING_LOG = os.path.join(DATA_DIR, "learning_log.txt")


DEFAULT_STRATEGY = {
    "created": datetime.now().strftime("%d/%m/%Y"),
    "week": 1,
    "focus_sectors": ["Café", "Restaurant", "Hair Salon", "Beauty Salon", "Gym"],
    "focus_locations": ["Galway City", "Salthill", "Oranmore"],
    "email_version_preference": "A",
    "dm_first": False,
    "min_leads_per_week": 25,
    "skip_sectors": [],
    "skip_locations": [],
    "winning_angles": [],
    "losing_angles": [],
    "sector_reply_rates": {},
    "location_reply_rates": {},
    "angle_reply_rates": {},
    "total_leads_all_time": 0,
    "total_contacted_all_time": 0,
    "total_replies_all_time": 0,
    "total_won_all_time": 0,
    "notes": "Baseline strategy — first run.",
}


def load_strategy():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(STRATEGY_FILE):
        with open(STRATEGY_FILE, "r") as f:
            return json.load(f)
    return dict(DEFAULT_STRATEGY)


def save_strategy(strategy):
    with open(STRATEGY_FILE, "w") as f:
        json.dump(strategy, f, indent=2)


def load_all_leads():
    all_rows = []
    files = [f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")]
    for fname in sorted(files):
        with open(os.path.join(LEADS_DIR, fname), "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get("Business Name", "").strip():
                    all_rows.append(dict(row))
    return all_rows


def compute_rates(rows):
    sector_stats = defaultdict(lambda: {"contacted": 0, "replied": 0, "positive": 0})
    location_stats = defaultdict(lambda: {"contacted": 0, "replied": 0, "positive": 0})
    angle_stats = defaultdict(lambda: {"contacted": 0, "replied": 0, "positive": 0})

    contacted_statuses = {
        "Email Sent", "DM Sent", "Follow-Up 1 Sent", "Follow-Up 2 Sent",
        "Replied", "Meeting Booked", "Proposal Sent", "Won", "Lost", "Not Interested"
    }
    replied_statuses = {"Replied", "Meeting Booked", "Proposal Sent", "Won", "Not Interested"}

    for row in rows:
        status = row.get("Status", "")
        result = row.get("Result", "")
        sector = row.get("Sector", "Unknown")
        location = row.get("Location", "Unknown")
        angle = row.get("Outreach Angle", "Unknown")

        is_contacted = status in contacted_statuses
        is_replied = status in replied_statuses
        is_positive = result == "Positive" or status in {"Meeting Booked", "Proposal Sent", "Won"}

        if is_contacted:
            sector_stats[sector]["contacted"] += 1
            location_stats[location]["contacted"] += 1
            angle_stats[angle]["contacted"] += 1

        if is_replied:
            sector_stats[sector]["replied"] += 1
            location_stats[location]["replied"] += 1
            angle_stats[angle]["replied"] += 1

        if is_positive:
            sector_stats[sector]["positive"] += 1
            location_stats[location]["positive"] += 1
            angle_stats[angle]["positive"] += 1

    def rate(stats_dict):
        return {
            k: round(v["replied"] / max(v["contacted"], 1) * 100, 1)
            for k, v in stats_dict.items()
            if v["contacted"] >= 2
        }

    return rate(sector_stats), rate(location_stats), rate(angle_stats), sector_stats, location_stats


def determine_focus(rates_dict, current_focus, all_options, top_n=5):
    """Pick top N performers; if not enough data, keep current focus."""
    if len(rates_dict) >= 3:
        sorted_items = sorted(rates_dict.items(), key=lambda x: x[1], reverse=True)
        return [k for k, _ in sorted_items[:top_n]]
    return current_focus


def determine_skips(rates_dict, threshold=5.0, min_contacted=5):
    """Flag sectors/locations with very low reply rates after enough contact attempts."""
    return [k for k, r in rates_dict.items() if r < threshold]


def log_learning(message):
    os.makedirs(DATA_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    with open(LEARNING_LOG, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")


def update_strategy(strategy, rows):
    sector_rates, location_rates, angle_rates, sector_stats, location_stats = compute_rates(rows)

    prev_focus_sectors = strategy.get("focus_sectors", DEFAULT_STRATEGY["focus_sectors"])
    prev_focus_locations = strategy.get("focus_locations", DEFAULT_STRATEGY["focus_locations"])

    # Update rates in strategy
    strategy["sector_reply_rates"] = sector_rates
    strategy["location_reply_rates"] = location_rates
    strategy["angle_reply_rates"] = angle_rates

    # Update focus based on performance
    if sector_rates:
        strategy["focus_sectors"] = determine_focus(sector_rates, prev_focus_sectors, TARGET_SECTORS)
        log_learning(f"Focus sectors updated to: {strategy['focus_sectors']}")

    if location_rates:
        strategy["focus_locations"] = determine_focus(location_rates, prev_focus_locations, TARGET_LOCATIONS)
        log_learning(f"Focus locations updated to: {strategy['focus_locations']}")

    # Skip underperformers (only after enough data)
    strategy["skip_sectors"] = determine_skips(sector_rates)
    strategy["skip_locations"] = determine_skips(location_rates)

    # Determine email preference from winning angles
    if angle_rates:
        sorted_angles = sorted(angle_rates.items(), key=lambda x: x[1], reverse=True)
        strategy["winning_angles"] = [a for a, _ in sorted_angles[:3]]
        strategy["losing_angles"] = [a for a, _ in sorted_angles[-2:]] if len(sorted_angles) > 2 else []

    # DM-first strategy if reply rate is very low overall
    contacted = sum(v["contacted"] for v in sector_stats.values())
    replied = sum(v["replied"] for v in sector_stats.values())
    overall_rate = replied / max(contacted, 1)

    strategy["dm_first"] = overall_rate < 0.05

    # Totals
    strategy["total_leads_all_time"] = len(rows)
    strategy["total_contacted_all_time"] = contacted
    strategy["total_replies_all_time"] = replied

    won = sum(1 for r in rows if r.get("Status") == "Won")
    strategy["total_won_all_time"] = won

    strategy["week"] = strategy.get("week", 0) + 1
    strategy["last_updated"] = datetime.now().strftime("%d/%m/%Y")

    if strategy["dm_first"]:
        strategy["notes"] = "Reply rate <5% — trying DM-first approach next week"
        log_learning("Switched to DM-first strategy due to low reply rate")
    elif strategy["winning_angles"]:
        strategy["notes"] = f"Best angle: {strategy['winning_angles'][0][:80]}"

    return strategy


def print_briefing(strategy):
    print()
    print("=" * 60)
    print(f"LUMUS NEXT-WEEK STRATEGY BRIEFING — Week {strategy['week']}")
    print("=" * 60)
    print()
    print("FOCUS SECTORS (research these first):")
    for s in strategy["focus_sectors"]:
        print(f"  ✓ {s}")

    print()
    print("FOCUS LOCATIONS (prioritise these areas):")
    for l in strategy["focus_locations"]:
        print(f"  ✓ {l}")

    if strategy.get("skip_sectors"):
        print()
        print("SECTORS TO SKIP THIS WEEK (low response rate):")
        for s in strategy["skip_sectors"]:
            print(f"  ✗ {s}")

    print()
    if strategy["dm_first"]:
        print("OUTREACH ORDER: Instagram DM first → Email A after 3 days")
    else:
        print("OUTREACH ORDER: Email A first → Instagram DM after 3 days")

    if strategy.get("winning_angles"):
        print()
        print("WINNING OUTREACH ANGLES (use these):")
        for a in strategy["winning_angles"]:
            print(f"  → {a[:80]}")

    print()
    print(f"LIFETIME STATS:")
    print(f"  Total leads researched : {strategy['total_leads_all_time']}")
    print(f"  Total contacted        : {strategy['total_contacted_all_time']}")
    print(f"  Total replies          : {strategy['total_replies_all_time']}")
    print(f"  Total clients won      : {strategy['total_won_all_time']}")

    print()
    print(f"NOTE: {strategy.get('notes', '')}")
    print("=" * 60)
    print()
    print("NEXT STEP:")
    print("  Run: python3 scripts/01_find_leads.py")
    print("  (starts a new week with the updated strategy)")


if __name__ == "__main__":
    print("Lumus Learning Engine")
    print("-" * 40)

    strategy = load_strategy()
    rows = load_all_leads()

    print(f"Loaded {len(rows)} total leads across all weeks")

    if len(rows) < 5:
        print()
        print("[INFO] Not enough data yet to learn patterns.")
        print("       Keep running the workflow for 2–3 weeks, then come back.")
        print("       Saving baseline strategy.")
        save_strategy(strategy)
        print_briefing(strategy)
        sys.exit(0)

    strategy = update_strategy(strategy, rows)
    save_strategy(strategy)

    print(f"[OK] Strategy updated and saved to data/strategy.json")
    print_briefing(strategy)

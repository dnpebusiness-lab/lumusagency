#!/usr/bin/env python3
"""
Lumus Weekly Report Generator — Step 4
Analyses all leads from the current week and produces a structured report.

HOW TO USE:
  python3 scripts/04_weekly_report.py

  To include previous weeks for trend comparison:
  python3 scripts/04_weekly_report.py --all

INPUT:
  leads/leads_YYYY-WW.csv (current or all)

OUTPUT:
  reports/report_YYYY-WW.txt  — human-readable weekly report
  reports/report_YYYY-WW.csv  — machine-readable summary (for Step 5 learning)
"""

import csv
import os
import sys
import argparse
from datetime import datetime
from collections import defaultdict, Counter

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import CSV_COLUMNS

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")


def load_leads(filepath):
    rows = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def analyse_leads(rows):
    stats = {
        "total_leads": 0,
        "total_contacted": 0,
        "total_replies": 0,
        "positive_replies": 0,
        "negative_replies": 0,
        "no_replies": 0,
        "meetings_booked": 0,
        "proposals_sent": 0,
        "won": 0,
        "lost": 0,
        "by_sector": defaultdict(lambda: {"contacted": 0, "replied": 0, "positive": 0}),
        "by_location": defaultdict(lambda: {"contacted": 0, "replied": 0}),
        "by_angle": defaultdict(lambda: {"contacted": 0, "replied": 0, "positive": 0}),
        "by_service": defaultdict(int),
        "hot_leads": 0,
        "warm_leads": 0,
        "cold_leads": 0,
        "objections": [],
        "notes_list": [],
    }

    contacted_statuses = {
        "Email Sent", "DM Sent", "Follow-Up 1 Sent", "Follow-Up 2 Sent",
        "Replied", "Meeting Booked", "Proposal Sent", "Won", "Lost", "Not Interested"
    }
    replied_statuses = {"Replied", "Meeting Booked", "Proposal Sent", "Won", "Lost", "Not Interested"}

    for row in rows:
        name = row.get("Business Name", "").strip()
        if not name:
            continue

        stats["total_leads"] += 1

        score = row.get("Priority Score", "")
        if "HOT" in score:
            stats["hot_leads"] += 1
        elif "WARM" in score:
            stats["warm_leads"] += 1
        else:
            stats["cold_leads"] += 1

        status = row.get("Status", "")
        result = row.get("Result", "")
        sector = row.get("Sector", "Unknown")
        location = row.get("Location", "Unknown")
        angle = row.get("Outreach Angle", "Unknown")
        service = row.get("Recommended Lumus Service", "Unknown")
        response = row.get("Response", "").strip()
        notes = row.get("Notes", "").strip()

        is_contacted = status in contacted_statuses
        is_replied = status in replied_statuses
        is_positive = result == "Positive" or status in {"Meeting Booked", "Proposal Sent", "Won"}
        is_negative = result == "Negative" or status in {"Lost", "Not Interested"}
        is_no_reply = is_contacted and not is_replied

        if is_contacted:
            stats["total_contacted"] += 1
            stats["by_sector"][sector]["contacted"] += 1
            stats["by_location"][location]["contacted"] += 1
            stats["by_angle"][angle]["contacted"] += 1

        if is_replied:
            stats["total_replies"] += 1
            stats["by_sector"][sector]["replied"] += 1
            stats["by_location"][location]["replied"] += 1
            stats["by_angle"][angle]["replied"] += 1

        if is_positive:
            stats["positive_replies"] += 1
            stats["by_sector"][sector]["positive"] += 1
            stats["by_angle"][angle]["positive"] += 1

        if is_negative:
            stats["negative_replies"] += 1

        if is_no_reply:
            stats["no_replies"] += 1

        if status == "Meeting Booked":
            stats["meetings_booked"] += 1
        if status == "Proposal Sent":
            stats["proposals_sent"] += 1
        if status == "Won":
            stats["won"] += 1
        if status == "Lost":
            stats["lost"] += 1

        stats["by_service"][service] += 1

        if response and is_negative:
            stats["objections"].append(response)
        if notes:
            stats["notes_list"].append(notes)

    return stats


def find_best_worst(d, metric="replied", secondary="contacted"):
    """Find best and worst performers from a defaultdict of dicts."""
    eligible = {k: v for k, v in d.items() if v.get(secondary, 0) >= 2}
    if not eligible:
        return "Not enough data yet", "Not enough data yet"

    def rate(item):
        c = item.get(secondary, 0)
        r = item.get(metric, 0)
        return r / c if c > 0 else 0

    sorted_items = sorted(eligible.items(), key=lambda x: rate(x[1]), reverse=True)
    best = sorted_items[0][0] if sorted_items else "N/A"
    worst = sorted_items[-1][0] if len(sorted_items) > 1 else "N/A"
    return best, worst


def generate_improvements(stats):
    tips = []

    reply_rate = stats["total_replies"] / max(stats["total_contacted"], 1)

    if reply_rate < 0.05:
        tips.append("Reply rate is below 5% — revisit the subject lines and opening lines of emails")
        tips.append("Try shorter, more direct emails — under 150 words")
    elif reply_rate < 0.15:
        tips.append("Reply rate is moderate — A/B test subject lines more aggressively")

    if stats["no_replies"] > stats["total_contacted"] * 0.7:
        tips.append("Most leads are not replying — try Instagram DMs before emails for visual businesses (cafés, salons)")

    if stats["positive_replies"] < 2:
        tips.append("Few positive replies — review outreach angles and ensure they feel genuinely useful, not salesy")

    if stats["meetings_booked"] == 0 and stats["total_contacted"] > 10:
        tips.append("No meetings booked yet — add a specific call-to-action: 'Can I send you a free 1-page audit?'")

    common_objection = Counter(stats["objections"]).most_common(1)
    if common_objection:
        tips.append(f"Most common objection: '{common_objection[0][0]}' — prepare a specific response to this")

    if not tips:
        tips.append("System is performing well — maintain current approach and expand lead volume")

    return tips


def generate_action_plan(stats):
    plan = []

    if stats["hot_leads"] > 0:
        plan.append(f"Contact all {stats['hot_leads']} HOT leads first — prioritise phone or DM")

    plan.append("Research and add 20–30 new leads from Google Maps and Instagram")
    plan.append("Send Follow-Up 1 to any leads contacted last week with no reply")
    plan.append("Send Follow-Up 2 to leads where Follow-Up 1 also had no reply")

    if stats["meetings_booked"] > 0:
        plan.append(f"Prepare and send proposals for {stats['meetings_booked']} meetings booked")

    plan.append("Review best-performing sector and focus extra research there next week")
    plan.append("Update Status and Result columns in the CSV after every action")

    return plan


def write_text_report(stats, week_label, filepath):
    now = datetime.now().strftime("%d/%m/%Y %H:%M")
    best_sector, worst_sector = find_best_worst(stats["by_sector"])
    best_angle, worst_angle = find_best_worst(stats["by_angle"])

    reply_rate = f"{(stats['total_replies'] / max(stats['total_contacted'],1) * 100):.1f}%"
    positive_rate = f"{(stats['positive_replies'] / max(stats['total_contacted'],1) * 100):.1f}%"

    objections = Counter(stats["objections"]).most_common(5)
    improvements = generate_improvements(stats)
    action_plan = generate_action_plan(stats)

    best_service = max(stats["by_service"], key=stats["by_service"].get) if stats["by_service"] else "N/A"

    report = f"""
LUMUS AGENCY — WEEKLY LEAD & OUTREACH REPORT
Week: {week_label}
Generated: {now}
{'='*60}

OVERVIEW
--------
Total leads found          : {stats['total_leads']}
  HOT (contact immediately): {stats['hot_leads']}
  WARM (worth contacting)  : {stats['warm_leads']}
  COLD (monitor/skip)      : {stats['cold_leads']}

OUTREACH RESULTS
----------------
Total businesses contacted : {stats['total_contacted']}
Total replies received     : {stats['total_replies']} ({reply_rate} reply rate)
  Positive replies         : {stats['positive_replies']} ({positive_rate} positive rate)
  Negative replies         : {stats['negative_replies']}
  No replies               : {stats['no_replies']}
Meetings booked            : {stats['meetings_booked']}
Proposals sent             : {stats['proposals_sent']}
New clients won            : {stats['won']}
Lost                       : {stats['lost']}

SECTOR PERFORMANCE
------------------
Best-performing sector     : {best_sector}
Worst-performing sector    : {worst_sector}
Most recommended service   : {best_service}

Breakdown by sector:"""

    for sector, data in sorted(stats["by_sector"].items()):
        c = data["contacted"]
        r = data["replied"]
        p = data["positive"]
        if c > 0:
            rate = f"{r/c*100:.0f}%"
            report += f"\n  {sector:<25} Contacted: {c:>3}  Replies: {r:>3} ({rate})  Positive: {p}"

    report += f"""

OUTREACH ANGLE PERFORMANCE
--------------------------
Best outreach angle  : {best_angle}
Weakest angle        : {worst_angle}

Breakdown by angle:"""

    for angle, data in sorted(stats["by_angle"].items(), key=lambda x: x[1].get("replied", 0), reverse=True):
        c = data["contacted"]
        r = data["replied"]
        if c > 0:
            rate = f"{r/c*100:.0f}%"
            short_angle = angle[:60] + "..." if len(angle) > 60 else angle
            report += f"\n  [{rate:>4}] {short_angle}"

    report += f"""

COMMON OBJECTIONS
-----------------"""
    if objections:
        for obj, count in objections:
            report += f"\n  ({count}x) {obj}"
    else:
        report += "\n  No objections recorded yet — update the Response column in the CSV"

    report += f"""

WHAT WORKED THIS WEEK
---------------------"""
    if stats["positive_replies"] > 0:
        report += f"\n  Positive replies received: {stats['positive_replies']}"
    if stats["meetings_booked"] > 0:
        report += f"\n  Meetings booked: {stats['meetings_booked']}"
    if best_sector != "Not enough data yet":
        report += f"\n  Best sector: {best_sector} — continue targeting"
    if not (stats["positive_replies"] > 0 or stats["meetings_booked"] > 0):
        report += "\n  Too early to identify patterns — keep sending and update the CSV"

    report += f"""

WHAT DID NOT WORK
-----------------"""
    if worst_sector != "Not enough data yet":
        report += f"\n  {worst_sector} — low response rate"
    if worst_angle != "Not enough data yet":
        report += f"\n  Angle '{worst_angle[:60]}' not converting"
    if stats["no_replies"] > stats["total_contacted"] * 0.7:
        report += "\n  High no-reply rate — try shorter emails or Instagram DMs first"

    report += f"""

WHAT TO IMPROVE NEXT WEEK
-------------------------"""
    for tip in improvements:
        report += f"\n  → {tip}"

    report += f"""

NEXT WEEK'S ACTION PLAN
-----------------------"""
    for i, action in enumerate(action_plan, 1):
        report += f"\n  {i}. {action}"

    report += f"""

{'='*60}
End of Report — Lumus Agency
Save this file and share with your team.
{'='*60}
""".strip()

    os.makedirs(REPORTS_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(report)

    return report


def get_week_label():
    return datetime.now().strftime("%Y-W%V")


def get_latest_leads_file():
    files = [f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")]
    if not files:
        return None
    files.sort(reverse=True)
    return os.path.join(LEADS_DIR, files[0])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="Include all lead files, not just the latest")
    args = parser.parse_args()

    week_label = get_week_label()
    report_path = os.path.join(REPORTS_DIR, f"report_{week_label}.txt")

    if args.all:
        all_files = [
            os.path.join(LEADS_DIR, f)
            for f in os.listdir(LEADS_DIR)
            if f.startswith("leads_") and f.endswith(".csv")
        ]
        all_rows = []
        for fp in sorted(all_files):
            all_rows.extend(load_leads(fp))
        rows = all_rows
        print(f"Loading {len(all_files)} lead files — {len(rows)} total rows")
    else:
        fp = get_latest_leads_file()
        if not fp:
            print("[ERROR] No leads file found.")
            sys.exit(1)
        rows = load_leads(fp)
        print(f"Loading: {fp}")

    print("Lumus Weekly Report Generator")
    print("-" * 40)

    stats = analyse_leads(rows)
    report = write_text_report(stats, week_label, report_path)

    print(report)
    print(f"\n[OK] Report saved to: {report_path}")
    print()
    print("NEXT STEP:")
    print("  Run: python3 scripts/05_learn_and_adapt.py")
    print("  to update next week's strategy based on these results")

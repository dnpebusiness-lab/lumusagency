"""
Report Agent — generates a compact weekly summary from the current leads file.
Reads only the current week. Appends recommendations to strategy.
"""

import csv
import os
import sys
from collections import Counter
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")

CONTACTED = {"Email Sent","DM Sent","Follow-Up 1 Sent","Follow-Up 2 Sent",
             "Replied","Meeting Booked","Proposal Sent","Won","Lost","Not Interested"}
REPLIED   = {"Replied","Meeting Booked","Proposal Sent","Won","Not Interested"}


def run(new_leads: list[dict] | None = None) -> str:
    """Generate report. new_leads = leads added this run (for accurate 'found' count)."""
    files = sorted([f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")])
    if not files:
        return "[report] No leads file found."

    filepath = os.path.join(LEADS_DIR, files[-1])
    with open(filepath, "r", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r.get("Business Name", "").strip()]

    total = len(rows)
    contacted = sum(1 for r in rows if r.get("Status") in CONTACTED)
    replied = sum(1 for r in rows if r.get("Status") in REPLIED)
    positive = sum(1 for r in rows if r.get("Result") == "Positive" or r.get("Status") in {"Meeting Booked","Won"})
    hot = sum(1 for r in rows if "HOT" in r.get("Priority Score", ""))

    # Best sector by reply rate
    sector_c = Counter()
    sector_r = Counter()
    for r in rows:
        s = r.get("Sector", "")
        if r.get("Status") in CONTACTED:
            sector_c[s] += 1
        if r.get("Status") in REPLIED:
            sector_r[s] += 1
    best_sector = max(sector_c, key=lambda s: sector_r[s] / max(sector_c[s], 1), default="N/A") if sector_c else "N/A"

    # Common weaknesses
    weaknesses = []
    for r in rows:
        weaknesses.extend(r.get("Main Weakness", "").split(" | "))
    top_issues = Counter(w.strip() for w in weaknesses if w.strip()).most_common(3)

    # Recommendations
    recs = []
    reply_rate = replied / max(contacted, 1)
    if reply_rate < 0.05 and contacted >= 5:
        recs.append("Reply rate <5% — try shorter subject lines or DM-first approach")
    if hot == 0:
        recs.append("No HOT leads this week — expand search to more sectors or locations")
    if not recs:
        recs.append("System performing at baseline — maintain current approach")

    week = datetime.now().strftime("%Y-W%V")
    lines = [
        f"LUMUS WEEKLY REPORT — {week}",
        f"Generated: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        "",
        f"Leads found this run : {len(new_leads) if new_leads is not None else 'N/A'}",
        f"Total in file        : {total}",
        f"HOT leads            : {hot}",
        f"Contacted            : {contacted}",
        f"Replied              : {replied} ({reply_rate*100:.0f}% reply rate)",
        f"Positive             : {positive}",
        "",
        f"Best sector          : {best_sector}",
        "",
        "Most common problems:",
    ]
    for issue, count in top_issues:
        lines.append(f"  ({count}x) {issue}")

    lines += ["", "Recommendations:"]
    for r in recs:
        lines.append(f"  → {r}")

    report = "\n".join(lines)

    os.makedirs(REPORTS_DIR, exist_ok=True)
    path = os.path.join(REPORTS_DIR, f"report_{week}.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"[report] Saved to {path}")
    return report

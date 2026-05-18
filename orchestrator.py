#!/usr/bin/env python3
"""
Lumus Orchestrator — runs the full weekly agent pipeline.

Usage:
  python3 orchestrator.py           # Full weekly run
  python3 orchestrator.py --followup-only   # Only check for overdue follow-ups
  python3 orchestrator.py --report-only     # Only generate this week's report

Steps:
  1. Research Agent  → finds up to 5 new leads
  2. Audit Agent     → checks each lead's website, Instagram, GBP
  3. Scoring Agent   → scores leads, drops COLD
  4. CSV Writer      → saves HOT leads to this week's leads file
  5. Copy Agent      → writes outreach for HOT leads
  6. Draft Saver     → saves outreach as .txt drafts for your approval
  7. Follow-Up Agent → checks for overdue follow-ups, saves drafts
  8. Report Agent    → generates compact weekly summary
  9. Learning Step   → updates strategy.json

Human approval required:
  Review outreach/drafts/*.txt before sending anything.
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

from config.lumus_config import CSV_COLUMNS
from agents import research_agent, audit_agent, scoring_agent, copy_agent, followup_agent, report_agent

LEADS_DIR = os.path.join(ROOT, "leads")
DRAFTS_DIR = os.path.join(ROOT, "outreach", "drafts")
DATA_DIR = os.path.join(ROOT, "data")
STRATEGY_FILE = os.path.join(DATA_DIR, "strategy.json")


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_week_label():
    return datetime.now().strftime("%Y-W%V")


def get_leads_filepath():
    os.makedirs(LEADS_DIR, exist_ok=True)
    return os.path.join(LEADS_DIR, f"leads_{get_week_label()}.csv")


def load_strategy() -> dict:
    if os.path.exists(STRATEGY_FILE):
        with open(STRATEGY_FILE) as f:
            return json.load(f)
    return {}


def save_strategy(strategy: dict):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(STRATEGY_FILE, "w") as f:
        json.dump(strategy, f, indent=2)


def load_existing_names(filepath: str) -> set:
    if not os.path.exists(filepath):
        return set()
    with open(filepath, "r", encoding="utf-8") as f:
        return {r.get("Business Name", "").strip() for r in csv.DictReader(f)}


def append_leads_to_csv(filepath: str, leads: list[dict]):
    exists = os.path.exists(filepath)
    with open(filepath, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        if not exists:
            writer.writeheader()
        today = datetime.now().strftime("%d/%m/%Y")
        for lead in leads:
            row = {col: lead.get(col, "") for col in CSV_COLUMNS}
            row.setdefault("Date Added", today)
            row.setdefault("Status", "New")
            row.setdefault("Result", "Pending")
            writer.writerow(row)
    print(f"[csv] {len(leads)} leads written to {os.path.basename(filepath)}")


def save_draft(lead: dict):
    os.makedirs(DRAFTS_DIR, exist_ok=True)
    safe_name = lead.get("Business Name", "lead").replace("/", "-").replace(" ", "_")[:40]
    path = os.path.join(DRAFTS_DIR, f"outreach_{safe_name}.txt")
    content = "\n\n".join([
        f"LEAD: {lead.get('Business Name')} | {lead.get('Sector')} | {lead.get('Location')}",
        f"SCORE: {lead.get('Priority Score')}",
        f"WEAKNESS: {lead.get('Main Weakness')}",
        f"SERVICE: {lead.get('Recommended Lumus Service')}",
        "─── EMAIL A ───",
        lead.get("Email Version A", ""),
        "─── INSTAGRAM DM ───",
        lead.get("Instagram DM", ""),
    ])
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def update_strategy(strategy: dict, new_leads: list[dict], followup_actions: list[dict]):
    strategy["last_run"] = datetime.now().strftime("%d/%m/%Y %H:%M")
    strategy["week"] = strategy.get("week", 0) + 1
    strategy["total_leads_all_time"] = strategy.get("total_leads_all_time", 0) + len(new_leads)
    return strategy


# ── Main pipeline ─────────────────────────────────────────────────────────────

def run_full():
    print(f"\n{'='*50}")
    print(f"LUMUS ORCHESTRATOR — Week {get_week_label()}")
    print(f"{'='*50}\n")

    strategy = load_strategy()
    leads_file = get_leads_filepath()
    existing_names = load_existing_names(leads_file)

    # 1. Research
    print("STEP 1: Research")
    raw_leads = research_agent.run(strategy)

    # Deduplicate against existing leads
    new_leads = [l for l in raw_leads if l.get("Business Name", "") not in existing_names]
    if not new_leads:
        print("[orchestrator] No new leads found this run.")
    else:
        # 2. Audit
        print("\nSTEP 2: Audit")
        audited = audit_agent.run(new_leads)

        # 3. Score — drops COLD
        print("\nSTEP 3: Score")
        hot_leads = scoring_agent.run(audited)

        if hot_leads:
            # 4. Save to CSV
            print("\nSTEP 4: Save to CSV")
            append_leads_to_csv(leads_file, hot_leads)

            # 5. Write outreach
            print("\nSTEP 5: Write outreach")
            hot_leads = copy_agent.run(hot_leads)

            # 6. Save drafts
            print("\nSTEP 6: Save drafts (review before sending)")
            for lead in hot_leads:
                path = save_draft(lead)
                print(f"  [drafts] Saved: {os.path.basename(path)}")
        else:
            print("[orchestrator] No HOT leads — skipping outreach and drafts.")

    # 7. Follow-ups
    print("\nSTEP 7: Follow-ups")
    followup_actions = followup_agent.run()

    # 8. Report
    print("\nSTEP 8: Report")
    report = report_agent.run(new_leads=new_leads if new_leads else [])
    print()
    print(report)

    # 9. Update strategy
    strategy = update_strategy(strategy, new_leads if new_leads else [], followup_actions)
    save_strategy(strategy)

    print(f"\n{'='*50}")
    print("Run complete.")
    if new_leads:
        print(f"  Drafts saved to: outreach/drafts/")
        print(f"  Review and send manually — nothing was sent automatically.")
    print(f"{'='*50}\n")


def run_followup_only():
    print("Running follow-up check only...")
    actions = followup_agent.run()
    if actions:
        for a in actions:
            print(f"  {a['lead']}: {a['action']}")
    else:
        print("  No follow-ups due.")


def run_report_only():
    print("Generating report only...")
    report = report_agent.run()
    print(report)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--followup-only", action="store_true")
    parser.add_argument("--report-only", action="store_true")
    args = parser.parse_args()

    if args.followup_only:
        run_followup_only()
    elif args.report_only:
        run_report_only()
    else:
        run_full()

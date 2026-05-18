#!/usr/bin/env python3
"""
Lumus Weekly Workflow Runner
Runs all steps in sequence for a full weekly cycle.

USAGE:
  python3 scripts/run_all.py --step 1        # Run only Step 1 (find leads)
  python3 scripts/run_all.py --step 2        # Run only Step 2 (score)
  python3 scripts/run_all.py --step 3        # Run only Step 3 (write outreach)
  python3 scripts/run_all.py --step 4        # Run only Step 4 (weekly report)
  python3 scripts/run_all.py --step 5        # Run only Step 5 (learn & adapt)
  python3 scripts/run_all.py --steps 2,3     # Run steps 2 and 3
  python3 scripts/run_all.py --all           # Run all steps (use for end-of-week)
"""

import argparse
import subprocess
import sys
import os

SCRIPTS = {
    1: ("01_find_leads.py",     "Find & Create Leads File"),
    2: ("02_score_leads.py",    "Score & Analyse Leads"),
    3: ("03_write_outreach.py", "Write Outreach Messages"),
    4: ("04_weekly_report.py",  "Generate Weekly Report"),
    5: ("05_learn_and_adapt.py","Learn & Adapt Strategy"),
}

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))


def run_step(step_num):
    script, label = SCRIPTS[step_num]
    script_path = os.path.join(SCRIPTS_DIR, script)
    print()
    print(f"{'='*60}")
    print(f"STEP {step_num}: {label}")
    print(f"{'='*60}")
    result = subprocess.run([sys.executable, script_path], capture_output=False)
    if result.returncode != 0:
        print(f"[ERROR] Step {step_num} failed. Fix the error above before continuing.")
        sys.exit(result.returncode)
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--step", type=int, choices=[1, 2, 3, 4, 5])
    group.add_argument("--steps", type=str, help="Comma-separated step numbers e.g. 2,3")
    group.add_argument("--all", action="store_true")
    args = parser.parse_args()

    print()
    print("LUMUS AGENCY — WEEKLY LEAD SYSTEM")
    print("=" * 60)

    if args.all:
        steps = [1, 2, 3, 4, 5]
    elif args.steps:
        steps = [int(s.strip()) for s in args.steps.split(",")]
    else:
        steps = [args.step]

    for step in steps:
        run_step(step)

    print()
    print("=" * 60)
    print("Done. Check the leads/ and reports/ folders for output.")
    print("=" * 60)

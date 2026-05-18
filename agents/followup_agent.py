"""
Follow-Up Agent — reads current week's CSV, finds leads past the follow-up window,
saves follow-up drafts to outreach/drafts/.
"""

import csv
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import CSV_COLUMNS

LEADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "leads")
DRAFTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "outreach", "drafts")

FOLLOWUP1_DAYS = 7
FOLLOWUP2_DAYS = 14


def _days_since(date_str: str) -> int | None:
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            d = datetime.strptime(date_str.strip(), fmt)
            return (datetime.now() - d).days
        except ValueError:
            continue
    return None


def _save_draft(filename: str, content: str):
    os.makedirs(DRAFTS_DIR, exist_ok=True)
    path = os.path.join(DRAFTS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def run() -> list[dict]:
    """Scan latest leads file. Return list of follow-up actions taken."""
    files = sorted([f for f in os.listdir(LEADS_DIR) if f.startswith("leads_") and f.endswith(".csv")])
    if not files:
        print("[followup] No leads file found")
        return []

    filepath = os.path.join(LEADS_DIR, files[-1])
    actions = []

    with open(filepath, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    updated_rows = []
    for row in rows:
        name = row.get("Business Name", "").strip()
        if not name:
            updated_rows.append(row)
            continue

        status = row.get("Status", "")
        date_added = row.get("Date Added", "")
        days = _days_since(date_added)

        if days is None:
            updated_rows.append(row)
            continue

        # Follow-Up 1: sent email, no reply, 7+ days
        if status == "Email Sent" and days >= FOLLOWUP1_DAYS:
            draft = row.get("Follow-Up 1", "")
            if draft:
                safe_name = name.replace("/", "-").replace(" ", "_")[:40]
                path = _save_draft(f"followup1_{safe_name}.txt", draft)
                row["Status"] = "Follow-Up 1 Sent"
                row["Next Action"] = f"Review draft: {path}"
                actions.append({"lead": name, "action": "Follow-Up 1 draft saved", "path": path})
                print(f"  [followup] Follow-Up 1 drafted: {name} ({days}d since contact)")

        # Follow-Up 2: follow-up 1 sent, no reply, 14+ days
        elif status == "Follow-Up 1 Sent" and days >= FOLLOWUP2_DAYS:
            draft = row.get("Follow-Up 2", "")
            if draft:
                safe_name = name.replace("/", "-").replace(" ", "_")[:40]
                path = _save_draft(f"followup2_{safe_name}.txt", draft)
                row["Status"] = "Follow-Up 2 Sent"
                row["Next Action"] = f"Review draft: {path}"
                actions.append({"lead": name, "action": "Follow-Up 2 draft saved", "path": path})
                print(f"  [followup] Follow-Up 2 drafted: {name} ({days}d since contact)")

        updated_rows.append(row)

    # Write back updated statuses
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for row in updated_rows:
            writer.writerow({col: row.get(col, "") for col in CSV_COLUMNS})

    print(f"[followup] {len(actions)} follow-up drafts created")
    return actions

# Lumus Lead System — Folder Structure

```
lumusagency/
│
├── scripts/                        ← Run these in order each week
│   ├── 01_find_leads.py            ← Step 1: Create new leads file
│   ├── 02_score_leads.py           ← Step 2: Score and analyse leads
│   ├── 03_write_outreach.py        ← Step 3: Generate outreach messages
│   ├── 04_weekly_report.py         ← Step 4: Weekly performance report
│   ├── 05_learn_and_adapt.py       ← Step 5: Update strategy from data
│   └── run_all.py                  ← Shortcut to run specific steps
│
├── leads/                          ← All lead CSV files (one per week)
│   ├── leads_2024-W01.csv          ← Example: week 1
│   ├── leads_2024-W02.csv          ← Example: week 2
│   └── ...                         ← One file per week, auto-named
│
├── reports/                        ← Weekly reports (auto-generated)
│   ├── report_2024-W01.txt         ← Human-readable weekly report
│   └── ...
│
├── outreach/
│   └── templates/
│       ├── email_templates.md      ← Master email templates (edit to change tone)
│       └── objection_responses.md  ← Replies to common objections
│
├── skills/                         ← Reference guides for each workflow phase
│   ├── local-lead-research.md      ← How to find leads (sources, signals)
│   ├── digital-audit.md            ← How to audit a business's digital presence
│   ├── lumus-outreach.md           ← How to write and send outreach
│   ├── offer-matching.md           ← Which service matches which weakness
│   └── follow-up-writing.md        ← How to write follow-ups that work
│
├── data/                           ← System data (auto-managed)
│   ├── strategy.json               ← Current strategy (updated by Step 5)
│   └── learning_log.txt            ← Running log of what the system learnt
│
├── config/
│   └── lumus_config.py             ← All system settings (edit this first)
│
└── docs/
    ├── HOW_TO_RUN_EACH_WEEK.md     ← Your weekly playbook (start here)
    ├── FOLDER_STRUCTURE.md         ← This file
    └── QUICK_START.md              ← First-time setup guide
```

## Key files to know

| File | When you touch it |
|------|-------------------|
| `config/lumus_config.py` | Once at setup, then rarely |
| `leads/leads_YYYY-WW.csv` | Every week — this is your CRM |
| `outreach/templates/email_templates.md` | When you want to change tone or structure |
| `skills/lumus-outreach.md` | When training someone new on outreach |
| `data/strategy.json` | Never manually — updated by Step 5 |
| `reports/report_YYYY-WW.txt` | Read every Monday morning |

## Where to put custom skills

If you create your own Claude Code custom skills for this system,
place the `.md` skill files in `/skills/` and reference them in your
Claude Code settings or CLAUDE.md file.

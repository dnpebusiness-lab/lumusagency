# Lumus Lead System — Quick Start (First-Time Setup)

Follow these steps the first time you run the system.
After that, use `docs/HOW_TO_RUN_EACH_WEEK.md`.

---

## Prerequisites

You need Python 3 installed. Check:
```bash
python3 --version
```

If not installed: download from python.org (free, takes 5 minutes).

No other dependencies — the system uses only Python built-in libraries.

---

## Step 1 — Configure the system

Open `config/lumus_config.py` and check:
- `AGENCY_EMAIL` — update to your actual email
- `AGENCY_WEBSITE` — update if your URL is live
- `AGENCY_INSTAGRAM` — your Instagram handle

Everything else (locations, sectors, scoring) is already set for Lumus.

---

## Step 2 — Run the system for the first time

```bash
cd /path/to/lumusagency

# Create your first leads file
python3 scripts/01_find_leads.py
```

This creates `leads/leads_YYYY-WW.csv` (named with the current week).

---

## Step 3 — Fill in the leads CSV

Open the CSV in Excel or Google Sheets.

You'll see rows pre-populated with every location + sector combination.
For each row:
1. Search Google Maps for "[sector] in [location]"
2. Find 1–3 real local businesses
3. Fill in their details (Business Name, Website, Instagram, Email, Phone)
4. Note the Main Weakness (briefly — the script will elaborate)
5. Delete rows where you found no suitable business

**Target: 25–40 filled-in businesses for your first week.**

---

## Step 4 — Score and write outreach

```bash
python3 scripts/02_score_leads.py
python3 scripts/03_write_outreach.py
```

Review the output in the CSV. Personalise the HOT leads' messages.

---

## Step 5 — Send

Start with your HOT leads. Email A first. Then Instagram DM 2–3 days later.
Update the Status column after each send.

---

## Step 6 — End of week report

```bash
python3 scripts/04_weekly_report.py
python3 scripts/05_learn_and_adapt.py
```

Read the report. Note what the system recommends for next week.

---

## Troubleshooting

**"No module named X"**
The system only uses Python built-ins. If you see this, you may be running Python 2.
Use `python3` not `python`.

**"No leads file found"**
Run Step 1 first: `python3 scripts/01_find_leads.py`

**"File already exists"**
The leads file for this week already exists. Open it directly in Excel.
If you want to start fresh, rename or delete the existing file.

**The CSV looks wrong in Excel**
Make sure Excel is set to use comma as the delimiter when opening CSV files.
Or use Google Sheets (File → Import) which handles CSV automatically.

---

## Updating the system

If you want to change:
- **Email tone** → edit `outreach/templates/email_templates.md`
- **Scoring weights** → edit `config/lumus_config.py` (SCORING_WEIGHTS)
- **Target locations** → edit `config/lumus_config.py` (TARGET_LOCATIONS)
- **Target sectors** → edit `config/lumus_config.py` (TARGET_SECTORS)
- **Lumus services** → edit `config/lumus_config.py` (LUMUS_SERVICES)

After any config change, re-run Steps 2 and 3 to regenerate scores and messages.

---

## Getting help

All skills and instructions are in the `skills/` and `docs/` folders.
Each script has detailed comments at the top explaining what it does.

# Lumus Lead System — How to Run Each Week

This is your weekly playbook. Follow these steps every week.
The whole cycle takes about 3–4 hours when running smoothly.

---

## WEEK STRUCTURE AT A GLANCE

```
MONDAY        → Step 1: Create new leads file + research businesses
TUESDAY       → Step 2: Score all leads
WEDNESDAY     → Step 3: Write outreach messages + start sending
THURSDAY/FRI  → Continue sending + update CSV as replies come in
FOLLOWING MON → Step 4: Weekly report + Step 5: Learn & adapt
```

---

## STEP 1 — FIND LEADS (Monday, ~1.5 hours)

```bash
python3 scripts/01_find_leads.py
```

This creates `leads/leads_YYYY-WW.csv` with placeholder rows for every
location/sector combination.

**Your job:**
1. Open the CSV in Excel or Google Sheets
2. For each row, search Google Maps for real businesses in that sector and location
3. Fill in: Business Name, Website, Instagram, Email, Phone
4. Delete empty rows (no businesses found)
5. Aim for 25–40 real businesses per week

**Research tips (from `skills/local-lead-research.md`):**
- Google Maps: "[sector] in [location]" — check all results
- Instagram: #galwaycafe #salthillrestaurant #westportpub etc.
- goldenpages.ie → filter by location and category
- TripAdvisor → look for low-review listings

---

## STEP 2 — SCORE LEADS (Tuesday, ~20 minutes)

```bash
python3 scripts/02_score_leads.py
```

The script reads your filled-in CSV and adds:
- **Main Weakness** — what's holding them back online
- **Commercial Opportunity** — what Lumus can fix
- **Recommended Lumus Service** — the most impactful service
- **Priority Score** — HOT / WARM / COLD

**Your job:**
- Review the HOT leads first — these are your best opportunities this week
- Manually flag any business as "poor website" in the Main Weakness column
  if you visited their site and it clearly needs work (the script can't browse)
- Re-run the script if you made manual changes

---

## STEP 3 — WRITE OUTREACH (Wednesday, ~30 minutes)

```bash
python3 scripts/03_write_outreach.py
```

Generates Email A, Email B, Instagram DM, Follow-Up 1 and Follow-Up 2
for every HOT and WARM lead.

**Your job:**
1. Open the CSV and review each message
2. Personalise anything that feels generic — add a specific detail you noticed
3. For cafés and salons: mention something visual you saw on their Instagram
4. For restaurants: mention something specific about their menu or reviews
5. Send Email A to HOT leads first (Tuesday–Thursday, 9am–11am)
6. Send Instagram DMs to HOT visual businesses (evenings, 6pm–8pm)
7. After each send, update the **Status** column immediately

**Status values to use:**
- `Email Sent` → after sending Email A or B
- `DM Sent` → after sending Instagram DM
- `Follow-Up 1 Sent` → after sending Follow-Up 1
- `Follow-Up 2 Sent` → after sending Follow-Up 2
- `Replied` → they responded (update Response column too)
- `Meeting Booked` → call or meeting confirmed

---

## STEP 4 — WEEKLY REPORT (Following Monday, ~5 minutes)

```bash
python3 scripts/04_weekly_report.py
```

Generates `reports/report_YYYY-WW.txt` with full performance data.

**Before running:** make sure all Status, Response and Result columns
are filled in accurately for every lead you contacted.

**Result values to use:**
- `Positive` — they expressed interest
- `Negative` — they said no
- `No Reply` — no response after all follow-ups
- `Converted to Client` — signed up
- `Future Prospect` — interested but not ready yet

---

## STEP 5 — LEARN & ADAPT (Following Monday, after Step 4)

```bash
python3 scripts/05_learn_and_adapt.py
```

Reads all historical data and updates `data/strategy.json` with:
- Which sectors are responding best (focus more there)
- Which sectors are not responding (reduce focus)
- Which outreach angles are converting
- Whether to switch to DM-first approach
- Next week's action plan

**Your job:** Read the briefing it prints. Use it to guide your research in Step 1 next week.

---

## SHORTCUT — RUN SPECIFIC STEPS

```bash
python3 scripts/run_all.py --step 1      # Just Step 1
python3 scripts/run_all.py --steps 2,3   # Steps 2 and 3
python3 scripts/run_all.py --all         # All steps (end-of-week review)
```

---

## CSV HOUSEKEEPING RULES

1. **Update the CSV after every action** — treat it like a CRM
2. **Never delete a row** — change Status to "Not Interested" or "No Contact Found"
3. **Keep Notes specific** — "called 14/06, no answer" is useful; "tried to contact" is not
4. **Back it up weekly** — save a copy to Google Drive or email it to yourself

---

## WHAT TO DO WHEN A LEAD REPLIES

1. Update **Status** to "Replied"
2. Update **Response** — paste or summarise what they said
3. Update **Result** — Positive / Negative
4. Update **Next Action** — what you'll do next and when
5. If positive → book a call within 48 hours
6. If objection → use `outreach/templates/objection_responses.md`
7. If no → reply warmly and mark as "Not Interested"

---

## WHAT GOOD LOOKS LIKE (BENCHMARKS)

| Metric                | Baseline (Week 1–4) | Target (Week 8+) |
|-----------------------|---------------------|------------------|
| Leads per week        | 25–30               | 30–40            |
| HOT leads             | 5–10                | 10–15            |
| Reply rate            | 5–10%               | 15–20%           |
| Positive reply rate   | 1–3%                | 5–8%             |
| Meetings per week     | 0–1                 | 1–3              |
| New clients per month | 0                   | 1–2              |

Do not be discouraged by low numbers in the first 4 weeks.
The system improves as you feed it more data and personalise the messages better.

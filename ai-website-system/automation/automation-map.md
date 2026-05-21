# Automation Map

> This document maps the automation opportunities within the AI Website Creation System.
> The system works without any automation. These are enhancements to add over time.
> Priority order: highest ROI first.

---

## PHASE 1: NO AUTOMATION (Works Right Now)

The system is fully usable with just:
- Claude Code
- This repository
- Your client's information
- A text editor

Start here. Get 5 projects done. Then add automation where it actually saves time.

---

## PHASE 2: LIGHT AUTOMATION (Add Within 3 Months)

### A. Client Brief Intake Form → Auto-Brief

**Tool:** Tally.so or Typeform + Notion or Google Sheets

**What it does:**
Client fills out an online intake form. Answers automatically create a structured row in a Notion database or Google Sheet. You paste this into Claude Code as the brief input.

**Setup time:** 2–3 hours
**Time saved per project:** 30–60 minutes of copy-pasting and formatting

**How to set up:**
1. Create intake form in Tally.so (free) using the Client Brief Template
2. Connect Tally to Notion via native integration
3. Create a Notion template that maps form answers to brief sections
4. Send client the Tally form link instead of asking for info over email

---

### B. Project Folder Auto-Creation

**Tool:** Make (Integromat) or Zapier + Google Drive

**What it does:**
When a new project is added to your project tracker (Notion), automatically creates the project folder structure in Google Drive.

**Setup time:** 1–2 hours
**Time saved per project:** 15–20 minutes of folder creation

**Trigger:** New project added to Notion database
**Action:** Create Google Drive folder structure:
```
[CLIENT NAME]/
├── 01-brief/
├── 02-brand/
├── 03-sitemap/
├── 04-copy/
├── 05-design/
├── 06-development/
├── 07-seo/
├── 08-cro/
├── 09-qa/
├── 10-deployment/
└── 11-maintenance/
```

---

### C. GitHub Repository Auto-Creation

**Tool:** GitHub API + Make/Zapier or Claude Code command

**What it does:**
Creates a new GitHub repository for each client website project, pre-configured with the standard file structure.

**Setup time:** 2–3 hours
**Time saved per project:** 10–15 minutes + consistency of structure

**Command (Claude Code):**
```bash
gh repo create dnpebusiness-lab/[client-slug] --private --template [your-template-repo]
```

---

### D. Netlify Deploy Automation

**Tool:** Netlify + GitHub

**What it does:**
Every push to the `main` branch automatically deploys to production. Every pull request gets a preview URL.

**Setup time:** 30 minutes
**Value:** Zero-friction deployment, automatic preview URLs for client review

**Setup:**
1. Connect Netlify to GitHub
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Enable deploy previews for all pull requests
5. Set up Netlify notification to email client the preview URL

---

## PHASE 3: MEDIUM AUTOMATION (Add Within 6 Months)

### E. Client Approval Flow

**Tool:** Notion + Zapier + Email

**What it does:**
When a phase output is marked "Ready for Review" in Notion:
1. Automatically emails the client with a link to the preview/document
2. Client clicks "Approve" or "Request Changes"
3. Response logged in Notion
4. You're notified of the decision

**Setup time:** 3–4 hours
**Value:** Professional client experience, eliminates email ping-pong

---

### F. Automated Performance Monitoring

**Tool:** Google Search Console API + Google Sheets + Make

**What it does:**
Weekly automated pull of Search Console data for all active client sites into a Google Sheet dashboard. Flags any drops in ranking, traffic, or impressions.

**Setup time:** 4–6 hours
**Value:** You catch problems before clients do

**Trigger:** Weekly on Monday morning
**Action:** Pull clicks, impressions, average position for top 20 keywords for each client. Compare to previous week. Flag drops > 20%.

---

### G. Monthly Report Auto-Generation

**Tool:** Claude API + Google Analytics Data API + Google Sheets

**What it does:**
Monthly, automatically pulls GA4 + Search Console data for each client and passes it to Claude API with the Monthly Report Template. Generates a draft report for each client.

**Setup time:** 6–8 hours
**Value:** Monthly reports that used to take 1–2 hours each, generated in minutes

---

### H. Automated QA Link Checking

**Tool:** Broken Link Checker CLI + GitHub Actions

**What it does:**
On every deployment, automatically runs a link checker across the entire site. Fails the deployment if broken links are found.

**Setup time:** 2 hours
**Value:** Never launch with broken links

```yaml
# .github/workflows/link-check.yml
name: Check Links
on: push
jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Link Checker
        uses: lycheeverse/lychee-action@v1
        with:
          args: --verbose --no-progress './**/*.html'
```

---

## PHASE 4: ADVANCED AUTOMATION (Add After 12 Months)

### I. AI-Assisted Client Brief Analysis

**Tool:** Claude API

**What it does:**
When a new brief comes in (via form or email), automatically runs it through a Claude API call that:
1. Identifies missing information
2. Generates follow-up questions
3. Drafts the structured brief
4. Flags any strategic concerns

All output goes into Notion as a draft for your review before proceeding.

---

### J. Competitor Analysis Automation

**Tool:** Claude API + Web scraping

**What it does:**
Automatically analyses competitor websites mentioned in the brief and produces a competitive positioning summary for the Brand Strategy Agent.

---

### K. Google Search Console → Content Opportunity Alerts

**Tool:** GSC API + Claude API + Email

**What it does:**
Monthly: identifies keywords where the site is ranking positions 8–20 ("low-hanging fruit" for content optimisation). Sends an alert with specific content recommendations to improve rankings.

---

## AUTOMATION PRIORITY GUIDE

Start with the automations that save the most time on the most frequent tasks:

| Priority | Automation | Setup Time | Time Saved/Project |
|----------|------------|------------|-------------------|
| 1 | Client intake form | 2–3 hrs | 45 mins |
| 2 | Netlify deploy from GitHub | 30 mins | 15 mins + consistency |
| 3 | Project folder creation | 2 hrs | 20 mins |
| 4 | GitHub repo creation | 2 hrs | 15 mins |
| 5 | GitHub Actions link checker | 2 hrs | Catches issues early |
| 6 | Client approval flow | 4 hrs | 30 mins + better UX |
| 7 | Performance monitoring | 6 hrs | 1 hr/week |
| 8 | Monthly report generation | 8 hrs | 2 hrs/client/month |

---

## TOOLS REFERENCE

| Tool | Free plan | Use case | URL |
|------|-----------|----------|-----|
| Tally.so | Yes | Client intake forms | tally.so |
| Notion | Yes (limited) | Project management | notion.so |
| Make | Limited | Automation | make.com |
| Zapier | Very limited | Automation | zapier.com |
| Netlify | Yes (generous) | Hosting + deploy | netlify.com |
| GitHub | Yes | Code + CI/CD | github.com |
| Google Analytics | Free | Traffic tracking | analytics.google.com |
| Google Search Console | Free | SEO tracking | search.google.com/search-console |
| Google Drive | 15GB free | File storage | drive.google.com |
| Claude API | Paid per use | AI automation | anthropic.com |

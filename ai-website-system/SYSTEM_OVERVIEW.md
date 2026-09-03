# AI Website System — Architecture & Implementation Guide

## System Architecture

```
                    ┌─────────────────────────┐
                    │     CLIENT BRIEF         │
                    │  (Raw input from client) │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │    ORCHESTRATOR AGENT    │
                    │  (Project Director)      │
                    │  Controls all phases     │
                    │  Gates all quality       │
                    └──────────┬──────────────┘
                               │
        ┌──────────────────────▼─────────────────────────┐
        │                 PHASE PIPELINE                  │
        │                                                 │
        │  Phase 1  → Client Brief Agent                  │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 2  → Brand Strategy Agent               │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 3  → UX / Sitemap Agent                  │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 4  → Copywriting Agent                   │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 5  → UI Design Agent (wireframe logic)   │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 6  → UI Design Agent (visual direction)  │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 7  → Frontend Dev Agent                  │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 8  → SEO Agent                           │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 9  → CRO Agent                           │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 10 → Performance Agent                   │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 11 → QA Agent                            │
        │     ↓ [QUALITY GATE]                            │
        │  Phase 12 → Deployment Agent                    │
        │     ↓ [FINAL SIGN-OFF]                          │
        │  Ongoing  → Maintenance Agent                   │
        └─────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │      LIVE WEBSITE        │
                    └─────────────────────────┘
```

---

## Data Flow

Each agent receives a **structured brief** from the Orchestrator:
- Original client brief (always)
- All previously approved outputs relevant to their task
- Specific instructions for this phase
- Quality standards they must meet
- What they must NOT do

Each agent produces a **structured output**:
- Follows the defined format for that agent
- Includes a self-review checklist
- Handed back to the Orchestrator for approval

The Orchestrator approves → versions the document → briefs the next agent.

---

## Quality Gate System

Every phase has a quality gate. The gate asks:

1. Is the output complete? (No TBDs, no placeholders)
2. Is it specific to this client? (Passes the "could this be anyone else's?" test)
3. Does it align with previous approved outputs?
4. Does it serve the client's stated goals?
5. Does it set up the next phase correctly?

Fail any → revise. Pass all → approve and version.

---

## Document Versioning

- Every approved document gets a version number: `v1`, `v2`, `v3`
- Revisions create new files, never overwrite
- The Orchestrator tracks current approved version of each document
- File naming: `[client-slug]-[document-type]-v[n].md`
- Example: `bean-and-bloom-brand-strategy-v2.md`

---

## Skill System

Skills are specialised instruction modules that can be injected into any agent for specific project types or tasks.

```
Project Type          →  Skills to Activate
─────────────────────────────────────────────
Restaurant/Café       →  hospitality-website + local-seo + conversion-copywriting
B&B/Hotel             →  hospitality-website + local-seo + premium-website-design
Service Business      →  landing-page + conversion-copywriting + local-seo
Shopify/E-commerce    →  shopify-website + cro-audit + technical-seo
Any Project           →  premium-website-design + qa-testing + performance-optimisation
```

To use a skill: open the skill file and paste its contents into the agent's context as additional instructions.

---

## Implementation Plan — Setting Up in Claude Code

### Week 1: Foundation Setup

**Day 1–2: Clone and organise**
```bash
# Clone the system repo
git clone [this-repo-url] ~/lumus-agency-system
cd ~/lumus-agency-system
```

**Day 3: Set up your first CLAUDE.md**
Create a `CLAUDE.md` at the system root. This file tells Claude Code the default operating context.

Paste this into your CLAUDE.md:
```
You are operating as part of the Lumus Agency AI Website Creation System.
Default to the Orchestrator Agent role unless a specific sub-agent is requested.
All work must meet premium quality standards. No generic outputs.
Project files are in /client-projects/[client-name]/
Agent prompts are in /agents/
Skills are in /skills/
```

**Day 4–5: Set up first client project folder**
```bash
cp -r client-projects/_template/ client-projects/your-first-client/
```
Fill in `00-project-brief.md` with the client's information.

### Week 2: First Project Run

1. Open Claude Code in the system directory
2. Start with: paste the Orchestrator system prompt
3. Give it the client brief from `00-project-brief.md`
4. Follow each phase using the workflow document
5. Save all outputs into the client project folder

### Week 3: Optimise the System

- Review what worked and what needed revision
- Adjust agent prompts based on real results
- Add custom skills for client types you encounter frequently
- Start building reusable copy blocks and design patterns

---

## Using Claude Code Effectively

### Starting a New Phase
Paste the relevant agent prompt + the Orchestrator's briefing for that phase. Example:
```
[Paste: Brand Strategy Agent prompt]
[Paste: Orchestrator briefing with client context]
[Paste: Approved client brief output]

Proceed with Phase 2: Brand Strategy.
```

### Saving Outputs
After each phase, save the output into the correct client project subfolder with proper versioning.

### Context Management
For long projects, keep a running `project-status.md` in the client folder that summarises:
- Current phase
- Approved outputs (with versions)
- Pending tasks
- Open questions

---

## Tool Integrations (Phase 2+)

| Tool | Integration Point | Benefit |
|---|---|---|
| GitHub | Code repository + CI/CD | Version control + automated deployment |
| Netlify | Deployment | Instant hosting + previews |
| Notion | Client briefs + project tracking | Centralised project management |
| Google Drive | Asset delivery | Client file sharing |
| Google Analytics | Post-launch | Traffic monitoring |
| Google Search Console | Post-launch | SEO performance |
| Zapier/Make | Cross-tool automation | New brief → auto-create folder structure |

All tools are optional at start. The system works with Claude Code alone.

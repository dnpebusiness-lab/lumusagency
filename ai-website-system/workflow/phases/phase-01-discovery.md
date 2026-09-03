# Phase 1 — Client Discovery

## Objective
Extract, clarify, and structure all the information needed to build a high-quality website. Produce a complete, specific project brief that every subsequent agent can use as their foundation.

## Responsible Agent
Client Brief Agent (`/agents/01-client-brief-agent.md`)

## Required Input
- Client-supplied information (call notes, email, intake form, conversation)
- Any existing website URL
- Any existing brand assets

## Process

1. Orchestrator reviews raw client input
2. Orchestrator identifies gaps and missing information
3. Orchestrator activates Client Brief Agent with all available input
4. Client Brief Agent produces draft brief (v1)
5. If gaps remain, Client Brief Agent generates targeted follow-up questions
6. Client answers are incorporated into the brief
7. Orchestrator reviews brief for completeness and specificity
8. If approved → version and save. If not → revision instructions to Client Brief Agent.

## Expected Output

File: `[client-slug]-client-brief-v1.md`
Saved to: `client-projects/[client-slug]/01-brief/`

Contents:
- Business overview (specific, not generic)
- Primary goal (one sentence, specific outcome)
- Secondary goals
- Target audience (detailed, specific)
- Unique selling points (genuine, not generic)
- Existing brand assets
- Pages required
- Key actions (conversions)
- Tone and feel
- Technical requirements
- Timeline
- Open questions

## Quality Gate

Do NOT approve and move to Phase 2 unless:
- [ ] All sections complete — no blank fields, no "TBD"
- [ ] Primary goal is a single sentence with a specific, measurable outcome
- [ ] USPs are specific to this business (not claims any competitor could make)
- [ ] Target audience description is specific enough to recognise in real life
- [ ] Tone description is more specific than generic adjectives ("modern", "clean")
- [ ] All open questions are documented
- [ ] The brief summary could brief a stranger on this project completely

## Common Issues to Watch For

- Client says "I want a beautiful website" → Push for specific business goal
- USPs are generic ("great quality", "best service") → Ask for specifics and evidence
- Target audience is vague ("everyone", "families") → Ask for specific person description
- Tone is generic ("professional and friendly") → Ask for reference websites or 3 specific words
- No professional photography → Flag this early — it affects design significantly

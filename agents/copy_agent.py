"""
Copy Agent — writes personalised Email A, Email B, Instagram DM, Follow-Up 1 & 2.

Uses Claude (claude-sonnet-4-6) when ANTHROPIC_API_KEY is set; falls back to
templates when the key is absent.

Claude produces genuinely personalised copy — specific to the business's actual
weaknesses, sector, and location — rather than fill-in-the-blank templates.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import AGENCY_EMAIL, AGENCY_WEBSITE, AGENCY_NAME

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


# ── Fallback templates (used when Anthropic API key is not set) ────────────────

def _template_email_a(name, sector, location, angle, service):
    return (
        f"Subject: {name} — one thing costing you customers right now\n\n"
        f"Hi,\n\n"
        f"I was looking at {sector.lower()}s in {location} and came across {name}.\n\n"
        f"{angle}.\n\n"
        f"At Lumus we help local businesses fix this quickly — no jargon, no long contracts. "
        f"Specifically, we'd sort your {service.lower()} within a few weeks.\n\n"
        f"Worth a quick 15-minute call?\n\n"
        f"— Lumus\n{AGENCY_EMAIL} | {AGENCY_WEBSITE}"
    )


def _template_email_b(name, sector, location, service):
    return (
        f"Subject: What a stronger online presence could mean for {name}\n\n"
        f"Hi,\n\n"
        f"I noticed {name} while researching {sector.lower()}s in {location} — "
        f"and I think there's a straightforward opportunity here.\n\n"
        f"Businesses in your sector that have sorted their {service.lower()} "
        f"are consistently getting more enquiries and footfall — just from being "
        f"easier to find and looking more credible online.\n\n"
        f"If you'd like, I can put together a free snapshot of what we'd improve "
        f"for {name} — takes us about 20 minutes and it's yours to keep.\n\n"
        f"Worth a look?\n\n"
        f"— Lumus\n{AGENCY_EMAIL} | {AGENCY_WEBSITE}"
    )


def _template_dm(name, sector, location, service):
    return (
        f"Hi! Came across {name} — love what you're doing.\n\n"
        f"Quick question: have you sorted your {service.lower()} yet? "
        f"A lot of {sector.lower()}s in {location} are missing customers because of this.\n\n"
        f"Happy to share a couple of ideas — no strings. — Lumus 🌟"
    )


def _template_followup1(name, service):
    return (
        f"Subject: Re: {name} — just checking in\n\n"
        f"Hi,\n\n"
        f"Sent a note last week about {service.lower()} for {name} — "
        f"just following up in case it got buried.\n\n"
        f"Happy to send a free one-page audit if that's easier. Just say the word.\n\n"
        f"— Lumus\n{AGENCY_EMAIL}"
    )


def _template_followup2(name, service):
    return (
        f"Subject: Last one from me — {name}\n\n"
        f"Hi,\n\nThis is my last message — don't want to be a nuisance.\n\n"
        f"If {name} ever needs help with {service.lower()}, we're here.\n\n"
        f"Wishing you a great week.\n— Lumus\n{AGENCY_EMAIL}"
    )


# ── Claude-powered copy ────────────────────────────────────────────────────────

_SYSTEM_PROMPT = f"""You write cold outreach emails and Instagram DMs for Lumus, a small digital
marketing agency in Galway, Ireland.

Lumus's tone: friendly, direct, no jargon, short sentences, British/Irish English.
Sound like a real person from Galway, not a marketing template.

Lumus contact: {AGENCY_EMAIL} | {AGENCY_WEBSITE}

Rules you must follow:
- Under 150 words for emails, under 80 words for DMs
- One clear ask per message — never multiple requests
- Reference the specific weakness (no website, no Google listing, etc.)
- Never be vague — name the exact problem and the exact fix
- No exclamation marks in emails (DMs can have one emoji max)
- Sign off: "— Lumus\\n{AGENCY_EMAIL} | {AGENCY_WEBSITE}" for emails
- For DMs: sign off "— Lumus" (no contact details)
- Include "Subject: <line>" as the first line of each email
- Output ONLY the message text — no explanations, no labels, no commentary"""


def _claude_outreach(client, lead: dict) -> dict:
    name = lead.get("Business Name", "the business")
    sector = lead.get("Sector", "local business")
    location = lead.get("Location", "your area")
    weakness = lead.get("Main Weakness", "limited online presence")
    opportunity = lead.get("Commercial Opportunity", "")
    service = lead.get("Recommended Lumus Service", "digital presence work")
    angle = lead.get("Outreach Angle", weakness)
    notes = lead.get("Notes", "")

    context = (
        f"Business: {name}\n"
        f"Sector: {sector}\n"
        f"Location: {location}\n"
        f"Main weakness: {weakness}\n"
        f"Recommended service: {service}\n"
        f"Outreach angle: {angle}\n"
    )
    if opportunity:
        context += f"Commercial opportunity: {opportunity}\n"
    if notes:
        context += f"Research notes: {notes}\n"

    prompts = {
        "email_a": (
            f"{context}\n"
            f"Write Email Version A (problem/pain angle) to {name}. "
            f"Lead with the specific problem they have — make the subject line about their "
            f"actual weakness, not a generic phrase."
        ),
        "email_b": (
            f"{context}\n"
            f"Write Email Version B (opportunity/gain angle) to {name}. "
            f"Lead with what they could have, not what's wrong. Different subject line, "
            f"different opening, but same service offer."
        ),
        "dm": (
            f"{context}\n"
            f"Write an Instagram DM to {name}. Under 80 words. Casual, friendly. "
            f"One question or offer — not a pitch. No subject line needed."
        ),
        "followup1": (
            f"{context}\n"
            f"Write Follow-Up 1 (sent 5–7 days after Email A). Reference the previous email. "
            f"Light touch — offer the free audit as an easier first step. "
            f"Include subject line."
        ),
        "followup2": (
            f"{context}\n"
            f"Write Follow-Up 2 (sent 10–14 days after first contact). "
            f"Final message — graceful close. Leave the door open without being pushy. "
            f"Include subject line."
        ),
    }

    results = {}
    for key, prompt in prompts.items():
        try:
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=400,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )
            results[key] = response.content[0].text.strip()
        except Exception as e:
            print(f"  [copy] Claude error for {name} ({key}): {e} — using template")
            results[key] = None

    return results


def run(leads: list[dict]) -> list[dict]:
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")

    if HAS_ANTHROPIC and api_key:
        client = anthropic.Anthropic(api_key=api_key)
        use_claude = True
        print("[copy] Using Claude (claude-sonnet-4-6) for personalised outreach")
    else:
        use_claude = False
        if not HAS_ANTHROPIC:
            print("[copy] anthropic package not installed — using templates (pip install anthropic)")
        else:
            print("[copy] ANTHROPIC_API_KEY not set — using templates")

    for lead in leads:
        name = lead.get("Business Name", "your business")
        sector = lead.get("Sector", "local business")
        location = lead.get("Location", "your area")
        angle = lead.get("Outreach Angle", "Your digital presence could be stronger")
        service = lead.get("Recommended Lumus Service", "digital presence")

        if use_claude:
            copy = _claude_outreach(client, lead)
            lead["Email Version A"] = copy["email_a"] or _template_email_a(name, sector, location, angle, service)
            lead["Email Version B"] = copy["email_b"] or _template_email_b(name, sector, location, service)
            lead["Instagram DM"] = copy["dm"] or _template_dm(name, sector, location, service)
            lead["Follow-Up 1"] = copy["followup1"] or _template_followup1(name, service)
            lead["Follow-Up 2"] = copy["followup2"] or _template_followup2(name, service)
        else:
            lead["Email Version A"] = _template_email_a(name, sector, location, angle, service)
            lead["Email Version B"] = _template_email_b(name, sector, location, service)
            lead["Instagram DM"] = _template_dm(name, sector, location, service)
            lead["Follow-Up 1"] = _template_followup1(name, service)
            lead["Follow-Up 2"] = _template_followup2(name, service)

        print(f"  [copy] Wrote outreach for: {name}")

    print(f"[copy] {len(leads)} outreach sets generated")
    return leads

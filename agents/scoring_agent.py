"""
Scoring Agent — scores leads 0–100, assigns HOT/WARM/COLD, drops COLD leads.
Extracted from 02_score_leads.py; operates on in-memory lead dicts.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import EFFICIENCY, PRIORITY_THRESHOLDS

HIGH_VALUE_SECTORS = ["Café", "Restaurant", "Hair Salon", "Beauty Salon", "Gym", "Clinic", "Pub"]
HIGH_VALUE_LOCATIONS = ["Galway City", "Salthill", "Oranmore"]

SERVICE_MAP = {
    "No website": "Website Redesign",
    "Website unreachable or very slow": "Website Redesign",
    "Not mobile-friendly": "Website Redesign",
    "No Instagram account": "Instagram Content & Management",
    "No contact info visible": "Website Redesign",
    "No Google Business Profile": "Google Business Profile Optimisation",
    "Low Instagram engagement": "Social Media Audit & Strategy",
    "Very thin content": "Website Redesign",
}

ANGLE_MAP = {
    "No website": "No online presence — losing customers to competitors every day",
    "Website unreachable or very slow": "Website is down or too slow — costing bookings",
    "Not mobile-friendly": "Website doesn't work on mobile — most local searches are on phones",
    "No Instagram account": "No Instagram — competitors are winning that audience",
    "No Google Business Profile": "Invisible on Google Maps — missing daily local searches",
}


def score_lead(lead: dict) -> dict:
    score = 0
    issues = lead.get("_audit", {}).get("issues", [])
    weakness = lead.get("Main Weakness", "")
    sector = lead.get("Sector", "")
    location = lead.get("Location", "")

    issue_set = set(issues) | set(weakness.split(" | "))

    if "No website" in issue_set or "Website unreachable" in issue_set:
        score += 25
    if "Not mobile-friendly" in issue_set or "outdated" in weakness.lower():
        score += 15
    if "No Google Business Profile" in issue_set or not lead.get("Google Business Profile", ""):
        score += 20
    if "few reviews" in weakness.lower() or "low rating" in weakness.lower():
        score += 10
    if "No Instagram account" in issue_set:
        score += 15
    if "Low Instagram engagement" in issue_set or "inactive" in weakness.lower():
        score += 5
    if sector in HIGH_VALUE_SECTORS:
        score += 10
    if any(loc in location for loc in HIGH_VALUE_LOCATIONS):
        score += 5

    # Label
    if score >= PRIORITY_THRESHOLDS["hot"]:
        label = f"HOT ({score})"
    elif score >= PRIORITY_THRESHOLDS["warm"]:
        label = f"WARM ({score})"
    else:
        label = f"COLD ({score})"

    # Top service
    services = [SERVICE_MAP[i] for i in issue_set if i in SERVICE_MAP]
    top_service = services[0] if len(services) == 1 else "Full Digital Presence Audit"

    # Outreach angle
    angle = next((ANGLE_MAP[i] for i in issue_set if i in ANGLE_MAP),
                 f"Digital presence below average for {location}")

    lead["Priority Score"] = label
    lead["Recommended Lumus Service"] = top_service
    lead["Outreach Angle"] = angle
    lead["Commercial Opportunity"] = f"Fix {top_service.lower()} to improve local visibility and enquiries"
    lead["_score"] = score
    return lead


def run(leads: list[dict]) -> list[dict]:
    """Score all leads, return only those above outreach threshold."""
    min_score = EFFICIENCY["outreach_min_score"]
    scored = [score_lead(l) for l in leads]
    hot = [l for l in scored if l.get("_score", 0) >= min_score]
    cold_count = len(scored) - len(hot)
    print(f"[scoring] {len(hot)} HOT, {cold_count} below threshold (dropped)")
    return hot

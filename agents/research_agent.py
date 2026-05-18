"""
Research Agent — finds local businesses matching Lumus target profile.
Returns up to MAX_LEADS structured dicts ready for the audit agent.
"""

import re
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import EFFICIENCY, TARGET_LOCATIONS, TARGET_SECTORS

MAX_LEADS = EFFICIENCY["max_leads_per_run"]

# Skip obvious chains
CHAIN_KEYWORDS = [
    "mcdonalds", "supermacs", "costa", "starbucks", "subway", "kfc",
    "burger king", "dominos", "tesco", "lidl", "aldi", "spar", "centra",
]


def _is_chain(name: str) -> bool:
    return any(k in name.lower() for k in CHAIN_KEYWORDS)


def _extract_website(result: dict) -> str:
    href = result.get("href", "")
    # Skip directory sites — we want the business's own site
    skip = ["tripadvisor", "yelp", "facebook.com", "instagram.com",
            "goldenpages", "booking.com", "google.com", "bing.com"]
    if any(s in href for s in skip):
        return ""
    return href


def search_businesses(location: str, sector: str, max_results: int = 3) -> list[dict]:
    """Search DuckDuckGo for local businesses. Returns list of raw result dicts."""
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        print("[research] duckduckgo_search not installed — run: pip install duckduckgo-search")
        return []

    query = f"{sector} {location} Ireland contact website"
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results * 2):
                results.append(r)
                if len(results) >= max_results * 2:
                    break
        time.sleep(1)  # polite delay
    except Exception as e:
        print(f"[research] Search failed for '{query}': {e}")
        return []

    return results


def parse_result(raw: dict, sector: str, location: str) -> dict | None:
    """Convert a raw search result into a structured lead dict."""
    title = raw.get("title", "").strip()
    body = raw.get("body", "").strip()
    href = raw.get("href", "")

    if not title or _is_chain(title):
        return None

    # Try to extract email from snippet
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", body)
    email = email_match.group(0) if email_match else ""

    # Try to extract phone (Irish formats)
    phone_match = re.search(r"(\+353|0)[\s\-]?\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}", body)
    phone = phone_match.group(0) if phone_match else ""

    website = _extract_website(raw)

    return {
        "Business Name": title[:80],
        "Sector": sector,
        "Location": location,
        "Website": website or "none",
        "Instagram": "none",
        "Google Business Profile": "none",
        "Email": email,
        "Phone": phone,
        "Main Weakness": "",
        "Notes": body[:200],
    }


def run(strategy: dict | None = None) -> list[dict]:
    """
    Main entry point. Returns up to MAX_LEADS new leads.
    Uses strategy focus_sectors/focus_locations if available.
    """
    focus_sectors = (strategy or {}).get("focus_sectors", TARGET_SECTORS[:3])
    focus_locations = (strategy or {}).get("focus_locations", TARGET_LOCATIONS[:2])

    leads = []
    seen_names = set()

    for location in focus_locations:
        for sector in focus_sectors:
            if len(leads) >= MAX_LEADS:
                break
            raw_results = search_businesses(location, sector, max_results=2)
            for raw in raw_results:
                if len(leads) >= MAX_LEADS:
                    break
                lead = parse_result(raw, sector, location)
                if lead and lead["Business Name"] not in seen_names:
                    seen_names.add(lead["Business Name"])
                    leads.append(lead)
                    print(f"  [research] Found: {lead['Business Name']} ({sector}, {location})")
        if len(leads) >= MAX_LEADS:
            break

    print(f"[research] {len(leads)} leads found")
    return leads


if __name__ == "__main__":
    results = run()
    for r in results:
        print(r)

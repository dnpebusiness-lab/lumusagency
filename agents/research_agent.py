"""
Research Agent — finds local businesses using Google Places API.

Requires environment variable: GOOGLE_PLACES_API_KEY
Get a free key at https://console.cloud.google.com/
Enable: Places API (New) or Places API (Legacy)
Free tier: 28,500 requests/month — far more than weekly needs.
"""

import os
import re
import sys
import time

import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.lumus_config import EFFICIENCY, TARGET_LOCATIONS, TARGET_SECTORS

MAX_LEADS = EFFICIENCY["max_leads_per_run"]

CHAIN_KEYWORDS = [
    "mcdonalds", "supermacs", "costa", "starbucks", "subway", "kfc",
    "burger king", "dominos", "tesco", "lidl", "aldi", "spar", "centra",
]

# Maps our sector labels to Google Places search terms
SECTOR_QUERIES = {
    "Café":              "cafe",
    "Restaurant":        "restaurant",
    "Pub":               "pub",
    "B&B":               "bed and breakfast",
    "Hotel":             "hotel",
    "Barber":            "barber",
    "Hair Salon":        "hair salon",
    "Beauty Salon":      "beauty salon",
    "Gym":               "gym",
    "Clinic":            "clinic",
    "Takeaway":          "takeaway",
    "Independent Retail": "independent shop",
}

# Location → (lat, lng) for Places API bias
LOCATION_COORDS = {
    "Galway City":  (53.2707, -9.0568),
    "Liosban":      (53.2650, -9.0800),
    "Salthill":     (53.2620, -9.0820),
    "Oranmore":     (53.2619, -8.9275),
    "Westport":     (53.7998, -9.5183),
    "Mayo":         (53.8600, -9.3000),
    "Connaught":    (53.7500, -9.0000),
}

PLACES_TEXT_URL  = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAIL_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def _is_chain(name: str) -> bool:
    return any(k in name.lower() for k in CHAIN_KEYWORDS)


def _text_search(query: str, lat: float, lng: float, api_key: str) -> list[dict]:
    params = {
        "query": query,
        "location": f"{lat},{lng}",
        "radius": 8000,
        "key": api_key,
    }
    try:
        r = requests.get(PLACES_TEXT_URL, params=params, timeout=10)
        r.raise_for_status()
        data = r.json()
        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            print(f"  [research] Places API error: {data.get('status')} — {data.get('error_message', '')}")
        return data.get("results", [])
    except requests.RequestException as e:
        print(f"  [research] Request failed: {e}")
        return []


def _get_details(place_id: str, api_key: str) -> dict:
    params = {
        "place_id": place_id,
        "fields": "name,formatted_phone_number,website,url",
        "key": api_key,
    }
    try:
        r = requests.get(PLACES_DETAIL_URL, params=params, timeout=10)
        r.raise_for_status()
        return r.json().get("result", {})
    except requests.RequestException:
        return {}


def _parse_place(place: dict, detail: dict, sector: str, location: str) -> dict | None:
    name = place.get("name", "").strip()
    if not name or _is_chain(name):
        return None

    website = detail.get("website", "none") or "none"
    # Strip tracking params — keep base URL only
    website = re.sub(r"\?.*$", "", website).rstrip("/") or "none"

    phone = detail.get("formatted_phone_number", "") or ""
    phone = re.sub(r"\s+", " ", phone).strip()

    rating = place.get("rating", 0)
    review_count = place.get("user_ratings_total", 0)
    gbp_url = detail.get("url", "none") or "none"

    notes_parts = []
    if rating:
        notes_parts.append(f"Google rating: {rating}/5 ({review_count} reviews)")
    if review_count < 20:
        notes_parts.append("few reviews")

    return {
        "Business Name": name[:80],
        "Sector": sector,
        "Location": location,
        "Website": website,
        "Instagram": "none",
        "Google Business Profile": gbp_url,
        "Email": "",
        "Phone": phone,
        "Main Weakness": "",
        "Notes": " | ".join(notes_parts)[:200],
        "_rating": rating,
        "_review_count": review_count,
    }


def search_businesses(location: str, sector: str, api_key: str, max_results: int = 3) -> list[dict]:
    coords = LOCATION_COORDS.get(location)
    if not coords:
        return []

    query_term = SECTOR_QUERIES.get(sector, sector.lower())
    query = f"{query_term} in {location} Ireland"
    lat, lng = coords

    raw = _text_search(query, lat, lng, api_key)
    leads = []
    for place in raw[:max_results * 2]:
        if len(leads) >= max_results:
            break
        place_id = place.get("place_id", "")
        detail = _get_details(place_id, api_key) if place_id else {}
        time.sleep(0.1)  # stay well within rate limits
        lead = _parse_place(place, detail, sector, location)
        if lead:
            leads.append(lead)

    return leads


def run(strategy: dict | None = None) -> list[dict]:
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY", "")
    if not api_key:
        print(
            "[research] GOOGLE_PLACES_API_KEY not set.\n"
            "  1. Go to https://console.cloud.google.com/\n"
            "  2. Create a project → enable 'Places API'\n"
            "  3. Create an API key → set env var GOOGLE_PLACES_API_KEY=<key>\n"
            "  Or add it to a .env file and load it before running."
        )
        return []

    focus_sectors   = (strategy or {}).get("focus_sectors",   TARGET_SECTORS[:3])
    focus_locations = (strategy or {}).get("focus_locations", TARGET_LOCATIONS[:2])

    leads = []
    seen_names: set[str] = set()

    for location in focus_locations:
        for sector in focus_sectors:
            if len(leads) >= MAX_LEADS:
                break
            raw_leads = search_businesses(location, sector, api_key, max_results=2)
            for lead in raw_leads:
                if len(leads) >= MAX_LEADS:
                    break
                name = lead["Business Name"]
                if name not in seen_names:
                    seen_names.add(name)
                    leads.append(lead)
                    print(f"  [research] Found: {name} ({sector}, {location})")
        if len(leads) >= MAX_LEADS:
            break

    print(f"[research] {len(leads)} leads found")
    return leads


if __name__ == "__main__":
    results = run()
    for r in results:
        print(r)

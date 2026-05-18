"""
Audit Agent — checks each lead's website, GBP link, and social media.
Adds Main Weakness and flags to each lead dict.
Keeps audit notes under 150 words per lead.
"""

import re
import sys
import os

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; LumusAuditBot/1.0)"}
TIMEOUT = 6

SOCIAL_PATTERNS = {
    "instagram": r"instagram\.com/([A-Za-z0-9_.]+)",
    "facebook": r"facebook\.com/([A-Za-z0-9_.]+)",
    "tiktok": r"tiktok\.com/@([A-Za-z0-9_.]+)",
}
GBP_PATTERN = r"maps\.google\.com|google\.com/maps|g\.page"


def _fetch(url: str) -> str | None:
    if not HAS_REQUESTS:
        return None
    if not url.startswith("http"):
        url = "https://" + url
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        return r.text if r.status_code == 200 else None
    except Exception:
        return None


def _check_website(url: str) -> dict:
    result = {"has_website": False, "mobile_ready": False, "has_contact": False,
              "social_links": {}, "has_gbp_link": False, "issues": []}

    if not url or url.strip().lower() in ("none", "n/a", "-", ""):
        result["issues"].append("No website")
        return result

    html = _fetch(url)
    if not html:
        result["issues"].append("Website unreachable or very slow")
        return result

    result["has_website"] = True
    soup = BeautifulSoup(html, "html.parser")
    text = html.lower()

    # Mobile viewport
    if soup.find("meta", attrs={"name": "viewport"}):
        result["mobile_ready"] = True
    else:
        result["issues"].append("Not mobile-friendly")

    # Contact signals
    if any(kw in text for kw in ["contact", "email", "phone", "tel:", "mailto:"]):
        result["has_contact"] = True
    else:
        result["issues"].append("No contact info visible")

    # Social links in page
    for platform, pattern in SOCIAL_PATTERNS.items():
        m = re.search(pattern, html, re.IGNORECASE)
        if m:
            result["social_links"][platform] = m.group(1)

    # GBP link
    if re.search(GBP_PATTERN, html, re.IGNORECASE):
        result["has_gbp_link"] = True

    # Basic content check
    body_text = soup.get_text()
    if len(body_text.strip()) < 200:
        result["issues"].append("Very thin content")

    return result


def _check_instagram(handle: str) -> dict:
    """Light check — we can't scrape Instagram reliably. Flag as unknown if handle missing."""
    if not handle or handle.strip().lower() in ("none", "n/a", "-", ""):
        return {"has_instagram": False, "issues": ["No Instagram account"]}
    return {"has_instagram": True, "issues": []}


def audit_lead(lead: dict) -> dict:
    """Run a light audit on one lead. Returns lead dict with added audit fields."""
    website_data = _check_website(lead.get("Website", ""))
    ig_data = _check_instagram(lead.get("Instagram", ""))

    all_issues = website_data["issues"] + ig_data["issues"]

    # Update social links found on website
    for platform, handle in website_data.get("social_links", {}).items():
        if platform == "instagram" and lead.get("Instagram", "none") == "none":
            lead["Instagram"] = f"@{handle}"

    # GBP: if found on site, mark it
    if website_data.get("has_gbp_link") and lead.get("Google Business Profile", "none") == "none":
        lead["Google Business Profile"] = "Found (link on website)"

    # Build Main Weakness — under 150 words
    if all_issues:
        lead["Main Weakness"] = " | ".join(all_issues)
    elif not lead.get("Main Weakness"):
        lead["Main Weakness"] = "Presence exists but needs quality review"

    lead["_audit"] = {
        "has_website": website_data["has_website"],
        "mobile_ready": website_data["mobile_ready"],
        "has_instagram": ig_data["has_instagram"],
        "issues": all_issues,
    }

    return lead


def run(leads: list[dict]) -> list[dict]:
    if not HAS_REQUESTS:
        print("[audit] requests/bs4 not installed — skipping live checks")
        for lead in leads:
            if not lead.get("Main Weakness"):
                lead["Main Weakness"] = "Audit skipped — install requests and beautifulsoup4"
            lead["_audit"] = {"issues": []}
        return leads

    audited = []
    for lead in leads:
        name = lead.get("Business Name", "?")
        print(f"  [audit] Checking: {name}")
        audited.append(audit_lead(lead))
    print(f"[audit] {len(audited)} leads audited")
    return audited


if __name__ == "__main__":
    sample = [{"Business Name": "Test Café", "Website": "https://example.com",
               "Instagram": "none", "Google Business Profile": "none"}]
    print(run(sample))

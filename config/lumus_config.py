# Lumus Agency — System Configuration

AGENCY_NAME = "Lumus"
AGENCY_TAGLINE = "We help local businesses look better, communicate clearer and convert more online."
AGENCY_EMAIL = "hello@lumusagency.ie"
AGENCY_WEBSITE = "https://lumusagency.ie"
AGENCY_INSTAGRAM = "@lumusagency"

# Target locations
TARGET_LOCATIONS = [
    "Galway City",
    "Liosban",
    "Salthill",
    "Oranmore",
    "Westport",
    "Mayo",
    "Connaught",
]

# Target sectors
TARGET_SECTORS = [
    "Café",
    "Restaurant",
    "Pub",
    "B&B",
    "Hotel",
    "Barber",
    "Hair Salon",
    "Beauty Salon",
    "Gym",
    "Clinic",
    "Takeaway",
    "Independent Retail",
]

# Services Lumus offers
LUMUS_SERVICES = [
    "Website Redesign",
    "Google Business Profile Optimisation",
    "Instagram Content & Management",
    "Brand Identity & Visual Refresh",
    "Local SEO",
    "Photography & Visual Content",
    "Email Marketing Setup",
    "Reputation Management (Reviews)",
    "Social Media Audit & Strategy",
    "Full Digital Presence Audit",
]

# Lead scoring weights (must sum to 100)
SCORING_WEIGHTS = {
    "no_website": 25,
    "poor_website": 15,
    "no_google_business": 20,
    "poor_google_reviews": 10,
    "no_instagram": 15,
    "low_instagram_engagement": 5,
    "sector_fit": 10,
    "location_fit": 5,
    "in_top_sectors": 10,
}

# Priority thresholds
PRIORITY_THRESHOLDS = {
    "hot": 70,       # Score >= 70 → Hot lead, contact immediately
    "warm": 45,      # Score >= 45 → Warm lead, worth contacting
    "cold": 0,       # Score < 45  → Cold, monitor or skip
}

# CSV column order — do not change without updating all scripts
CSV_COLUMNS = [
    "Date Added",
    "Business Name",
    "Sector",
    "Location",
    "Website",
    "Instagram",
    "Google Business Profile",
    "Email",
    "Phone",
    "Main Weakness",
    "Commercial Opportunity",
    "Recommended Lumus Service",
    "Priority Score",
    "Outreach Angle",
    "Email Version A",
    "Email Version B",
    "Instagram DM",
    "Follow-Up 1",
    "Follow-Up 2",
    "Status",
    "Response",
    "Result",
    "Notes",
    "Next Action",
]

# Status values (use these consistently)
STATUS_OPTIONS = [
    "New",
    "Researched",
    "Email Sent",
    "DM Sent",
    "Follow-Up 1 Sent",
    "Follow-Up 2 Sent",
    "Replied",
    "Meeting Booked",
    "Proposal Sent",
    "Won",
    "Lost",
    "Not Interested",
    "No Contact Found",
    "Paused",
]

# Result values
RESULT_OPTIONS = [
    "Pending",
    "Positive",
    "Negative",
    "No Reply",
    "Converted to Client",
    "Future Prospect",
]

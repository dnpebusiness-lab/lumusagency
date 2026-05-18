# SKILL: digital-audit

**Purpose:** Audit a local business's digital presence and identify specific weaknesses.

## What to check for each business

### 1. Website
- Does it exist? (search "[business name] [location]" on Google)
- Is it mobile-friendly? (check on phone)
- Does it load quickly? (if slow, it's a problem)
- Is it up to date? (correct hours, menu, prices, contact info)
- Does it have a clear call to action? (book, call, get directions)
- Is there a contact form or email address visible?
- Does it have Google Analytics or any tracking?

**Weakness flags:**
- No website → Major weakness (score: 25 points)
- Website exists but is slow/outdated/not mobile-friendly → Medium (15 points)
- Website exists but has no CTA or contact info → Minor (5 points)

### 2. Google Business Profile
- Does it appear in Google Maps? (search business name + location)
- Is the profile fully filled in? (hours, photos, description, website, phone)
- How many Google reviews does it have?
- What is the star rating?
- When was the last review?
- Is the business responding to reviews?

**Weakness flags:**
- No Google Business Profile → Major (20 points)
- Profile exists but under 20 reviews or under 4.0 stars → Medium (10 points)
- Profile exists, not responding to reviews → Minor (5 points)

### 3. Instagram
- Does the business have an Instagram account?
- How many followers?
- When was the last post?
- What is the average engagement (likes + comments / followers)?
- Are the photos professional quality?
- Is there a clear bio with a link to the website?

**Weakness flags:**
- No Instagram → Major (15 points)
- Inactive (no posts in 3+ months) → Medium (8 points)
- Active but low engagement or poor-quality content → Minor (5 points)

### 4. Overall online reputation
- Are there any negative reviews with no response?
- Is the business listed on TripAdvisor / Yelp with accurate info?
- Does the business appear in local "best of" lists?

## Output

For each business, summarise in plain language:
- Main Weakness (1–2 sentences, specific)
- Commercial Opportunity (what Lumus could fix and what the business would gain)
- Recommended Lumus Service (pick the most impactful one)
- Priority Score (calculated by scripts/02_score_leads.py)

## Time estimate

A thorough audit takes 10–15 minutes per business.
A quick scan (website + Google + Instagram check) takes 3–5 minutes.
For lead scoring purposes, a quick scan is sufficient at first.

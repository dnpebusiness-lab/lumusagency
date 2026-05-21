# Skill: QA Testing

## What This Skill Does
Loads a systematic quality assurance testing methodology into the QA Agent. Ensures no bugs, errors, or issues reach the live website.

## When to Use
Activate for Phase 11 (QA) on every project.

## Agent That Uses It
QA Agent (Phase 11)

---

## SKILL INSTRUCTIONS

### QA TESTING METHODOLOGY

#### QA Mindset

Approach QA as a sceptical user, not as someone who built the site:
- Try to break things, not confirm they work
- Test edge cases, not just the happy path
- Read copy as if seeing it for the first time
- Navigate as if you don't know where anything is
- Use a real phone, not just browser DevTools (they lie about mobile behaviour)

---

### STRUCTURED TESTING SEQUENCE

Run tests in this order (most critical first):

**Pass 1: Content Accuracy**
1. Read every page against the approved copy document
2. Check every phone number, email, address
3. Check opening hours
4. Check all navigation labels
5. Check all social media links
6. Flag any discrepancy, no matter how small

**Pass 2: Functionality**
1. Click every navigation link
2. Click every button
3. Submit every form (with test data)
4. Check form confirmation messages
5. Check email delivery (forms)
6. Test click-to-call (on phone)
7. Test mailto links
8. Test any third-party integrations (booking, maps)

**Pass 3: Mobile Testing**
1. Test on real iPhone (Safari)
2. Test on real Android (Chrome)
3. Test: navigation, forms, images, text readability
4. Test: tap targets (easy to hit, no accidental taps)
5. Test: no horizontal scroll
6. Test: phone number click-to-call

**Pass 4: Cross-Browser**
1. Chrome desktop
2. Safari desktop (different rendering engine)
3. Firefox desktop
4. Note: Edge uses Chromium, same as Chrome — lower priority

**Pass 5: Technical**
1. Open Chrome DevTools Console — check for errors
2. Check Network tab — any 404 resources
3. Run Lighthouse in DevTools — check all categories
4. Check page source — verify meta tags are present
5. Test with disabled JavaScript (see if critical content still shows)

**Pass 6: SEO Verification**
1. View page source: confirm `<title>` on every page
2. View page source: confirm `<meta name="description">` on every page
3. View page source: confirm `<h1>` on every page
4. Check: one H1 only per page (search for H1 in source)
5. Verify: all images have alt text
6. Verify: sitemap.xml loads correctly
7. Verify: robots.txt loads correctly

**Pass 7: Performance**
1. Run PageSpeed Insights on homepage
2. Run PageSpeed Insights on at least one inner page
3. Confirm all scores meet targets

**Pass 8: Accessibility**
1. Run axe DevTools extension (free, Chrome extension)
2. Tab through the entire page — confirm keyboard navigation works
3. Confirm focus states are visible
4. Check all images have meaningful alt text
5. Check all form inputs have labels
6. Verify sufficient colour contrast (use Colour Contrast Analyser)

---

### BUG REPORTING FORMAT

Every bug must be documented as:

```
Bug ID: [Number]
Severity: Critical / Major / Minor
Page: [Exact URL or page name]
Browser/Device: [Where observed]
Description: [What is wrong — be specific]
Steps to reproduce:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
Expected result: [What should happen]
Actual result: [What happens instead]
Screenshot: [If applicable]
Assigned to: [Frontend Dev Agent]
```

---

### BUG SEVERITY GUIDE

| Severity | Definition | Examples |
|----------|------------|----------|
| Critical | Prevents conversion or breaks core functionality | Form not submitting, navigation broken, no mobile layout, incorrect contact info |
| Major | Significantly degrades experience but has a workaround | Image not loading on one page, animation broken, text overflow on specific screen |
| Minor | Small visual or content issue | Slight alignment issue at an obscure breakpoint, minor copy typo |

**Critical bugs = NO-GO. No exceptions.**

---

### COMMON BUGS TO LOOK FOR

**Mobile-specific:**
- Navigation hamburger doesn't open or close
- Text too small on 320px screens
- Form inputs zoom in (font size < 16px causes iOS auto-zoom)
- Images cropped incorrectly at mobile aspect ratio
- Buttons too close together (accidental taps)

**Forms:**
- Required field validation not working
- Form submits but no confirmation message shows
- Form submissions not arriving in email
- Spam submissions coming through (no reCAPTCHA or honeypot)
- Form resets to blank on page refresh after successful submission

**Content:**
- Phone numbers formatted differently across pages
- Opening hours missing from some pages
- Social links pointing to wrong accounts or 404
- Old business name or logo appearing somewhere
- Images not loading (404 in Network tab)

**Performance:**
- Console errors from missing scripts or resources
- Render-blocking resources (check Lighthouse)
- Images without dimensions causing CLS

---

### SIGN-OFF STATEMENT

The QA Agent's final output must include a clear sign-off:

```
QA SIGN-OFF — [Client Name]
Date: [Date]
Tested by: QA Agent

Site URL: [staging URL tested]
All critical bugs: RESOLVED ✔
All major bugs: RESOLVED ✔ / DOCUMENTED WITH PLAN ✔
Placeholder content: NONE FOUND ✔
Forms: TESTED AND WORKING ✔
Mobile: TESTED ON REAL DEVICES ✔
Performance: SCORES MET ✔

DECISION: GO FOR LAUNCH ✅
```

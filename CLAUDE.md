# Axiom — AI Automation Agency Landing Page

## Project Summary
Premium dark landing page for an AI automation agency. Built with plain HTML/CSS/JS — no framework, no build step.

## Agency Details
- **Name:** Axiom (previously Lumus — do not revert)
- **Email:** hello@axiom.ai (replace with real email before launch)
- **Tagline:** AI systems that run without you.
- **Netlify site:** lumusagency.netlify.app (site ID: 169ad0db-56aa-466e-9039-80d9dd757f75)
- **GitHub repo:** dnpebusiness-lab/lumusagency
- **Branch:** claude/setup-agency-team-dQUhl
- **PR:** https://github.com/dnpebusiness-lab/lumusagency/pull/1

## File Structure
```
index.html   — full 10-section page, semantic HTML, SEO meta
styles.css   — full design system, all animations, responsive
script.js    — neural canvas, line reveals, 3D tilt, magnetic buttons, FAQ, workflow SVG
```

## Design System (ui-ux-pro-max applied)
- **Style:** Exaggerated Minimalism + Dark OLED
- **Font:** DM Sans (Google Fonts) — 400, 500, 600, 700
- **Background:** #080812
- **Surface:** #0d0d22 / #13132e
- **Accent:** #4361EE (electric blue)
- **Violet:** #7c3aed (used sparingly)
- **Text muted:** rgba(255,255,255,0.5)
- **Border:** rgba(255,255,255,0.07)

## Animation System
1. Neural canvas — lightweight particle network (50 nodes, GPU-friendly)
2. Headline reveal — line-by-line translateY slide-up (premium agency technique)
3. Scroll reveals — IntersectionObserver, opacity + translateY, stagger 0.08s
4. Workflow SVG — animated data packets via SVG animateMotion along bezier paths
5. Badge cycle — status labels cycle Manual → Processing every 2s
6. 3D card tilt — mouse tracking, perspective(700px), max 9deg, desktop only
7. Magnetic CTAs — .js-magnetic class, 28% mouse displacement, desktop only
8. Process timeline — scroll-linked height fill + dot activation
9. FAQ accordion — smooth max-height expand/collapse
10. All animations respect prefers-reduced-motion

## Skills Applied
- anti-ai-copywriter — direct, human tone, no buzzwords
- website-art-director — dark premium visual system
- conversion-ux — CTA placement, page flow, objection removal
- local-seo — meta tags, OG, semantic HTML, favicon
- launch-qa — checklist verified
- ui-ux-pro-max — Exaggerated Minimalism style, DM Sans, scroll storytelling

## Sections
1. Hero (with animated workflow visual)
2. Problem (6 pain cards, 3D tilt)
3. Solution (2-col with service list)
4. Automation Examples (6 flow cards)
5. How It Works (4-step animated timeline)
6. Benefits (8 items, 3D tilt)
7. Services (8 cards, 3D tilt)
8. Why Now (editorial text)
9. FAQ (accordion)
10. Final CTA

## What Needs Manual Replacement Before Launch
- `hello@axiom.ai` → real contact email or booking link (2 places: CTA + footer)
- `og:url` meta tag → real domain
- `og:image` → add 1200x630 social preview image
- CTA href `#audit` → real Calendly/Tally booking link

## MCP Servers Available
- **Magic (21st.dev):** mcp__magic__ — for React UI components in future builds
- **Netlify:** mcp__63e82527__ — project management (NOTE: direct file deploy blocked by network policy, use Netlify UI or CLI locally)
- **Figma:** mcp__6f3403db__ — design-to-code and code-to-design
- **GitHub:** mcp__github__ — PR management on dnpebusiness-lab/lumusagency

## Deploy Instructions
Drop `axiom-landing.zip` onto: https://app.netlify.com/projects/lumusagency
Or connect repo branch in Netlify UI: no build command, publish dir `.`

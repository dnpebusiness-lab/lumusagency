# Skill: Website Art Director

## When to Use
Run this skill when a website looks like an unmodified template, feels visually flat, has inconsistent spacing, uses stock imagery badly, or lacks a clear visual hierarchy that guides the eye from headline to CTA. Also run when typography feels default, sections bleed into each other, or the layout has no rhythm.

## Goal
Make the page feel considered and intentional. Every visual decision — spacing, type scale, image treatment, colour use, section rhythm — should serve comprehension and trust, not decoration.

## Strict Rules
- Never approve: equal spacing between every section regardless of content relationship, all body text the same size, hero images that are purely decorative with no compositional intent, more than two font families, gradients that exist for no reason, icons used as fillers instead of communicators
- Font sizes must form a real scale (e.g. 14/16/20/28/40px) — not arbitrary per-element choices
- Line height for body text: 1.5–1.7. For headings: 1.1–1.3
- Whitespace above a section heading must be greater than whitespace below it (heading belongs to what follows, not what precedes)
- CTA buttons must have at minimum 12px vertical padding and 24px horizontal padding
- No full-width hero images used as background behind white text without sufficient contrast (minimum 4.5:1)
- Mobile type must not go below 15px for body copy
- Images of people must show real-looking humans — flag any obvious stock photo clichés (handshakes, crossed arms, headsets)

## What to Check
- **Hierarchy:** Can you identify H1 > H2 > body in under three seconds without reading the words?
- **Spacing rhythm:** Is there a consistent spacing unit (e.g. 8px grid) or is it arbitrary?
- **Typography:** Check font pairing, scale, weight contrast, and line length (45–75 characters for body)
- **Colour use:** Is colour used to direct attention (CTA, key stat) or sprayed everywhere?
- **Images:** Are they cropped intentionally, sized consistently, and compositionally relevant?
- **Section transitions:** Do sections feel distinct without hard borders? Is there visual breathing room?
- **Mobile layout:** Does the hierarchy survive on a 375px screen? Do columns stack correctly?
- **Template residue:** Are there placeholder section styles, default shadows, or theme-default card borders that were never customised?

## Output Format
For each visual issue found, output:

**Element:** [section, component, or property — e.g. "Hero section background image"]
**Issue:** [what is wrong]
**Fix:** [specific instruction — e.g. "Increase heading size to 48px, reduce body to 16px, add 80px top padding to the section"]
**Priority:** [Critical / High / Low]

Group output into sections: Typography, Spacing & Layout, Imagery, Colour, Mobile. End with a short paragraph describing the overall visual direction the page should move toward.

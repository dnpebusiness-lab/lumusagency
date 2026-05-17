# launch-qa

## Purpose
Final quality check before launch. Catch errors, missing elements, broken states and poor experiences.

## Checklist

### Build
- [ ] Build command runs without errors
- [ ] No console errors on page load
- [ ] No broken imports or missing files
- [ ] No 404 errors for local assets

### HTML
- [ ] Valid DOCTYPE
- [ ] lang attribute on <html>
- [ ] charset meta tag present
- [ ] viewport meta tag present
- [ ] Page title set and under 60 characters
- [ ] Meta description set and 140 to 160 characters
- [ ] Open Graph title and description set
- [ ] One H1 on the page
- [ ] Headings in logical order (no skipped levels)
- [ ] All links have href attributes
- [ ] No empty buttons or links
- [ ] All form inputs have labels or aria-label

### Content
- [ ] No placeholder text (Lorem Ipsum, [PLACEHOLDER], TBD)
- [ ] No fake testimonials, fake reviews, fake statistics
- [ ] No client names or logos used without permission
- [ ] No "coming soon" sections shipped live
- [ ] All CTA buttons have clear, specific text
- [ ] Email or contact links work

### Images and Media
- [ ] All meaningful images have alt text
- [ ] No broken image references
- [ ] Large images are optimised (not raw 4MB files)
- [ ] SVGs are clean and not oversized

### Accessibility
- [ ] Colour contrast passes WCAG AA (4.5:1 for normal text)
- [ ] Focus states visible on interactive elements
- [ ] prefers-reduced-motion respected
- [ ] No animation that could trigger vestibular disorders

### Performance
- [ ] No render-blocking scripts in <head> (use defer or async)
- [ ] Fonts loaded with font-display: swap
- [ ] No layout shift on load (CLS)
- [ ] Page loads in under 3 seconds on a standard connection

### Mobile
- [ ] No horizontal overflow on any screen size
- [ ] All tap targets are at least 44px
- [ ] Text is readable without pinch to zoom
- [ ] Navigation works on mobile
- [ ] Hero visual works on small screens

### Animations
- [ ] All animations work in modern browsers
- [ ] prefers-reduced-motion disables or reduces animations
- [ ] No janky animations (use transform and opacity, not width/height)
- [ ] Animations do not block interaction

### Final
- [ ] Favicon set
- [ ] Footer present with at minimum: agency name, copyright year
- [ ] Privacy or legal link present if forms collect data
- [ ] No unused code left in production

## Application
Run through this checklist before marking any page as complete and ready to launch.

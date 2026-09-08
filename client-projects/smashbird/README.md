# Smashbird Galway — website

Built by Lumus Agency. Live, deploying from this repository via Netlify.

`index.html` reads `content.js` for all copy, menu, pricing and location
data, and loads images from `img/`. To preview locally it needs a real
server (hash-based routing and `content.js` won't resolve over `file://`):

```
python3 -m http.server
```

## Deploying

The connected Netlify site publishes automatically on every push to this
repo's branch, publish directory `client-projects/smashbird`. No build step
— `netlify.toml` just points it at the folder as-is.

## Still outstanding

Every fact on the site is gated on `confirmed:true` in `content.js` — an
unconfirmed field simply doesn't render, rather than showing a guess or a
placeholder. The full list of what's still missing (opening hours, phone
numbers, the two gluten-free exception sauces, award logos, and more) is
tracked in `content.js`'s `contentIssues` array, not duplicated here — that
way it can't go stale against the actual data.

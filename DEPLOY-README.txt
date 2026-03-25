# Aumage Frontend Patch — v6 Card Compositor
# March 15, 2026

## WHAT'S NEW
- js/card-compositor.js — NEW: Client-side Canvas card renderer
- js/app.js — PATCHED: showResult(), _finalizeWithName(), startReveal(), downloadImage()
- index.html — UNCHANGED (already has card-compositor.js script tag)

## HOW TO DEPLOY
1. Copy these 3 files into your existing frontend deploy folder:
   - js/card-compositor.js (new file — just drop it in js/)
   - js/app.js (replaces your current app.js)
   - index.html (same as your current one — included for completeness)
2. Keep ALL your other existing files (css/, img/, other js/ files)
3. Zip the whole folder → drag to Cloudflare Pages

## WHAT CHANGED IN APP.JS
- showResult() → now calls AumageCard.render(cardData) instead of CSS frame overlay
- _finalizeWithName() → passes all creature data (stats, labels, flavor, gene sequence) through
- startReveal() → passes cardData parameter through
- downloadImage() → exports card canvas as PNG (falls back to raw image if canvas unavailable)
- Added _renderFallbackCard() for graceful degradation

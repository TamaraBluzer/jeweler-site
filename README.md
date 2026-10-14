# Jeweler portfolio site

A static portfolio site in Apple's "liquid glass" style. No build step: plain HTML, CSS and JS.

## Edit content
Everything you'll normally change is in **`js/pieces.js`**:
- `SITE`: studio name, headline, about text, contact (WhatsApp / Instagram / email)
- `PIECES`: one block per piece. Put photos in `assets/pieces/` and reference them in `images`.
  Set `featured: true` on one piece to show it large.

Photos: square-ish, ~1600px, JPG or WebP, consistent background.

## Run locally
```bash
python3 -m http.server 4173
```
Then open http://localhost:4173

## Deploy (GitHub Pages)
Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root.

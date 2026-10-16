# Ronen Peretz — Personal Jeweler

A static portfolio site in a light, editorial "atelier" style (with a liquid-glass nav). No build step: plain HTML, CSS and JS.
All photos and videos are Ronen's own.

## Edit content
Everything you'll normally change is in **`js/pieces.js`**:
- `SITE`: studio name, headline, about text, the `hero` piece shown in 3D, the studio `film`, contact (WhatsApp / phone / Instagram / email)
- `PIECES`: one entry per piece. Its media lives in `assets/media/<id>/`:
  - `video.mp4` + `poster.jpg` for a video piece, or `photo.jpg` for a photo piece
  - `spin/01.jpg … NN.jpg` (optional): frames of one full turn, shown as a drag-to-spin 3D view
  - `light: true` for pieces shot on white, so they sit straight on the page

### Preparing new media (needs ffmpeg: `brew install ffmpeg`)
```bash
# web video: max 720px wide, no sound, small file
ffmpeg -i input.mp4 -vf "scale='min(720,iw)':-2" -r 30 -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart video.mp4
# poster frame
ffmpeg -ss 1 -i input.mp4 -frames:v 1 -vf "scale='min(720,iw)':-2" -q:v 3 poster.jpg
# 3D frames: 60 frames across one full turn lasting T seconds
mkdir spin && ffmpeg -t T -i input.mp4 -vf "fps=60/T,scale='min(720,iw)':-2" -frames:v 60 -q:v 4 spin/%02d.jpg
```

## Run locally
```bash
python3 -m http.server 4173
```
Then open http://localhost:4173

## After editing
Bump the `?v=` number on the CSS/JS links in `index.html` (e.g. `?v=15` → `?v=16`) so visitors' browsers fetch the new files instead of a cached copy.

## Earlier dark design
The previous dark "liquid glass" version lives in `dark/` (served at `/dark/`) for comparison. It has its own copy of the HTML/CSS/JS and its own `pieces.js`, shares the media in `assets/`, and is hidden from search engines.

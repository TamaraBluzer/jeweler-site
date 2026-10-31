"""Add new pieces to the site from Ronen's Google Form.

Runs in GitHub Actions (see .github/workflows/import-pieces.yml). For every new form
response from an allowed email it:
  1. downloads the uploaded photo/video from Google Drive,
  2. prepares it for the web (video.mp4 + poster.jpg, or photo.jpg; 3D spin frames
     when the video is a full turn),
  3. adds the piece to js/pieces.js (and the /dark/ copy), bumps the cache version,
  4. remembers the response in data/form-imported.json so it is never added twice.

Environment:
  GOOGLE_SERVICE_ACCOUNT_JSON  service-account key (GitHub secret)
  FORM_SHEET_ID                id of the form's response spreadsheet
  ALLOWED_EMAILS               comma-separated emails allowed to add pieces
Local test (no Google):  python3 tools/import_from_form.py --local rows.json
  rows.json = list of {"header": "value", ...} where the file column holds local paths.
"""
import hashlib, io, json, os, re, shutil, subprocess, sys, tempfile, unicodedata
from datetime import datetime, timezone

import numpy as np
from PIL import Image, ImageOps

try:  # iPhone photos arrive as HEIC
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "assets", "media")
PIECES_JS = os.path.join(ROOT, "js", "pieces.js")
DARK_PIECES_JS = os.path.join(ROOT, "dark", "js", "pieces.js")
LEDGER = os.path.join(ROOT, "data", "form-imported.json")
CATEGORIES = ["Engagement", "Bands", "Earrings", "Necklaces", "Bracelets"]
MAX_WIDTH = 960  # web size for videos and photos (originals are kept out of the repo)

# Form questions are matched by keywords, so small wording changes don't break it.
FIELDS = {
    "timestamp": ["timestamp", "חותמת זמן"],
    "email": ["email", "אימייל", "דוא\"ל"],
    "title": ["name of the piece"],
    "category": ["category"],
    "description": ["description"],
    "file": ["photo or video"],
    "spin": ["360"],
    "position": ["where should it appear"],
}


def log(*a):
    print(*a, flush=True)


def column(headers, field):
    keys = FIELDS[field]
    for i, h in enumerate(headers):
        if any(k in h.lower() for k in keys):
            return i
    return None


# ── Reading responses ─────────────────────────────────────

def google_services():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    info = json.loads(os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"])
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/drive.readonly",
                      "https://www.googleapis.com/auth/spreadsheets.readonly"])
    return build("sheets", "v4", credentials=creds), build("drive", "v3", credentials=creds)


def read_rows_google(sheets):
    sid = os.environ["FORM_SHEET_ID"]
    meta = sheets.spreadsheets().get(spreadsheetId=sid).execute()
    tab = meta["sheets"][0]["properties"]["title"]
    values = sheets.spreadsheets().values().get(spreadsheetId=sid, range=f"'{tab}'").execute().get("values", [])
    if not values:
        return [], []
    return values[0], values[1:]


def download_drive_file(drive, url, dest_dir):
    from googleapiclient.http import MediaIoBaseDownload
    m = re.search(r"(?:id=|/d/)([\w-]{20,})", url)
    if not m:
        raise ValueError(f"no Drive file id in {url!r}")
    fid = m.group(1)
    meta = drive.files().get(fileId=fid, fields="name,mimeType,size", supportsAllDrives=True).execute()
    path = os.path.join(dest_dir, meta["name"])
    with io.FileIO(path, "wb") as fh:
        dl = MediaIoBaseDownload(fh, drive.files().get_media(fileId=fid, supportsAllDrives=True), chunksize=32 * 1024 * 1024)
        done = False
        while not done:
            _, done = dl.next_chunk()
    log(f"  downloaded {meta['name']} ({int(meta.get('size', 0)) // 1024} KB)")
    return path, meta["mimeType"]


# ── Media processing ──────────────────────────────────────

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-600:])
    return r.stdout


def probe(path):
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
               "stream=width,height:format=duration", "-of", "json", path])
    j = json.loads(out)
    s = j["streams"][0]
    return s["width"], s["height"], float(j["format"].get("duration", 0))


def find_turn_seconds(path, duration):
    """Length of one full turn: the first time (after 3s) the video returns to its first frame."""
    fps, w, h = 10, 48, 48
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, w * h).astype(float)
    if len(frames) < 4 * fps:
        return None
    diff = np.abs(frames - frames[0]).mean(axis=1)
    typical = np.median(diff)
    if typical < 1.5:  # barely moves: not a turntable
        return None
    later = diff[3 * fps:]
    # A real turn comes back almost exactly to the first frame. Take the FIRST such return
    # (some clips turn twice), then the closest frame around it.
    threshold = max(0.15 * typical, later.min() * 1.5)
    hits = np.where(later <= threshold)[0]
    if not len(hits) or later.min() > 0.15 * typical:
        return None
    first = hits[0]
    window = later[first:first + fps]
    return (3 * fps + first + int(np.argmin(window))) / fps


def is_light_background(img):
    """True when the corners are near-white: the piece was shot on white and can blend into the page."""
    a = np.asarray(img.convert("RGB")).astype(float)
    h, w, _ = a.shape
    s = max(4, min(h, w) // 12)
    corners = np.concatenate([a[:s, :s], a[:s, -s:], a[-s:, :s], a[-s:, -s:]]).reshape(-1, 3)
    return bool(corners.mean() > 225 and (corners.max(axis=1) - corners.min(axis=1)).mean() < 18)


def process_photo(src, out_dir):
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if img.width > MAX_WIDTH * 1.25:
        img = img.resize((round(MAX_WIDTH * 1.25), round(img.height * MAX_WIDTH * 1.25 / img.width)), Image.LANCZOS)
    img.save(os.path.join(out_dir, "photo.jpg"), quality=84, optimize=True, progressive=True)
    return img


def process_video(src, out_dir, want_spin):
    w, h, dur = probe(src)
    scale = f"scale='min({MAX_WIDTH},iw)':-2,setsar=1"
    turn = find_turn_seconds(src, dur) if dur >= 4 else None
    clip = ["-t", f"{turn:.2f}"] if turn else (["-t", "30"] if dur > 30 else [])  # loop cleanly / keep it short
    run(["ffmpeg", "-v", "error", "-y", "-i", src, *clip, "-vf", scale, "-r", "30", "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-profile:v", "high",
         "-movflags", "+faststart", os.path.join(out_dir, "video.mp4")])
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(1.0, dur / 3):.2f}", "-i", src, "-frames:v", "1",
         "-vf", scale, "-q:v", "3", os.path.join(out_dir, "poster.jpg")])
    spin = 0
    if want_spin and turn:
        n = 60
        sd = os.path.join(out_dir, "spin")
        os.makedirs(sd, exist_ok=True)
        run(["ffmpeg", "-v", "error", "-y", "-t", f"{turn:.2f}", "-i", src, "-vf", f"fps={n}/{turn:.2f},{scale}",
             "-frames:v", str(n), "-q:v", "4", os.path.join(sd, "%02d.jpg")])
        spin = len(os.listdir(sd))
    elif want_spin:
        log("  asked for 3D, but the video does not make one clean full turn; showing it as a video")
    return Image.open(os.path.join(out_dir, "poster.jpg")), spin, turn


# ── Updating the site ─────────────────────────────────────

def slugify(title, existing):
    s = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40] or "piece"
    slug, i = s, 2
    while slug in existing:
        slug, i = f"{s}-{i}", i + 1
    return slug


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


def add_to_pieces_js(entry, first):
    s = open(PIECES_JS, encoding="utf-8").read()
    fields = [f'id: {js_str(entry["id"])}', f'title: {js_str(entry["title"])}', f'category: {js_str(entry["category"])}',
              f'kind: {js_str(entry["kind"])}']
    if entry.get("spin"): fields.append(f'spin: {entry["spin"]}')
    if entry.get("light"): fields.append("light: true")
    if entry.get("wide"): fields.append("wide: true")
    block = f'  {{ {", ".join(fields)},\n    description: {js_str(entry["description"])} }},'
    start = s.index("const PIECES = [\n") + len("const PIECES = [\n")
    if first:
        # keep the leading comment line(s) in place, insert right after them
        m = re.match(r"(?:\s*//[^\n]*\n)*", s[start:])
        pos = start + m.end()
        s = s[:pos] + block + "\n" + s[pos:]
    else:
        end = s.index("\n];", start)
        s = s[:end] + "\n" + block + s[end:]
    open(PIECES_JS, "w", encoding="utf-8").write(s)


def sync_dark_and_cache():
    # The /dark/ comparison page mirrors the main piece list with still images
    if os.path.exists(DARK_PIECES_JS):
        subprocess.run(["node", "-e", r'''
const fs=require("fs");
eval(fs.readFileSync("js/pieces.js","utf8").replace(/^const /gm,"var "));
const head=fs.readFileSync("dark/js/pieces.js","utf8");
const top=head.slice(0, head.indexOf("const PIECES"));
const pieces=PIECES.map(p=>({id:p.id,title:p.title,category:p.category,
  images:[`../assets/media/${p.id}/${p.kind==="photo"?"photo":"poster"}.jpg`],
  description:p.description, ...(p.wide?{wide:true}:{})}));
fs.writeFileSync("dark/js/pieces.js", top+"const PIECES = "+JSON.stringify(pieces,null,2)+";\n");'''],
                       cwd=ROOT, check=True)
    # Bump ?v= so visitors' browsers fetch the new piece list right away
    for name in ["index.html", "accessibility.html", os.path.join("dark", "index.html")]:
        p = os.path.join(ROOT, name)
        if os.path.exists(p):
            s = open(p, encoding="utf-8").read()
            s = re.sub(r"\?v=(\d+)", lambda m: f"?v={int(m.group(1)) + 1}", s)
            open(p, "w", encoding="utf-8").write(s)


def existing_ids():
    s = open(PIECES_JS, encoding="utf-8").read()
    return set(re.findall(r'\bid: "([^"]+)"', s))


# ── Main ──────────────────────────────────────────────────

def main():
    local = "--local" in sys.argv
    ledger = json.load(open(LEDGER)) if os.path.exists(LEDGER) else {"imported": []}
    done = {e["key"] for e in ledger["imported"]}
    allowed = {e.strip().lower() for e in os.environ.get("ALLOWED_EMAILS", "").split(",") if e.strip()}

    if local:
        rows_json = json.load(open(sys.argv[sys.argv.index("--local") + 1]))
        headers = list(rows_json[0].keys()) if rows_json else []
        rows = [[r.get(h, "") for h in headers] for r in rows_json]
        drive = None
    else:
        sheets, drive = google_services()
        headers, rows = read_rows_google(sheets)

    if not rows:
        log("No form responses yet.")
        return
    col = {f: column(headers, f) for f in FIELDS}
    missing = [f for f in ("timestamp", "title", "category", "file") if col[f] is None]
    if missing:
        raise SystemExit(f"Form is missing questions for: {missing}. Headers found: {headers}")

    added = []
    for row in rows:
        get = lambda f: (row[col[f]].strip() if col[f] is not None and col[f] < len(row) else "")
        # The ledger is public (it lives in the repo), so store a fingerprint, never the email itself
        key = hashlib.sha256(f'{get("timestamp")}|{get("email").lower()}'.encode()).hexdigest()[:16]
        if key in done or not get("timestamp"):
            continue
        email = get("email").lower()
        title = get("title")
        log(f"New response: {title!r}")
        record = {"key": key, "title": title, "at": datetime.now(timezone.utc).isoformat(timespec="seconds")}

        if allowed and email not in allowed:
            # Not recorded: if this email is added to ALLOWED_EMAILS later, the answer is picked up then
            log("  waiting: this email is not on the allowed list (add it to ALLOWED_EMAILS to accept)")
            continue
        category = next((c for c in CATEGORIES if c.lower() in get("category").lower()), None)
        if not title or not category:
            ledger["imported"].append({**record, "status": "rejected: missing name or category"})
            continue

        slug = slugify(title, existing_ids())
        out = os.path.join(MEDIA, slug)
        tmp = tempfile.mkdtemp()
        try:
            src_ref = get("file").split(",")[0].strip()
            if local:
                src, mime = src_ref, ("video/mp4" if src_ref.lower().endswith((".mp4", ".mov", ".m4v")) else "image/jpeg")
            else:
                src, mime = download_drive_file(drive, src_ref, tmp)
            os.makedirs(out, exist_ok=True)
            want_spin = get("spin").lower().startswith(("yes", "כן"))
            if mime.startswith("video/"):
                still, spin, turn = process_video(src, out, want_spin)
                kind = "video"
            else:
                still, spin, turn, kind = process_photo(src, out), 0, None, "photo"
            entry = {
                "id": slug, "title": title, "category": category, "kind": kind,
                "spin": int(spin), "light": is_light_background(still), "wide": bool(still.width / still.height >= 1.6),
                "description": get("description") or title,
            }
            first = not get("position").lower().startswith(("at the end", "last", "בסוף"))
            add_to_pieces_js(entry, first)
            ledger["imported"].append({**record, "status": "added", "id": slug, "spin": spin, "light": entry["light"]})
            added.append(entry)
            log(f"  added as {slug} ({kind}{', 3D' if spin else ''}{', light' if entry['light'] else ''})")
        except Exception as e:  # keep going with other responses; record why this one failed
            shutil.rmtree(out, ignore_errors=True)
            ledger["imported"].append({**record, "status": f"failed: {str(e)[:200]}"})
            log(f"  FAILED: {e}")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    if added:
        sync_dark_and_cache()
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    json.dump(ledger, open(LEDGER, "w"), indent=1, ensure_ascii=False)
    # Summary for the workflow (commit message / pull request text)
    with open(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull), "a") as fh:
        fh.write("\n".join([f"- **{e['title']}** ({e['category']}) → `{e['id']}`" for e in added]) or "No new pieces.")
    if added:
        open(os.path.join(tempfile.gettempdir(), "added-pieces.txt"), "w").write(", ".join(e["title"] for e in added))
    log(f"Done: {len(added)} piece(s) added.")


if __name__ == "__main__":
    main()

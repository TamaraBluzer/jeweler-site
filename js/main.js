(() => {
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // Motion is off when the device asks for less motion OR the visitor pressed "Pause animation"
  let motionPaused = false;
  const calm = () => reduceMotion.matches || motionPaused;
  const spinners = new Set();

  // Catalogue number, fixed by position in PIECES so it stays the same under any filter
  const no = (p) => `No. ${String(PIECES.indexOf(p) + 1).padStart(2, "0")}`;
  const still = (p) => MEDIA(p.id) + (p.kind === "photo" ? "photo.jpg" : "poster.jpg");

  // ── 3D spinner ───────────────────────────────────────────
  // Plays the frames of one full turn on a canvas. Turns slowly by itself, can be
  // grabbed and spun with momentum (velocity carries over when you let go), and
  // eases back into its slow turn once left alone.
  class Spinner {
    constructor(el, piece, { onTap } = {}) {
      this.el = el;
      this.count = piece.spin;
      this.base = MEDIA(piece.id) + "spin/";
      this.onTap = onTap;
      this.images = [];
      this.startFrame = (piece.start || 1) - 1; // frame to open on
      this.angle = (this.startFrame + 0.5) / this.count; // in turns, 0..1 (centred on the start frame)
      this.velocity = 0; // turns per second
      this.auto = 1 / 12; // one slow turn every 12s (only while motion is allowed)
      spinners.add(this);
      this.idleSince = Infinity; // stays put until the start frame is on screen, then holds before turning
      this.dragging = false;

      el.tabIndex = 0;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `${piece.title}, 3D view. Drag or use the arrow keys to turn it.`);
      this.canvas = document.createElement("canvas");
      el.append(this.canvas);
      this.ctx = this.canvas.getContext("2d");

      this.onDown = this.onDown.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onUp = this.onUp.bind(this);
      this.onKey = this.onKey.bind(this);
      this.tick = this.tick.bind(this);
      el.addEventListener("pointerdown", this.onDown);
      el.addEventListener("keydown", this.onKey);

      this.resize = new ResizeObserver(() => this.fit());
      this.resize.observe(el);
      // Only load and animate while on screen
      this.seen = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) { this.load(); this.start(); }
      }, { rootMargin: "200px" });
      this.seen.observe(el);
    }

    load() {
      if (this.images.length) return;
      this.images = new Array(this.count);
      // Start frame first, so the piece opens on it; the rest follow in turning order
      for (let k = 0; k < this.count; k++) {
        const i = (this.startFrame + k) % this.count;
        const img = new Image();
        img.decoding = "async";
        img.src = `${this.base}${String(i + 1).padStart(2, "0")}.jpg`;
        if (k === 0) img.onload = () => { this.fit(); this.idleSince = performance.now(); };
        this.images[i] = img;
      }
    }

    fit() {
      const first = this.images[this.startFrame];
      if (!first?.naturalWidth) return;
      const w = this.el.clientWidth, dpr = Math.min(devicePixelRatio || 1, 2);
      const h = Math.round((w * first.naturalHeight) / first.naturalWidth);
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.canvas.style.height = h + "px";
      this.draw();
    }

    // Nearest frame that has loaded, so spinning works while frames are still arriving
    frame() {
      const target = Math.floor((((this.angle % 1) + 1) % 1) * this.count) % this.count;
      for (let d = 0; d < this.count; d++) {
        const img = this.images[(target + d) % this.count];
        if (img?.complete && img.naturalWidth) return img;
      }
      return null;
    }

    draw() {
      const img = this.frame();
      if (img) this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }

    start() {
      if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick); }
    }

    tick(now) {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      if (!this.dragging) {
        // Momentum decays exponentially (like scroll), then eases back to the slow turn
        const idle = now - this.idleSince > 1500;
        const goal = idle && !calm() ? this.auto : 0;
        this.velocity += (goal - this.velocity) * (1 - Math.exp(-dt * (idle ? 1.5 : 2.2)));
        this.angle += this.velocity * dt;
      }
      this.draw();
      const moving = this.dragging || Math.abs(this.velocity) > 0.0005 || !calm();
      this.raf = this.visible && moving && this.el.isConnected ? requestAnimationFrame(this.tick) : 0;
    }

    onDown(e) {
      if (e.button !== 0) return;
      this.el.setPointerCapture(e.pointerId);
      this.dragging = true;
      this.downX = this.lastX = e.clientX;
      this.downT = this.lastT = performance.now();
      this.velocity = 0;
      this.el.classList.add("grabbing");
      this.el.addEventListener("pointermove", this.onMove);
      this.el.addEventListener("pointerup", this.onUp);
      this.el.addEventListener("pointercancel", this.onUp);
      this.start();
    }

    onMove(e) {
      const now = performance.now();
      const turns = (e.clientX - this.lastX) / (this.el.clientWidth * 1.2); // a full drag across ≈ most of a turn
      const dt = Math.max(1, now - this.lastT) / 1000;
      this.angle += turns;
      this.velocity = this.velocity * 0.6 + (turns / dt) * 0.4; // smoothed release velocity
      this.lastX = e.clientX;
      this.lastT = now;
    }

    onUp(e) {
      this.dragging = false;
      this.idleSince = performance.now();
      this.el.classList.remove("grabbing");
      this.el.removeEventListener("pointermove", this.onMove);
      this.el.removeEventListener("pointerup", this.onUp);
      this.el.removeEventListener("pointercancel", this.onUp);
      if (performance.now() - this.lastT > 80) this.velocity = 0; // held still before letting go
      if (calm()) this.velocity = 0;
      const tap = e.type === "pointerup" && Math.abs(e.clientX - this.downX) < 5 && performance.now() - this.downT < 350;
      if (tap) this.onTap?.(this.el);
    }

    onKey(e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      this.angle += (e.key === "ArrowRight" ? 1 : -1) / 24;
      this.idleSince = performance.now();
      this.velocity = 0;
      this.draw();
      this.start();
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.resize.disconnect();
      this.seen.disconnect();
      spinners.delete(this);
      this.el.replaceChildren();
    }
  }

  // ── Looping videos: load when near, play only while visible ─
  const nearby = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting && !e.target.src && !calm()) e.target.src = e.target.dataset.src;
    }),
    { rootMargin: "300px" }
  );
  const onScreen = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !calm()) {
        if (!v.src) v.src = v.dataset.src; // a fast jump can reach it before the preload observer does
        v.play().catch(() => {});
      } else v.pause();
    }),
    { threshold: 0.35 }
  );
  const watchVideo = (v) => { nearby.observe(v); onScreen.observe(v); };

  // ── Site text from pieces.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const value = SITE[el.dataset.site];
    if (value) el.innerHTML = value;
  });
  $("#year").textContent = new Date().getFullYear();

  // ── Contact ──────────────────────────────────────────────
  const INSTAGRAM_ICON = `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/></svg>`;
  const { whatsapp, phone, instagram, email } = SITE.contact;
  const waLink = (text) =>
    `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const tel = phone && `tel:${phone.replace(/\D/g, "")}`;

  if (phone) {
    $("#hero-phone").textContent = phone;
    $("#hero-phone").href = tel;
    $("#contact-phone").textContent = phone;
    $("#contact-phone").href = tel;
  } else {
    $("#hero-phone").remove();
    $("#contact-phone").remove();
  }
  $("#contact-links").innerHTML = [
    whatsapp && { label: "WhatsApp", href: waLink() },
    instagram && { icon: INSTAGRAM_ICON, aria: `Instagram, @${instagram}`, href: `https://instagram.com/${instagram}` },
    email && { label: email, href: `mailto:${email}` },
  ]
    .filter(Boolean)
    .map((l) =>
      l.icon
        ? `<a class="icon-link" href="${l.href}" target="_blank" rel="noopener" aria-label="${l.aria}" title="${l.aria}">${l.icon}</a>`
        : `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`
    )
    .join("");

  if (whatsapp) {
    const fab = $("#wa-fab");
    fab.href = waLink("Hi Ronen! I found you through your website.");
    fab.hidden = false;
  }

  // ── Hero: the 3D piece ───────────────────────────────────
  const hero = PIECES.find((p) => p.id === SITE.hero && p.spin) || PIECES.find((p) => p.spin);
  if (hero) {
    new Spinner($("#hero-spin"), hero, { onTap: (el) => openSheet(hero, el) });
    $("#hero-caption").textContent = hero.title;
    $("#hero-open").addEventListener("click", () => openSheet(hero, $("#hero-spin")));
  }

  // ── Studio film ──────────────────────────────────────────
  const film = $("#film");
  if (film && SITE.film) {
    film.poster = MEDIA(SITE.film) + "poster.jpg";
    film.dataset.src = MEDIA(SITE.film) + "video.mp4";
    watchVideo(film);
  }

  // ── Filters ──────────────────────────────────────────────
  // Filter order stays fixed, whatever order the pieces are in
  const ORDER = ["Engagement", "Bands", "Earrings", "Necklaces", "Bracelets"];
  const found = [...new Set(PIECES.map((p) => p.category))];
  const categories = ["All", ...ORDER.filter((c) => found.includes(c)), ...found.filter((c) => !ORDER.includes(c))];
  let active = "All";
  const filters = $("#filters");
  filters.innerHTML = categories
    .map((c) => `<button type="button" aria-pressed="${c === active}" data-cat="${c}">${c}</button>`)
    .join("");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.dataset.cat === active) return;
    active = btn.dataset.cat;
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    renderGrid();
  });

  // ── Grid ─────────────────────────────────────────────────
  const grid = $("#grid");
  const mediaTag = (p) =>
    p.kind === "video"
      ? `<video muted playsinline loop preload="none" poster="${still(p)}" data-src="${MEDIA(p.id)}video.mp4" aria-label="${p.title}"></video>`
      : `<img src="${still(p)}" alt="${p.title}" loading="lazy" onerror="this.classList.add('missing')" />`;

  function renderGrid() {
    grid.querySelectorAll("video").forEach((v) => { nearby.unobserve(v); onScreen.unobserve(v); });
    const items = PIECES.filter((p) => active === "All" || p.category === active);
    $("#work-count").textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;
    grid.innerHTML = items
      .map(
        (p, i) => `
        <button class="card${p.wide ? " wide" : ""}" data-id="${p.id}" title="${p.title}" style="--i:${i}">
          <div class="card-media${p.light ? " light" : ""}">${mediaTag(p)}</div>
          <div class="card-label">
            <span class="card-title">${p.title}</span>
            <span class="card-meta">${no(p)}${p.spin ? " · 3D" : ""}</span>
          </div>
        </button>`
      )
      .join("");
    grid.querySelectorAll("video").forEach(watchVideo);
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openSheet(PIECES.find((p) => p.id === card.dataset.id), card);
  });
  renderGrid();

  // ── Detail sheet ─────────────────────────────────────────
  const sheet = $("#sheet");
  const sheetMedia = $("#sheet-media");
  const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  let sourceCard = null;
  let running = null;
  let sheetSpinner = null;

  function originFrom(card) {
    if (!card) return "50% 50%";
    const s = sheet.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return `${c.left + c.width / 2 - s.left}px ${c.top + c.height / 2 - s.top}px`;
  }

  function clearSheetMedia() {
    sheetSpinner?.destroy();
    sheetSpinner = null;
    sheetMedia.querySelector("video")?.pause();
    sheetMedia.replaceChildren();
  }

  function openSheet(p, card) {
    sourceCard = card || null;
    clearSheetMedia();
    sheetMedia.classList.toggle("light", Boolean(p.light));
    if (p.spin) {
      const box = document.createElement("div");
      box.className = "spinner" + (p.light ? " light" : "");
      const hint = document.createElement("p");
      hint.className = "label spin-hint";
      hint.textContent = "Drag to turn";
      sheetMedia.append(box, hint);
      sheetSpinner = new Spinner(box, p);
    } else if (p.kind === "video") {
      const play = calm() ? "controls" : "autoplay";
      sheetMedia.innerHTML = `<video muted playsinline loop ${play} poster="${still(p)}" src="${MEDIA(p.id)}video.mp4" aria-label="${p.title}"></video>`;
    } else {
      sheetMedia.innerHTML = `<img src="${still(p)}" alt="${p.title}" />`;
    }

    $("#sheet-meta").textContent = `${no(p)} · ${p.category}`;
    $("#sheet-title").textContent = p.title;
    $("#sheet-desc").textContent = p.description;
    const cta = $("#sheet-cta");
    if (whatsapp) cta.href = waLink(`Hi Ronen! I'm interested in the ${p.title}.`);
    else if (email) cta.href = `mailto:${email}?subject=${encodeURIComponent(p.title)}`;
    cta.hidden = !(whatsapp || email);

    if (!sheet.open) sheet.showModal();
    history.replaceState(null, "", `#${p.id}`);
    animateSheet(true);
  }

  const SHOWN = { opacity: 1, transform: "scale(1)", filter: "blur(0px)" };
  const HIDDEN = { opacity: 0, transform: "scale(0.6)", filter: "blur(4px)" };

  // Grows out of the clicked piece on open, shrinks back into it on close.
  // Interruptible: always starts from the current on-screen state. Reduced motion: opacity only.
  function animateSheet(opening) {
    const reduce = calm();
    let from = null;
    if (running?.playState === "running") {
      const cs = getComputedStyle(sheet);
      from = reduce ? { opacity: cs.opacity } : { opacity: cs.opacity, transform: cs.transform, filter: cs.filter };
    }
    running?.cancel(); // measure the untransformed sheet
    sheet.style.transformOrigin = originFrom(sourceCard);
    const shown = reduce ? { opacity: 1 } : SHOWN;
    const hidden = reduce ? { opacity: 0 } : HIDDEN;
    const anim = sheet.animate([from || (opening ? hidden : shown), opening ? shown : hidden], {
      duration: opening ? (reduce ? 150 : 380) : reduce ? 120 : 220, // exit snaps faster than entry
      easing: EASE_OUT,
      fill: "forwards",
    });
    anim.onfinish = () => {
      if (!opening) sheet.close();
      anim.cancel(); // drop the fill so no leftover filter/transform sits on the sheet
    };
    running = anim;
  }

  function closeSheet() {
    if (sheet.open) animateSheet(false);
  }

  $("#sheet-close").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet(); // click on the dimmed backdrop
  });
  sheet.addEventListener("cancel", (e) => {
    e.preventDefault(); // Esc: run the same exit animation
    closeSheet();
  });
  sheet.addEventListener("close", () => {
    clearSheetMedia();
    history.replaceState(null, "", location.pathname);
  });

  // Open a piece directly from a shared link, e.g. site.com/#bridal-set
  const linked = PIECES.find((p) => `#${p.id}` === location.hash);
  if (linked) openSheet(linked);

  // ── Accessibility menu ───────────────────────────────────
  // Built in (no third-party overlay). Each option is a class on <html>, remembered on this device.
  const A11Y = ["pause", "text", "contrast", "links", "font"];
  const a11yFab = $("#a11y-fab");
  const a11yPanel = $("#a11y-panel");
  const saved = (() => { try { return JSON.parse(localStorage.getItem("a11y") || "[]"); } catch { return []; } })();

  function setPaused(on) {
    motionPaused = on;
    if (on) {
      document.querySelectorAll("video").forEach((v) => v.pause());
      spinners.forEach((sp) => { sp.velocity = 0; }); // stop dead, don't coast
    } else {
      // Re-observe so whatever is on screen starts again; resume any visible spinners
      document.querySelectorAll("video[data-src]").forEach((v) => { onScreen.unobserve(v); onScreen.observe(v); });
      sheetMedia.querySelector("video")?.play().catch(() => {});
      spinners.forEach((sp) => { sp.idleSince = performance.now() - 1500; sp.start(); });
    }
  }

  // Entrance animations play once. Mark them finished so un-pausing never replays them.
  const settle = (el) => el.classList.add("settled");
  document.addEventListener("animationend", (e) => {
    if (e.target.matches?.(".in, .card")) settle(e.target);
  });

  function applyA11y(option, on) {
    if (option === "pause" && !on) document.querySelectorAll(".in, .card").forEach(settle);
    document.documentElement.classList.toggle(`a11y-${option}`, on);
    a11yPanel.querySelector(`[data-a11y="${option}"]`)?.setAttribute("aria-pressed", on);
    if (option === "pause") setPaused(on);
  }

  function saveA11y() {
    const active = A11Y.filter((o) => document.documentElement.classList.contains(`a11y-${o}`));
    try { localStorage.setItem("a11y", JSON.stringify(active)); } catch {}
  }

  saved.filter((o) => A11Y.includes(o)).forEach((o) => applyA11y(o, true));

  function togglePanel(open) {
    a11yPanel.hidden = !open;
    a11yFab.setAttribute("aria-expanded", open);
    if (open) a11yPanel.querySelector("button")?.focus();
  }
  a11yFab.addEventListener("click", () => togglePanel(a11yPanel.hidden));
  a11yPanel.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.a11y) {
      const on = btn.getAttribute("aria-pressed") !== "true";
      applyA11y(btn.dataset.a11y, on);
    } else if (btn.hasAttribute("data-a11y-reset")) {
      A11Y.forEach((o) => applyA11y(o, false));
    } else if (btn.hasAttribute("data-a11y-close")) {
      togglePanel(false);
      a11yFab.focus();
      return;
    }
    saveA11y();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !a11yPanel.hidden) { togglePanel(false); a11yFab.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (!a11yPanel.hidden && !a11yPanel.contains(e.target) && !a11yFab.contains(e.target)) togglePanel(false);
  });

  // ── Nav: firmer glass after scrolling ────────────────────
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(() => {
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Catalogue number, fixed by position in PIECES so it stays the same under any filter
  const no = (p) => `No. ${String(PIECES.indexOf(p) + 1).padStart(2, "0")}`;
  const meta = (p) => [no(p), p.date].filter(Boolean).join(" · ");

  // ── Site text from pieces.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const value = SITE[el.dataset.site];
    if (value) el.innerHTML = value;
  });
  $("#year").textContent = new Date().getFullYear();

  // ── Contact ──────────────────────────────────────────────
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
    instagram && { label: `Instagram @${instagram}`, href: `https://instagram.com/${instagram}` },
    email && { label: email, href: `mailto:${email}` },
  ]
    .filter(Boolean)
    .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`)
    .join("");

  if (whatsapp) {
    const fab = $("#wa-fab");
    fab.href = waLink("Hi Ronen! I found you through your website.");
    fab.hidden = false;
  }

  // ── Hero piece ───────────────────────────────────────────
  const hero = PIECES.find((p) => p.id === SITE.hero) || PIECES[0];
  $("#hero-img").src = hero.cutout || hero.images[0];
  $("#hero-img").alt = hero.title;
  $("#hero-open").classList.toggle("is-cutout", Boolean(hero.cutout));
  if (hero.position && !hero.cutout) $("#hero-img").style.objectPosition = hero.position;
  $("#hero-open").setAttribute("aria-label", `View ${hero.title}`);
  $("#hero-caption").textContent = hero.title;
  $("#hero-meta").textContent = meta(hero);
  $("#hero-open").addEventListener("click", (e) => openSheet(hero, e.currentTarget));

  // ── Filters ──────────────────────────────────────────────
  const categories = ["All", ...new Set(PIECES.map((p) => p.category))];
  let active = "All";
  const filters = $("#filters");
  filters.innerHTML = categories
    .map((c) => `<button role="tab" aria-selected="${c === active}" data-cat="${c}">${c}</button>`)
    .join("");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || btn.dataset.cat === active) return;
    active = btn.dataset.cat;
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", b === btn));
    renderGrid();
  });

  // ── Grid ─────────────────────────────────────────────────
  const grid = $("#grid");
  function renderGrid() {
    const items = PIECES.filter((p) => active === "All" || p.category === active);
    $("#work-count").textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;
    grid.innerHTML = items
      .map(
        (p, i) => `
        <button class="card${p.wide ? " wide" : ""}" data-id="${p.id}" title="${p.title}" style="--i:${i}">
          <div class="card-media"><img src="${p.images[0]}" alt="${p.title}" loading="lazy" onerror="this.classList.add('missing')"${
            p.position ? ` style="object-position:${p.position}"` : ""
          } /></div>
          <div class="card-label">
            <span class="card-title">${p.title}</span>
            <span class="card-meta">${meta(p)}</span>
          </div>
        </button>`
      )
      .join("");
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openSheet(PIECES.find((p) => p.id === card.dataset.id), card);
  });
  renderGrid();

  // ── Detail sheet ─────────────────────────────────────────
  const sheet = $("#sheet");
  const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  let sourceCard = null;
  let running = null;

  function originFrom(card) {
    if (!card) return "50% 50%";
    const s = sheet.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return `${c.left + c.width / 2 - s.left}px ${c.top + c.height / 2 - s.top}px`;
  }

  function openSheet(p, card) {
    sourceCard = card || null;
    const img = $("#sheet-img");
    img.src = p.images[0];
    img.alt = p.title;
    img.style.objectPosition = p.position || "";
    $("#sheet-meta").textContent = `${meta(p)} · ${p.category}`;
    $("#sheet-title").textContent = p.title;
    $("#sheet-desc").textContent = p.description;
    $("#sheet-thumbs").innerHTML =
      p.images.length > 1
        ? p.images.map((src) => `<img src="${src}" alt="" data-src="${src}" />`).join("")
        : "";

    const cta = $("#sheet-cta");
    if (whatsapp) cta.href = waLink(`Hi Ronen! I'm interested in the ${p.title}.`);
    else if (email) cta.href = `mailto:${email}?subject=${encodeURIComponent(p.title)}`;
    cta.hidden = !(whatsapp || email);
    const ig = $("#sheet-ig");
    ig.href = p.instagram || "";
    ig.hidden = !p.instagram;

    if (!sheet.open) sheet.showModal();
    history.replaceState(null, "", `#${p.id}`);
    animateSheet(true);
  }

  const SHOWN = { opacity: 1, transform: "scale(1)", filter: "blur(0px)" };
  const HIDDEN = { opacity: 0, transform: "scale(0.6)", filter: "blur(4px)" };

  // Grows out of the clicked piece on open, shrinks back into it on close.
  // Interruptible: always starts from the current on-screen state. Reduced motion: opacity only.
  function animateSheet(opening) {
    const reduce = reduceMotion.matches;
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

  $("#sheet-thumbs").addEventListener("click", (e) => {
    if (e.target.dataset.src) $("#sheet-img").src = e.target.dataset.src;
  });
  $("#sheet-close").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet(); // click on the dimmed backdrop
  });
  sheet.addEventListener("cancel", (e) => {
    e.preventDefault(); // Esc: run the same exit animation
    closeSheet();
  });
  sheet.addEventListener("close", () => history.replaceState(null, "", location.pathname));

  // Open a piece directly from a shared link, e.g. site.com/#pear-solitaire
  const linked = PIECES.find((p) => `#${p.id}` === location.hash);
  if (linked) openSheet(linked);

  // ── Nav: firmer glass after scrolling ────────────────────
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

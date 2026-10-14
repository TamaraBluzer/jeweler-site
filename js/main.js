(() => {
  const $ = (sel) => document.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // ── Site text from pieces.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const value = SITE[el.dataset.site];
    if (value) el.innerHTML = value;
  });
  $("#year").textContent = new Date().getFullYear();

  // ── Contact links ────────────────────────────────────────
  const { whatsapp, phone, instagram, email } = SITE.contact;
  const waLink = (text) =>
    `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const contactLinks = [
    whatsapp && { label: "WhatsApp", href: waLink(), primary: true, external: true },
    phone && { label: `Call ${phone}`, href: `tel:${phone.replace(/\D/g, "")}` },
    instagram && { label: "Instagram", href: `https://instagram.com/${instagram}`, external: true },
    email && { label: "Email", href: `mailto:${email}` },
  ].filter(Boolean);
  $("#contact-links").innerHTML = contactLinks
    .map(
      (l) =>
        `<a class="btn ${l.primary ? "btn-primary" : "glass"}" href="${l.href}"${
          l.external ? ' target="_blank" rel="noopener"' : ""
        }>${l.label}</a>`
    )
    .join("");

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
    grid.innerHTML = items
      .map(
        (p, i) => `
        <button class="card glass${p.wide ? " wide" : ""}" data-id="${p.id}" style="--i:${i}">
          <div class="card-media"><img src="${p.images[0]}" alt="${p.title}" loading="lazy"${
            p.position ? ` style="object-position:${p.position}"` : ""
          } /></div>
          <div class="card-label">
            <span class="card-title">${p.title}</span>
            <span class="card-cat">${p.category}</span>
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
  // The sheet grows out of the card that opened it and shrinks back into it.
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
    $("#sheet-cat").textContent = p.category;
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

    running?.cancel();
    sheet.showModal();
    history.replaceState(null, "", `#${p.id}`);
    if (reduceMotion.matches) return;
    sheet.style.transformOrigin = originFrom(sourceCard);
    // Materialize: scale + blur + opacity together, so the glass reads as arriving.
    running = sheet.animate(
      [
        { opacity: 0, transform: "scale(0.6)", filter: "blur(12px)" },
        { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
      ],
      { duration: 380, easing: EASE_OUT }
    );
  }

  function closeSheet() {
    if (!sheet.open) return;
    if (reduceMotion.matches) return sheet.close();
    running?.cancel(); // measure the untransformed sheet
    sheet.style.transformOrigin = originFrom(sourceCard);
    running = sheet.animate(
      [
        { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
        { opacity: 0, transform: "scale(0.6)", filter: "blur(12px)" },
      ],
      { duration: 220, easing: EASE_OUT, fill: "forwards" }
    );
    running.onfinish = () => {
      sheet.close();
      running.cancel();
    };
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

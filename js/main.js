(() => {
  const $ = (sel) => document.querySelector(sel);

  // ── Site text from pieces.js ─────────────────────────────
  document.querySelectorAll("[data-site]").forEach((el) => {
    const value = SITE[el.dataset.site];
    if (value) el.innerHTML = value;
  });
  document.title = `${SITE.name} Jewelry`;
  $("#year").textContent = new Date().getFullYear();

  // ── Contact links ────────────────────────────────────────
  const { whatsapp, instagram, email } = SITE.contact;
  const waLink = (text) =>
    `https://wa.me/${whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const contactLinks = [
    whatsapp && { label: "WhatsApp", href: waLink(), primary: true },
    instagram && { label: "Instagram", href: `https://instagram.com/${instagram}` },
    email && { label: "Email", href: `mailto:${email}` },
  ].filter(Boolean);
  $("#contact-links").innerHTML = contactLinks
    .map(
      (l) =>
        `<a class="btn ${l.primary ? "btn-primary" : "glass"}" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`
    )
    .join("");

  // ── Filters ──────────────────────────────────────────────
  const categories = ["All", ...new Set(PIECES.map((p) => p.category))];
  let active = "All";
  const filters = $("#filters");
  filters.innerHTML = categories
    .map(
      (c) =>
        `<button role="tab" aria-selected="${c === active}" data-cat="${c}">${c}</button>`
    )
    .join("");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    active = btn.dataset.cat;
    filters.querySelectorAll("button").forEach((b) =>
      b.setAttribute("aria-selected", b === btn)
    );
    renderGrid();
  });

  // ── Grid ─────────────────────────────────────────────────
  const grid = $("#grid");
  function renderGrid() {
    const items = PIECES.filter((p) => active === "All" || p.category === active);
    grid.innerHTML = items
      .map(
        (p, i) => `
        <button class="card glass${p.featured && active === "All" ? " featured" : ""}" data-id="${p.id}" style="--i:${i}">
          <div class="card-media"><img src="${p.images[0]}" alt="${p.title}" loading="lazy" /></div>
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
    if (card) openSheet(PIECES.find((p) => p.id === card.dataset.id));
  });
  renderGrid();

  // ── Detail sheet ─────────────────────────────────────────
  const sheet = $("#sheet");
  function openSheet(p) {
    $("#sheet-img").src = p.images[0];
    $("#sheet-img").alt = p.title;
    $("#sheet-cat").textContent = p.category;
    $("#sheet-title").textContent = p.title;
    $("#sheet-desc").textContent = p.description;
    $("#sheet-specs").innerHTML = Object.entries(p.specs || {})
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");
    $("#sheet-thumbs").innerHTML =
      p.images.length > 1
        ? p.images.map((src) => `<img src="${src}" alt="" data-src="${src}" />`).join("")
        : "";
    const cta = $("#sheet-cta");
    if (whatsapp) cta.href = waLink(`Hi! I'm interested in the ${p.title}.`);
    else if (email) cta.href = `mailto:${email}?subject=${encodeURIComponent(p.title)}`;
    cta.hidden = !(whatsapp || email);
    sheet.showModal();
    history.replaceState(null, "", `#${p.id}`);
  }
  $("#sheet-thumbs").addEventListener("click", (e) => {
    if (e.target.dataset.src) $("#sheet-img").src = e.target.dataset.src;
  });
  const closeSheet = () => sheet.close();
  $("#sheet-close").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet(); // click on backdrop
  });
  sheet.addEventListener("close", () => history.replaceState(null, "", location.pathname));

  // Open a piece directly from a shared link, e.g. site.com/#solace-ring
  const linked = PIECES.find((p) => `#${p.id}` === location.hash);
  if (linked) openSheet(linked);

  // ── Nav: firmer glass after scrolling ────────────────────
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

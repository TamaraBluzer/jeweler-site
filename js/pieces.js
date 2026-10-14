// ─────────────────────────────────────────────────────────────
// Edit this file to update the site. No build step needed.
//
// To add a piece:
//   1. Put its photo(s) in assets/pieces/  (JPG/WebP, ~1600px wide)
//   2. Copy one block in PIECES below and change the fields.
// ─────────────────────────────────────────────────────────────

const SITE = {
  name: "Aurelle",
  eyebrow: "Handcrafted fine jewelry",
  headline: "Made by hand.<br>Made to be kept.",
  tagline: "Each piece is designed and finished in a small studio, one at a time.",
  about:
    "Write the jeweler's story here — how they started, the materials they love, and what makes their work different.",
  contact: {
    // Leave a value empty ("") to hide that button.
    whatsapp: "972500000000", // international format, digits only
    instagram: "your.handle",
    email: "hello@example.com",
  },
};

const PIECES = [
  {
    id: "solace-ring",
    title: "Solace Ring",
    category: "Rings",
    images: ["assets/pieces/ring.svg"],
    description: "A slim band in recycled 14k gold, set with a single bezel-cut stone.",
    specs: { Metal: "14k recycled gold", Stone: "White sapphire, 3mm", Made: "To order, 2–3 weeks" },
    featured: true,
  },
  {
    id: "drift-necklace",
    title: "Drift Necklace",
    category: "Necklaces",
    images: ["assets/pieces/necklace.svg"],
    description: "A fine chain with a hand-hammered pendant that catches the light as it moves.",
    specs: { Metal: "Sterling silver", Length: "42–45 cm adjustable", Made: "Ready to ship" },
  },
  {
    id: "tide-earrings",
    title: "Tide Earrings",
    category: "Earrings",
    images: ["assets/pieces/earrings.svg"],
    description: "Asymmetric drops with freshwater pearls.",
    specs: { Metal: "14k gold-fill", Stone: "Freshwater pearl", Made: "Ready to ship" },
  },
  {
    id: "orbit-bracelet",
    title: "Orbit Bracelet",
    category: "Bracelets",
    images: ["assets/pieces/bracelet.svg"],
    description: "An open cuff with a brushed finish, shaped by hand to sit close to the wrist.",
    specs: { Metal: "Sterling silver", Size: "S / M / L", Made: "To order, 1–2 weeks" },
  },
  {
    id: "halo-ring",
    title: "Halo Ring",
    category: "Rings",
    images: ["assets/pieces/ring-2.svg"],
    description: "A statement ring with a cluster of small stones around a central gem.",
    specs: { Metal: "18k gold", Stone: "Lab-grown diamonds", Made: "Commission only" },
  },
  {
    id: "lune-necklace",
    title: "Lune Necklace",
    category: "Necklaces",
    images: ["assets/pieces/necklace-2.svg"],
    description: "A crescent pendant on a delicate cable chain.",
    specs: { Metal: "14k gold-fill", Length: "40 cm", Made: "Ready to ship" },
  },
];

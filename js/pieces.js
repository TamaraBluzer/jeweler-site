// ─────────────────────────────────────────────────────────────
// Edit this file to update the site. No build step needed.
//
// To add a piece:
//   1. Put its photo in assets/works/  (JPG/WebP, ideally 1600px+)
//   2. Copy one block in PIECES below and change the fields.
//      wide: true  → spans two columns (use for landscape photos)
//      position    → optional CSS object-position to frame the crop
// ─────────────────────────────────────────────────────────────

const SITE = {
  name: "Ronen Peretz",
  eyebrow: "Personal Jeweler · Fine Jewelry",
  headline: "Fine jewelry,<br>made for a lifetime.",
  tagline:
    "Bespoke engagement rings and one-of-a-kind pieces, designed with you and crafted to the highest standard.",
  about:
    "Ronen Peretz brings years of experience at the bench to every piece. He works personally with each client — from the first sketch to the final stone — creating bespoke engagement rings, fine jewelry commissions, and expert restorations of heirloom pieces.",
  contact: {
    // Leave a value empty ("") to hide that button.
    whatsapp: "972543978447", // international format, digits only
    phone: "054-397-8447",
    instagram: "ronen.jewelry",
    email: "",
  },
};

const PIECES = [
  {
    id: "vintage-milgrain-band",
    title: "Vintage Milgrain Band",
    category: "Bands",
    images: ["assets/works/06-DF5pOV3tC48.jpg"],
    description: "A yellow-gold band of open loops with milgrain edges, set with round diamonds all the way around.",
    instagram: "https://www.instagram.com/reel/DF5pOV3tC48/",
    wide: true,
  },
  {
    id: "emerald-pave-ring",
    title: "Emerald Pavé Ring",
    category: "Engagement",
    images: ["assets/works/01-DVHIDovCPga.jpg"],
    description: "An emerald-cut green stone in a yellow-gold setting, with pavé diamonds wrapping the band and gallery.",
    instagram: "https://www.instagram.com/reel/DVHIDovCPga/",
    position: "50% 70%",
  },
  {
    id: "pear-diamond-ring",
    title: "Pear Diamond Ring",
    category: "Engagement",
    images: ["assets/works/02-DS5poUFiGto.jpg"],
    description: "A large pear-shaped diamond on a split, pavé-set white-gold band.",
    instagram: "https://www.instagram.com/reel/DS5poUFiGto/",
    position: "50% 60%",
  },
  {
    id: "sapphire-baguette-ring",
    title: "Sapphire Baguette Ring",
    category: "Statement",
    images: ["assets/works/03-DSzKWABiNU9.jpg"],
    description: "A sculptural cocktail ring of blue sapphire baguettes and diamonds in white gold.",
    instagram: "https://www.instagram.com/reel/DSzKWABiNU9/",
  },
  {
    id: "pear-cluster-ring",
    title: "Pear Cluster Ring",
    category: "Statement",
    images: ["assets/works/12-CuQdp5FICre.jpg"],
    description: "An open bypass ring with clusters of pear-cut diamonds arranged like leaves.",
    instagram: "https://www.instagram.com/reel/CuQdp5FICre/",
    wide: true,
  },
  {
    id: "diamond-link-ring",
    title: "Diamond Link Ring",
    category: "Bands",
    images: ["assets/works/05-DF53ru6NADz.jpg"],
    description: "Paperclip links in yellow gold, each one lined with diamonds.",
    instagram: "https://www.instagram.com/reel/DF53ru6NADz/",
  },
  {
    id: "three-stone-ring",
    title: "Three-Stone Ring",
    category: "Engagement",
    images: ["assets/works/04-DSu2fweiOTe.jpg"],
    description: "A champagne center stone flanked by two yellow accent stones on a fine band.",
    instagram: "https://www.instagram.com/reel/DSu2fweiOTe/",
    wide: true,
  },
  {
    id: "pear-solitaire",
    title: "Pear Solitaire",
    category: "Engagement",
    images: ["assets/works/07-Cw0KGsWMS2d.jpg"],
    description: "A classic pear-cut diamond solitaire on a slim, tapered white-gold band.",
    instagram: "https://www.instagram.com/reel/Cw0KGsWMS2d/",
    wide: true,
  },
  {
    id: "diamond-eternity-band",
    title: "Diamond Eternity Band",
    category: "Bands",
    images: ["assets/works/08-Cw0Jp7IsxN7.jpg"],
    description: "Round diamonds set shoulder to shoulder all the way around.",
    instagram: "https://www.instagram.com/reel/Cw0Jp7IsxN7/",
    wide: true,
  },
  {
    id: "engraved-bracelet",
    title: "Engraved Macramé Bracelet",
    category: "Personalized",
    images: ["assets/works/10-CuQd5zcI4L_.jpg"],
    description: "A hand-knotted cord bracelet with a rose-gold bar, engraved with a name and date.",
    instagram: "https://www.instagram.com/reel/CuQd5zcI4L_/",
    wide: true,
  },
];

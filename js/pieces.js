// ─────────────────────────────────────────────────────────────
// Edit this file to update the site. No build step needed.
//
// Each piece's media lives in assets/media/<id>/:
//   video.mp4 + poster.jpg   for a video piece   (kind: "video")
//   photo.jpg                for a photo piece   (kind: "photo")
//   spin/01.jpg … NN.jpg     optional frames of one full turn → drag-to-spin 3D view
//
// Fields:
//   spin   → number of frames in spin/ (omit if there are none)
//   start  → spin frame to open on (e.g. the front view); it holds there briefly, then turns
//   light  → true when the piece was shot on a white/cream background;
//            it then sits straight on the page instead of in a dark frame
//   wide   → spans two columns in the grid (for landscape footage)
// ─────────────────────────────────────────────────────────────

const SITE = {
  name: "Ronen Peretz",
  eyebrow: "Ronen Peretz · Personal jeweler",
  headline: "Quality. Service. <em>Price.</em>",
  tagline:
    "Engagement rings and fine jewelry, designed with you and made to order. Ronen also restores the jewelry you already love.",
  about:
    "Ronen Peretz is a personal jeweler. He designs each piece around the client's own choices, and engagement rings are his specialty. He also restores old jewelry and looks after the pieces people wear every day.",
  hero: "oval-half-eternity", // the piece shown in 3D on the front page
  film: "film", // vertical film shown in the studio section
  contact: {
    // Leave a value empty ("") to hide that link.
    whatsapp: "972543978447", // international format, digits only
    phone: "054-397-8447",
    instagram: "ronen.jewelry",
    email: "",
  },
};

const PIECES = [
  // The order here is the order on the site (and sets each piece's catalogue number)
  { id: "oval-eternity", title: "Oval Eternity Band", category: "Bands", kind: "photo", light: true, wide: true,
    description: "Oval diamonds set all the way around, in white gold." },
  { id: "heart-eternity-band", title: "Heart Eternity Band", category: "Bands", kind: "video", light: true,
    description: "Heart-shaped diamonds in yellow-gold bezels, all the way around." },
  { id: "bridal-set", title: "Three-Stone Bridal Set", category: "Engagement", kind: "video", spin: 60, light: true,
    description: "A three-stone engagement ring with a matching band, in white gold." },
  { id: "emerald-cut-ring", title: "Emerald-Cut Ring", category: "Engagement", kind: "video",
    description: "An emerald-cut diamond on a band of marquise and round stones, in white gold." },
  { id: "tennis-bracelet", title: "Tennis Bracelet", category: "Bracelets", kind: "video", wide: true,
    description: "Round diamonds set edge to edge, in white gold." },
  { id: "fine-tennis-bracelet", title: "Fine Tennis Bracelet", category: "Bracelets", kind: "video",
    description: "A slim line of diamonds, in white gold." },
  { id: "marquise-solitaire", title: "Marquise Solitaire", category: "Engagement", kind: "video", wide: true,
    description: "A marquise diamond on a slim, tapering white-gold band." },
  { id: "oval-half-eternity", title: "Oval Half-Eternity Band", category: "Bands", kind: "video", spin: 60, start: 39, light: true,
    description: "Five oval diamonds across the top of a yellow-gold band." },
  { id: "asscher-studs-gold", title: "Asscher Studs, Yellow Gold", category: "Earrings", kind: "video", spin: 48, light: true,
    description: "Asscher-cut diamonds in yellow-gold settings." },
  { id: "diamond-hoops", title: "Diamond Hoops", category: "Earrings", kind: "video", spin: 48,
    description: "Hoops lined with diamonds, in white gold." },
  { id: "round-studs", title: "Round Diamond Studs", category: "Earrings", kind: "video",
    description: "Round diamonds in four-prong white-gold settings." },
  { id: "asscher-studs-white", title: "Asscher Bezel Studs", category: "Earrings", kind: "video", light: true,
    description: "Asscher-cut diamonds framed in white-gold bezels." },
  { id: "drop-earrings", title: "Diamond Drop Earrings", category: "Earrings", kind: "video",
    description: "Small diamond drops on white-gold huggie hoops." },
  { id: "solitaire-pendant", title: "Solitaire Pendant", category: "Necklaces", kind: "video",
    description: "A single diamond on a fine white-gold chain." },
  { id: "pendant-photo", title: "Four-Prong Pendant", category: "Necklaces", kind: "photo",
    description: "A round diamond in a four-prong setting, on a fine chain." },
  { id: "heart-pendant", title: "Open Heart Pendant", category: "Necklaces", kind: "video",
    description: "An open heart lined with diamonds, on a white-gold chain." },
  { id: "station-necklace", title: "Diamond Station Necklace", category: "Necklaces", kind: "photo",
    description: "Diamonds in yellow-gold bezels, spaced along a fine chain." },
  { id: "basketball-pendant", title: "Basketball Pendant", category: "Necklaces", kind: "video",
    description: "A rose-gold pendant set with diamonds." },
  { id: "star-bangle", title: "Star Bangle", category: "Bracelets", kind: "video",
    description: "An open bangle finished with two stars." },
  { id: "id-bracelet", title: "Name Bar Bracelet", category: "Bracelets", kind: "video",
    description: "A yellow-gold chain with an engravable bar and a flower charm." },
  { id: "bypass-solitaire", title: "Bypass Solitaire", category: "Engagement", kind: "video",
    description: "A round diamond held in a sweeping rose-gold bypass setting." },
];

// Where a piece's media lives (kept here so the folder layout is defined once)
const MEDIA = (id) => `assets/media/${id}/`;

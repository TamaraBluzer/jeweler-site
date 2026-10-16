// Earlier dark design. Shows Ronen's own photos and video stills (shared with the main site).
// Edit the main site's js/pieces.js for the full piece list; this file mirrors it.

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
    "id": "bridal-set",
    "title": "Three-Stone Bridal Set",
    "category": "Engagement",
    "images": [
      "../assets/media/bridal-set/poster.jpg"
    ],
    "description": "A three-stone engagement ring with a matching band, in white gold."
  },
  {
    "id": "emerald-cut-ring",
    "title": "Emerald-Cut Ring",
    "category": "Engagement",
    "images": [
      "../assets/media/emerald-cut-ring/poster.jpg"
    ],
    "description": "An emerald-cut diamond on a band of marquise and round stones, in white gold."
  },
  {
    "id": "marquise-solitaire",
    "title": "Marquise Solitaire",
    "category": "Engagement",
    "images": [
      "../assets/media/marquise-solitaire/poster.jpg"
    ],
    "description": "A marquise diamond on a slim, tapering white-gold band.",
    "wide": true
  },
  {
    "id": "bypass-solitaire",
    "title": "Bypass Solitaire",
    "category": "Engagement",
    "images": [
      "../assets/media/bypass-solitaire/poster.jpg"
    ],
    "description": "A round diamond held in a sweeping rose-gold bypass setting."
  },
  {
    "id": "oval-half-eternity",
    "title": "Oval Half-Eternity Band",
    "category": "Bands",
    "images": [
      "../assets/media/oval-half-eternity/poster.jpg"
    ],
    "description": "Five oval diamonds across the top of a yellow-gold band."
  },
  {
    "id": "oval-eternity",
    "title": "Oval Eternity Band",
    "category": "Bands",
    "images": [
      "../assets/media/oval-eternity/photo.jpg"
    ],
    "description": "Oval diamonds set all the way around, in white gold.",
    "wide": true
  },
  {
    "id": "heart-eternity-band",
    "title": "Heart Eternity Band",
    "category": "Bands",
    "images": [
      "../assets/media/heart-eternity-band/poster.jpg"
    ],
    "description": "Heart-shaped diamonds in yellow-gold bezels, all the way around."
  },
  {
    "id": "asscher-studs-gold",
    "title": "Asscher Studs, Yellow Gold",
    "category": "Earrings",
    "images": [
      "../assets/media/asscher-studs-gold/poster.jpg"
    ],
    "description": "Asscher-cut diamonds in yellow-gold settings."
  },
  {
    "id": "diamond-hoops",
    "title": "Diamond Hoops",
    "category": "Earrings",
    "images": [
      "../assets/media/diamond-hoops/poster.jpg"
    ],
    "description": "Hoops lined with diamonds, in white gold."
  },
  {
    "id": "round-studs",
    "title": "Round Diamond Studs",
    "category": "Earrings",
    "images": [
      "../assets/media/round-studs/poster.jpg"
    ],
    "description": "Round diamonds in four-prong white-gold settings."
  },
  {
    "id": "asscher-studs-white",
    "title": "Asscher Bezel Studs",
    "category": "Earrings",
    "images": [
      "../assets/media/asscher-studs-white/poster.jpg"
    ],
    "description": "Asscher-cut diamonds framed in white-gold bezels."
  },
  {
    "id": "drop-earrings",
    "title": "Diamond Drop Earrings",
    "category": "Earrings",
    "images": [
      "../assets/media/drop-earrings/poster.jpg"
    ],
    "description": "Small diamond drops on white-gold huggie hoops."
  },
  {
    "id": "solitaire-pendant",
    "title": "Solitaire Pendant",
    "category": "Necklaces",
    "images": [
      "../assets/media/solitaire-pendant/poster.jpg"
    ],
    "description": "A single diamond on a fine white-gold chain."
  },
  {
    "id": "pendant-photo",
    "title": "Four-Prong Pendant",
    "category": "Necklaces",
    "images": [
      "../assets/media/pendant-photo/photo.jpg"
    ],
    "description": "A round diamond in a four-prong setting, on a fine chain."
  },
  {
    "id": "heart-pendant",
    "title": "Open Heart Pendant",
    "category": "Necklaces",
    "images": [
      "../assets/media/heart-pendant/poster.jpg"
    ],
    "description": "An open heart lined with diamonds, on a white-gold chain."
  },
  {
    "id": "station-necklace",
    "title": "Diamond Station Necklace",
    "category": "Necklaces",
    "images": [
      "../assets/media/station-necklace/photo.jpg"
    ],
    "description": "Diamonds in yellow-gold bezels, spaced along a fine chain."
  },
  {
    "id": "basketball-pendant",
    "title": "Basketball Pendant",
    "category": "Necklaces",
    "images": [
      "../assets/media/basketball-pendant/poster.jpg"
    ],
    "description": "A rose-gold pendant set with diamonds."
  },
  {
    "id": "tennis-bracelet",
    "title": "Tennis Bracelet",
    "category": "Bracelets",
    "images": [
      "../assets/media/tennis-bracelet/poster.jpg"
    ],
    "description": "Round diamonds set edge to edge, in white gold.",
    "wide": true
  },
  {
    "id": "fine-tennis-bracelet",
    "title": "Fine Tennis Bracelet",
    "category": "Bracelets",
    "images": [
      "../assets/media/fine-tennis-bracelet/poster.jpg"
    ],
    "description": "A slim line of diamonds, in white gold."
  },
  {
    "id": "star-bangle",
    "title": "Star Bangle",
    "category": "Bracelets",
    "images": [
      "../assets/media/star-bangle/poster.jpg"
    ],
    "description": "An open bangle finished with two stars."
  },
  {
    "id": "id-bracelet",
    "title": "Name Bar Bracelet",
    "category": "Bracelets",
    "images": [
      "../assets/media/id-bracelet/poster.jpg"
    ],
    "description": "A yellow-gold chain with an engravable bar and a flower charm."
  }
];

import type { State } from "./types";
import { realProducts, realCollections } from "./real-catalog";
export const products = realProducts;
export const initialState = (): State => ({
  version: 3,
  products: structuredClone(products),
  collections: structuredClone(realCollections),
  users: [],
  orders: [],
  subscribers: [],
  messages: [],
  attempts: {},
  audit: [],
  settings: {
    announcement:
      "RAY-BAN $60 · SELECTED STYLES UP TO $120 · FIRST 3 PAIRS $50",
    heroTitle: "A DIFFERENT\nPERSPECTIVE.",
    heroCopy:
      "Original eyewear from multiple original brands. Curated for confidence, character and distinctive style.",
    heroImage: "/media/street-rayban.webp",
    campaignImage: "/media/two-perspectives.webp",
    whatsapp: "263780774428",
    email: "ronanjaeger721@gmail.com",
    instagram: "",
    tiktok: "",
    launchApproved: false,
    manualOrdersEnabled: false,
    delivery: [
      {
        id: "collection",
        name: "Collection — arrangement required",
        price: 0,
        enabled: false,
      },
    ],
    faqs: [
      {
        question: "What does JAEGER EYEWEAR offer?",
        answer:
          "A curated selection of original eyewear from multiple original brands. JAEGER EYEWEAR is the curator, not the manufacturer of these branded frames.",
      },
      {
        question: "How much are the glasses?",
        answer:
          "Ray-Ban pairs are $60. Selected styles from the other brands go up to $120; confirm the exact price for your chosen frame with the team. The first three pairs sold qualify for our $50 launch offer, subject to the remaining allocation.",
      },
      {
        question: "How do I check availability?",
        answer:
          "Choose a frame and use its WhatsApp enquiry, or save your selection to your bag and enquire together. The team confirms the exact model, price and availability. An enquiry is not a paid order or a stock reservation.",
      },
      {
        question: "Are prescription lenses available?",
        answer:
          "Optical frames are shown in the collection. Prescription lenses and fulfilment arrangements must be confirmed separately; no prescription service is assumed.",
      },
      {
        question: "How does the $50 launch offer work?",
        answer:
          "The first three pairs sold are $50 each. Eligible saved orders reserve offer allocation alongside stock for 24 hours. Unpaid expired or cancelled orders release it. A WhatsApp enquiry alone does not reserve the offer.",
      },
    ],
    shipping:
      "Delivery areas, fees and dispatch times will be confirmed before commercial ordering opens. Confirm delivery arrangements with the team before placing an order.",
    returns:
      "The returns process and eligibility will be published before commercial launch. Contact support when configured for any order-specific assistance.",
    privacy:
      "Pre-launch privacy notice: account and enquiry information is used to provide the requested service. Newsletter consent is optional and can be withdrawn from your account. Do not submit sensitive information. The business controller, retention periods, contact channel and applicable operational policy must be approved before commercial launch.",
    terms:
      "This is a pre-launch development preview. JAEGER is a provisional commercial name pending clearance. JAEGER curates frames from the brands shown in the photographs. Exact model details, prices and availability are confirmed per item. No unverified specification, certification or delivery promise is made. Commercial terms require business approval before live ordering.",
  },
});

// Apply this approved catalogue revision once; preserve accounts, orders and live admin items.
export function upgradeState(s: State) {
  if (s.version >= 3) return;
  const defaults = initialState();
  const oldConcepts = new Set([
    "rectangle",
    "square",
    "aviator",
    "cat-eye",
    "statement",
  ]);
  for (const p of s.products)
    if (oldConcepts.has(p.id) && p.concept) p.archived = true;
  for (const p of defaults.products)
    if (!s.products.some((x) => x.id === p.id)) s.products.push(p);
  s.collections = s.collections.filter((c) => !oldConcepts.has(c.id));
  for (const c of defaults.collections)
    if (!s.collections.some((x) => x.id === c.id)) s.collections.push(c);
  s.settings.heroImage = defaults.settings.heroImage;
  s.settings.campaignImage = defaults.settings.campaignImage;
  s.settings.heroCopy = defaults.settings.heroCopy;
  s.settings.announcement = defaults.settings.announcement;
  s.settings.faqs = defaults.settings.faqs;
  s.settings.shipping = defaults.settings.shipping;
  s.settings.terms = defaults.settings.terms;
  s.version = 3;
}

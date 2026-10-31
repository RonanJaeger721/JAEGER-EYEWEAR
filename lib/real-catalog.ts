import type { Product, Collection } from "./types";

type Entry = {
  id: string;
  brand: string;
  name: string;
  shape: string;
  color: string;
  hex?: string;
  photo: string;
  images?: string[];
  price?: number;
  optical?: boolean;
  featured?: boolean;
  description: string;
};
const entries: Entry[] = [
  {
    id: "ray-ban-angular-black",
    brand: "Ray-Ban",
    name: "Ray-Ban Angular Square",
    shape: "square",
    color: "Black",
    photo: "rb-angular-black",
    images: ["rb-angular-detail", "street-rayban", "street-rayban-front"],
    price: 6000,
    featured: true,
    description:
      "An angular black frame with a bold, tapered profile. A confident everyday silhouette, worn your way. $60; confirm availability with the team.",
  },
  {
    id: "miu-miu-metal-rectangle",
    brand: "Miu Miu",
    name: "Miu Miu Metal Rectangle",
    shape: "rectangle",
    color: "Dark metal",
    photo: "miu-metal-rectangle",
    images: ["street-miumiu"],
    featured: true,
    description:
      "A slim rectangular silhouette with metal detailing and a distinctive geometric line. Confirm the current price and availability with the team.",
  },
  {
    id: "dior-square-as-worn",
    brand: "Dior",
    name: "Dior Square — As Worn",
    shape: "square",
    color: "Black",
    photo: "dior-square-worn",
    images: ["street-dior", "friends-edit"],
    featured: true,
    description:
      "A substantial square silhouette with distinctive Dior temple detailing. The frame from our bucket-hat portrait, selected for a strong individual look. Ask for its current price and availability.",
  },
  {
    id: "metal-rectangle-as-worn",
    brand: "Selected brands",
    name: "Metal Rectangle — As Worn",
    shape: "rectangle",
    color: "Black / metal",
    photo: "metal-rectangle-worn",
    images: ["friends-edit", "two-perspectives"],
    featured: true,
    description:
      "The dark rectangular pair worn at the centre of our group portrait. Understated proportions with a metal bridge. Brand, model, price and availability are confirmed on enquiry.",
  },
  {
    id: "ray-ban-soft-square",
    brand: "Ray-Ban",
    name: "Ray-Ban Soft Square",
    shape: "square",
    color: "Black",
    photo: "rb-square-black",
    price: 6000,
    description:
      "A rounded square silhouette in black, balancing a strong outline with softer corners. Ray-Ban eyewear is $60; availability confirmed on enquiry.",
  },
  {
    id: "ray-ban-cat-eye",
    brand: "Ray-Ban",
    name: "Ray-Ban Cat Eye",
    shape: "cat-eye",
    color: "Black",
    photo: "rb-cat-eye-black",
    price: 6000,
    description:
      "An upswept black silhouette with a confident, sculpted outline. Ray-Ban eyewear is $60; confirm availability before ordering.",
  },
  {
    id: "ray-ban-narrow-rectangle",
    brand: "Ray-Ban",
    name: "Ray-Ban Narrow Rectangle",
    shape: "rectangle",
    color: "Black",
    photo: "rb-rectangle-black",
    price: 6000,
    description:
      "A compact rectangular shape with dark lenses and a clean black outline. Ray-Ban eyewear is $60; ask for availability.",
  },
  {
    id: "porsche-design-metal-aviator",
    brand: "Porsche Design",
    name: "Porsche Design Metal Aviator",
    shape: "aviator",
    color: "Metal / dark tint",
    hex: "#9c9588",
    photo: "porsche-metal-aviator",
    description:
      "A metal aviator silhouette with a double bridge and dark-tinted lenses. Confirm the exact model, price and availability with the team.",
  },
  {
    id: "ray-ban-purple-rectangle",
    brand: "Ray-Ban",
    name: "Ray-Ban Purple Rectangle",
    shape: "rectangle",
    color: "Purple",
    hex: "#715176",
    photo: "rb-purple-rectangle",
    price: 6000,
    description:
      "A purple rectangular frame for a more expressive point of view. Ray-Ban eyewear is $60; confirm availability with the team.",
  },
  {
    id: "dior-blue-oversized",
    brand: "Dior",
    name: "Dior Blue Oversized",
    shape: "oversized",
    color: "Blue / violet tint",
    hex: "#70878f",
    photo: "dior-blue-square",
    description:
      "An oversized blue-toned square frame with violet-toned lenses. A distinctive colour perspective. Ask us to confirm the price and availability.",
  },
  {
    id: "prada-blue-shield",
    brand: "Prada",
    name: "Prada Blue Shield",
    shape: "statement",
    color: "Black / blue tint",
    hex: "#1a234b",
    photo: "prada-blue-shield",
    featured: true,
    description:
      "A wide shield silhouette with a blue-tinted lens and an angular outline. A bold statement from the curated selection. Confirm the current price and availability.",
  },
  {
    id: "versace-optical-square",
    brand: "Versace",
    name: "Versace Optical Square",
    shape: "square",
    color: "Black",
    photo: "versace-optical-black",
    optical: true,
    description:
      "A structured black optical frame with broad square proportions. Frame supply, price and any prescription arrangements must be confirmed separately.",
  },
  {
    id: "gucci-optical-cat-eye",
    brand: "Gucci",
    name: "Gucci Optical Cat Eye",
    shape: "cat-eye",
    color: "Black",
    photo: "gucci-optical-cat-eye",
    optical: true,
    description:
      "An upswept optical silhouette with a refined black outline. Confirm frame availability, price and any prescription arrangements with the team.",
  },
  {
    id: "fendi-optical-rectangle",
    brand: "Fendi",
    name: "Fendi Optical Rectangle",
    shape: "rectangle",
    color: "Dark tortoise",
    hex: "#493b35",
    photo: "fendi-tortoise-rectangle",
    optical: true,
    description:
      "A substantial rectangular optical frame with a dark tortoise appearance. Ask for its current price, availability and any prescription arrangements.",
  },
  {
    id: "gucci-oversized-square",
    brand: "Gucci",
    name: "Gucci Oversized Square",
    shape: "oversized",
    color: "Black",
    photo: "gucci-black-square",
    description:
      "An oversized dark square frame with distinctive Gucci temple detailing. Price and availability are confirmed on enquiry.",
  },
  {
    id: "versace-bone-square",
    brand: "Versace",
    name: "Versace Bone Square",
    shape: "oversized",
    color: "Bone",
    hex: "#e0d7bd",
    photo: "versace-bone-square",
    description:
      "A bone-coloured oversized square frame with a decorative temple detail. Ask the team to confirm its price and availability.",
  },
];
export const realProducts: Product[] = entries.map((e, i) => ({
  id: e.id,
  slug: e.id,
  name: e.name,
  brand: e.brand,
  category: e.optical ? "optical" : "sunglasses",
  shape: e.shape,
  description: e.description,
  concept: false,
  verified: false,
  inventoryConfirmed: false,
  featured: !!e.featured,
  newArrival: i < 4,
  archived: false,
  variants: [
    {
      id: e.id + "-0",
      color: e.color,
      hex: e.hex || "#151515",
      lens: e.optical ? "Clear lenses" : "Dark tint",
      material: "Unconfirmed",
      images: [e.photo, ...(e.images || [])].map(
        (n) => "/media/" + n + ".webp",
      ),
      price: e.price ?? null,
      stock: 0,
    },
  ],
}));
export const realCollections: Collection[] = [
  {
    id: "ray-ban",
    name: "Ray-Ban / $60",
    description:
      "Original Ray-Ban eyewear, curated for an individual point of view. $60 per pair; availability confirmed on enquiry.",
    image: "/media/rb-square-black.webp",
    products: realProducts
      .filter((p) => p.brand === "Ray-Ban")
      .map((p) => p.id),
    order: 0,
  },
  {
    id: "as-worn",
    name: "The As-Worn Edit",
    description:
      "The frames from our real-life portraits. Four different perspectives, worn your way.",
    image: "/media/friends-edit.webp",
    products: realProducts.slice(0, 4).map((p) => p.id),
    order: 1,
  },
  {
    id: "statement",
    name: "The Statement Edit",
    description:
      "Oversized proportions, shield silhouettes and distinctive details from multiple original brands.",
    image: "/media/prada-blue-shield.webp",
    products: realProducts
      .filter((p) => ["oversized", "statement"].includes(p.shape))
      .map((p) => p.id),
    order: 2,
  },
  {
    id: "optical",
    name: "The Optical Edit",
    description:
      "A selection of branded optical frames. Confirm frame supply, price and any prescription arrangements with the team.",
    image: "/media/versace-optical-black.webp",
    products: realProducts
      .filter((p) => p.category === "optical")
      .map((p) => p.id),
    order: 3,
  },
  {
    id: "dior",
    name: "The Dior Selection",
    description:
      "Distinctive square and oversized silhouettes in our Dior selection.",
    image: "/media/street-dior.webp",
    products: realProducts.filter((p) => p.brand === "Dior").map((p) => p.id),
    order: 4,
  },
  {
    id: "miu-miu",
    name: "The Miu Miu Selection",
    description:
      "The metal rectangle frame, photographed on the table and worn in real life.",
    image: "/media/street-miumiu.webp",
    products: ["miu-miu-metal-rectangle"],
    order: 5,
  },
  {
    id: "metal",
    name: "Metal Perspectives",
    description:
      "Aviator and rectangular silhouettes with visible metal detailing. Ask for current prices and availability.",
    image: "/media/miu-metal-rectangle.webp",
    products: [
      "miu-miu-metal-rectangle",
      "porsche-design-metal-aviator",
      "metal-rectangle-as-worn",
    ],
    order: 6,
  },
];

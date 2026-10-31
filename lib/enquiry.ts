import type { Product, Line } from "./types";

export function selectionEnquiry(
  products: Product[],
  lines: Line[],
  phone: string,
) {
  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!product || !variant) return null;
      const price =
        variant.price === null
          ? "please confirm price"
          : `$${(variant.price / 100).toFixed(2)} each`;
      return `${line.quantity} × ${product.name} / ${variant.color} / ${price} / ref ${product.id}`;
    })
    .filter(Boolean);
  const message = `Hello JAEGER EYEWEAR. Please confirm price, availability and delivery for my selection:\n\n${items.join("\n")}\n\nPlease also confirm whether the first-three-pairs $50 offer is still available. This is an enquiry, not a paid order or stock reservation.`;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

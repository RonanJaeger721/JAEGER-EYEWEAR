import type { Order } from "./types";

export const INTRO_PRICE = 5000;
export const INTRO_LIMIT = 3;

// Paid pairs consume the offer permanently; active unpaid reservations hold slots.
// Test transactions have a separate allocation and never consume the live offer.
export function introRemaining(
  orders: Order[],
  test = false,
  now = Date.now(),
) {
  const used = orders
    .filter(
      (o) =>
        !!o.test === test &&
        (o.payment === "paid" ||
          (o.payment === "pending_payment" &&
            Date.parse(o.reservationUntil) > now)),
    )
    .reduce(
      (sum, o) => sum + o.items.reduce((n, l) => n + (l.introQuantity || 0), 0),
      0,
    );
  return Math.max(0, INTRO_LIMIT - used);
}

export function quoteLines(
  lines: { price: number; quantity: number }[],
  remaining: number,
) {
  let slots = Math.max(0, Math.min(INTRO_LIMIT, Math.floor(remaining)));
  const items = lines.map((l) => {
    const introQuantity =
      l.price > INTRO_PRICE ? Math.min(l.quantity, slots) : 0;
    slots -= introQuantity;
    const discount = (l.price - INTRO_PRICE) * introQuantity;
    return {
      ...l,
      introQuantity,
      discount,
      total: l.price * l.quantity - discount,
    };
  });
  return {
    items,
    subtotal: items.reduce((n, l) => n + l.price * l.quantity, 0),
    discount: items.reduce((n, l) => n + l.discount, 0),
    introQuantity: items.reduce((n, l) => n + l.introQuantity, 0),
    total: items.reduce((n, l) => n + l.total, 0),
  };
}

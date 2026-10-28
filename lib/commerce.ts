import { randomUUID } from "node:crypto";
import type { State, Line, Order } from "./types";
export function releaseExpired(s: State, now = Date.now()) {
  for (const order of s.orders)
    if (
      order.payment === "pending_payment" &&
      Date.parse(order.reservationUntil) < now
    ) {
      order.payment = "expired";
      for (const l of order.items) {
        const v = s.products
          .find((p) => p.id === l.productId)
          ?.variants.find((v) => v.id === l.variantId);
        if (v) v.stock += l.quantity;
      }
      order.history.push({
        at: new Date(now).toISOString(),
        message: "Reservation expired; inventory released.",
      });
    }
}
export function createOrder(
  s: State,
  input: {
    key: string;
    lines: Line[];
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    delivery: string;
  },
  test = false,
): Order {
  releaseExpired(s);
  const previous = s.orders.find(
    (o) => o.key === input.key && o.userId === input.userId,
  );
  if (previous) return previous;
  if (!test && (!s.settings.launchApproved || !s.settings.manualOrdersEnabled))
    throw new Error(
      "Ordering is not open. Join the collection announcement list.",
    );
  if (input.lines.length === 0) throw new Error("Your bag is empty.");
  const grouped = new Map<string, Line>();
  for (const l of input.lines) {
    const key = l.productId + ":" + l.variantId;
    const existing = grouped.get(key);
    grouped.set(key, {
      ...l,
      quantity: l.quantity + (existing?.quantity || 0),
    });
  }
  const items = [...grouped.values()].map((l) => {
    if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 10)
      throw new Error("Choose between 1 and 10 of each frame.");
    const p = s.products.find((p) => p.id === l.productId && !p.archived);
    const v = p?.variants.find((v) => v.id === l.variantId);
    if (!p || !v || p.concept || !p.verified || v.price === null)
      throw new Error("This concept frame is not available to order.");
    if (v.stock < l.quantity)
      throw new Error(`${p.name}: only ${v.stock} available.`);
    return { ...l, name: p.name, color: v.color, price: v.price };
  });
  const delivery = s.settings.delivery.find(
    (d) => d.id === input.delivery && d.enabled,
  );
  if (!delivery) throw new Error("Choose an available delivery option.");
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: randomUUID(),
    items,
    total:
      items.reduce((sum, l) => sum + l.price * l.quantity, 0) + delivery.price,
    shipping: delivery.price,
    payment: "pending_payment",
    fulfilment: "unfulfilled",
    reservationUntil: new Date(Date.now() + 86400000).toISOString(),
    createdAt: now,
    history: [
      {
        at: now,
        message:
          "Order recorded. Payment pending. Inventory reserved for 24 hours.",
      },
    ],
    test,
  };
  for (const l of items)
    s.products
      .find((p) => p.id === l.productId)!
      .variants.find((v) => v.id === l.variantId)!.stock -= l.quantity;
  s.orders.push(order);
  return order;
}
export function verifyManualPayment(
  s: State,
  id: string,
  reference: string,
  actor: string,
) {
  releaseExpired(s);
  const order = s.orders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found.");
  if (order.payment !== "pending_payment")
    throw new Error("Only an active pending order can be verified.");
  const canonical = reference.trim().toUpperCase();
  if (canonical.length < 6)
    throw new Error(
      "Enter a payment evidence reference of at least 6 characters.",
    );
  if (
    s.orders.some((o) => o.paymentReference?.trim().toUpperCase() === canonical)
  )
    throw new Error("This payment reference has already been used.");
  order.payment = "paid";
  order.paymentReference = canonical;
  order.history.push({
    at: new Date().toISOString(),
    message: `Payment independently verified by ${actor}. Reference: ${canonical}`,
  });
}
export interface PaymentProvider {
  id: string;
  createPayment(order: Order): Promise<{ url: string }>;
  verifyWebhook(
    rawBody: string,
    headers: Headers,
  ): Promise<{
    orderId: string;
    reference: string;
    amount: number;
    currency: "USD";
  }>;
}
export const paymentProvider: PaymentProvider | null = null;

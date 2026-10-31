import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { initialState, upgradeState } from "../lib/seed";
import {
  createOrder,
  releaseExpired,
  verifyManualPayment,
} from "../lib/commerce";
import { quoteLines, introRemaining } from "../lib/pricing";
const input = () => ({
  key: randomUUID(),
  userId: "offer-test",
  name: "Offer test",
  email: "offer@example.test",
  phone: "000000000",
  address: "Local test only",
  delivery: "test",
  lines: [
    {
      productId: "ray-ban-angular-black",
      variantId: "ray-ban-angular-black-0",
      quantity: 1,
    },
  ],
});
function fixture() {
  const s = initialState();
  s.settings.delivery = [
    { id: "test", name: "Test delivery", price: 500, enabled: true },
  ];
  s.products[0].concept = false;
  s.products[0].verified = true;
  s.products[0].inventoryConfirmed = true;
  s.products[0].variants[0].stock = 10;
  return s;
}
test("Ray-Ban prices are $60 and other exact prices remain unconfirmed", () => {
  const products = initialState().products;
  assert.ok(products.length >= 16);
  for (const p of products)
    assert.equal(p.variants[0].price, p.brand === "Ray-Ban" ? 6000 : null);
});

test("multi-item quotes discount only the first three pairs", () => {
  const q = quoteLines(
    [
      { price: 6000, quantity: 2 },
      { price: 10000, quantity: 3 },
    ],
    3,
  );
  assert.equal(q.introQuantity, 3);
  assert.deepEqual(
    q.items.map((i) => i.introQuantity),
    [2, 1],
  );
  assert.equal(q.discount, 7000);
  assert.equal(q.total, 35000);
  assert.equal(quoteLines([{ price: 4500, quantity: 1 }], 3).total, 4500);
});
test("pending and paid orders hold a maximum of three introductory pairs", () => {
  const s = fixture();
  const orders = Array.from({ length: 4 }, () => createOrder(s, input(), true));
  assert.deepEqual(
    orders.map((o) => o.total),
    [5500, 5500, 5500, 6500],
  );
  assert.equal(introRemaining(s.orders, true), 0);
  verifyManualPayment(s, orders[0].id, "offer-test-paid", "admin");
  assert.equal(introRemaining(s.orders, true), 0);
  assert.equal(introRemaining(s.orders, false), 3);
});
test("cancelled and expired reservations return offer slots; paid pairs do not", () => {
  const s = fixture();
  const a = createOrder(s, input(), true),
    b = createOrder(s, input(), true),
    c = createOrder(s, input(), true);
  verifyManualPayment(s, a.id, "paid-first-pair", "admin");
  b.payment = "cancelled";
  assert.equal(introRemaining(s.orders, true), 1);
  releaseExpired(s, Date.parse(c.reservationUntil) + 1);
  assert.equal(introRemaining(s.orders, true), 2);
  assert.equal(a.payment, "paid");
});
test("idempotent retries do not consume additional offer allocation", () => {
  const s = fixture(),
    i = input();
  const a = createOrder(s, i, true),
    b = createOrder(s, i, true);
  assert.equal(a.id, b.id);
  assert.equal(introRemaining(s.orders, true), 2);
});
test("stale offer totals are rejected before inventory or allocations change", () => {
  const s = fixture();
  for (let i = 0; i < 3; i++) createOrder(s, input(), true);
  const stock = s.products[0].variants[0].stock;
  assert.throws(
    () => createOrder(s, { ...input(), expectedTotal: 5500 }, true),
    /Offer availability changed/,
  );
  assert.equal(s.orders.length, 3);
  assert.equal(s.products[0].variants[0].stock, stock);
});
test("version three migration preserves edited prices and operational controls", () => {
  const s = initialState();
  s.version = 1;
  s.products[0].variants[0].price = 6500;
  s.products[1].variants[0].price = null;
  s.settings.heroImage = "/media/campaign.webp";
  upgradeState(s);
  assert.equal(s.version, 3);
  assert.equal(s.products[0].variants[0].price, 6500);
  assert.equal(s.products[1].variants[0].price, null);
  assert.equal(s.settings.heroImage, "/media/street-rayban.webp");
  assert.equal(s.settings.launchApproved, false);
});

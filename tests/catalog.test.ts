import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { initialState, upgradeState } from "../lib/seed";
import { selectionEnquiry } from "../lib/enquiry";
import { createOrder } from "../lib/commerce";

test("real catalogue image and collection references resolve", () => {
  const s = initialState();
  for (const p of s.products)
    for (const v of p.variants)
      for (const image of v.images) {
        assert.ok(image.endsWith(".webp"));
        assert.ok(existsSync("public" + image), image);
      }
  for (const c of s.collections)
    for (const id of c.products) assert.ok(s.products.some((p) => p.id === id));
});
test("WhatsApp enquiry preserves brand, colour, quantity and unconfirmed price", () => {
  const s = initialState();
  const lines = s.products
    .slice(0, 2)
    .map((p) => ({
      productId: p.id,
      variantId: p.variants[0].id,
      quantity: 2,
    }));
  const url = new URL(selectionEnquiry(s.products, lines, s.settings.whatsapp));
  const text = url.searchParams.get("text")!;
  assert.equal(url.pathname, "/263780774428");
  assert.match(text, /2 × Ray-Ban Angular Square \/ Black \/ \$60.00/);
  assert.match(text, /Miu Miu.*please confirm price/);
  assert.match(text, /not a paid order or stock reservation/);
});
test("unknown inventory cannot be ordered even if a stock value is submitted", () => {
  const s = initialState(),
    p = s.products[0];
  p.verified = true;
  p.variants[0].stock = 50;
  assert.throws(
    () =>
      createOrder(
        s,
        {
          key: "test",
          userId: "test",
          name: "Test",
          email: "test@example.test",
          phone: "0000000",
          address: "Test address",
          delivery: "test",
          lines: [
            { productId: p.id, variantId: p.variants[0].id, quantity: 1 },
          ],
        },
        true,
      ),
    /not available/,
  );
});
test("catalogue migration preserves accounts and orders and archives old studies", () => {
  const s = initialState();
  s.version = 2;
  s.users.push({
    id: "owner",
    email: "owner@example.test",
    name: "Owner",
    password: "hashed",
    role: "admin",
    disabled: false,
  });
  s.products.push({
    ...structuredClone(s.products[0]),
    id: "rectangle",
    concept: true,
  });
  upgradeState(s);
  assert.equal(s.users[0].id, "owner");
  assert.equal(s.products.find((p) => p.id === "rectangle")?.archived, true);
  assert.equal(
    s.products.filter((p) => p.id === "ray-ban-angular-black").length,
    1,
  );
});

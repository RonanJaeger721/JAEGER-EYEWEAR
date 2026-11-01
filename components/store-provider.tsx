"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { X, Minus, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { selectionEnquiry } from "@/lib/enquiry";
import { quoteLines } from "@/lib/pricing";
import type { Product, Collection, Settings, Line } from "@/lib/types";
export type Catalog = {
  products: Product[];
  collections: Collection[];
  settings: Settings;
  storageReady: boolean;
  orderingOpen: boolean;
  introRemaining: number;
};
type Context = Catalog & {
  cart: Line[];
  add: (p: Product, v: string, q?: number) => void;
  setQuantity: (p: string, v: string, q: number) => void;
  clear: () => void;
  open: () => void;
  notify: (message: string) => void;
};
const Store = createContext<Context | null>(null);
export const useStore = () => useContext(Store)!;
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export async function api(path: string, body?: unknown) {
  const r = await fetch(
    `/api/store/${path}`,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}
export function Modal({
  title,
  onClose,
  children,
  drawer = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button,a,input,select")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]',
          ) || [],
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={drawer ? "modal drawer" : "modal"}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function StoreProvider({
  catalog,
  children,
}: {
  catalog: Catalog;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Line[]>([]),
    [ready, setReady] = useState(false),
    [opened, setOpened] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("jaeger-bag-v1") || "[]");
      if (Array.isArray(saved))
        setCart(
          saved.filter(
            (l) =>
              typeof l.productId === "string" &&
              typeof l.variantId === "string" &&
              Number.isInteger(l.quantity) &&
              l.quantity > 0 &&
              l.quantity <= 10 &&
              catalog.products.some(
                (p) =>
                  p.id === l.productId &&
                  p.variants.some((v) => v.id === l.variantId),
              ),
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("jaeger-bag-v1", JSON.stringify(cart));
  }, [cart, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const setQuantity = (p: string, v: string, q: number) =>
    setCart((c) =>
      c.flatMap((l) => {
        if (l.productId !== p || l.variantId !== v) return [l];
        const product = catalog.products.find((x) => x.id === p);
        const variant = product?.variants.find((x) => x.id === v);
        const max =
          product?.concept || product?.inventoryConfirmed === false
            ? 10
            : Math.min(10, variant?.stock || 0);
        return q > 0 && max > 0 ? [{ ...l, quantity: Math.min(max, q) }] : [];
      }),
    );
  const add = (p: Product, v: string, q = 1) => {
    const variant = p.variants.find((x) => x.id === v);
    if (!variant) return;
    const max =
      p.concept || p.inventoryConfirmed === false
        ? 10
        : Math.min(10, variant.stock);
    if (
      max === 0 ||
      (!p.concept &&
        p.inventoryConfirmed !== false &&
        (!p.verified || variant.price === null))
    ) {
      setToast("This frame is currently unavailable.");
      return;
    }
    setCart((c) => {
      const existing = c.find((l) => l.productId === p.id && l.variantId === v);
      return existing
        ? c.map((l) =>
            l === existing
              ? { ...l, quantity: Math.min(max, l.quantity + q) }
              : l,
          )
        : [...c, { productId: p.id, variantId: v, quantity: Math.min(max, q) }];
    });
    setOpened(true);
  };
  return (
    <Store.Provider
      value={{
        ...catalog,
        cart,
        add,
        setQuantity,
        clear: () => setCart([]),
        open: () => setOpened(true),
        notify: setToast,
      }}
    >
      {children}
      {opened && (
        <Modal
          title={`YOUR BAG (${cart.reduce((n, l) => n + l.quantity, 0)})`}
          onClose={() => setOpened(false)}
          drawer
        >
          <BagContents close={() => setOpened(false)} />
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </Store.Provider>
  );
}
export function BagContents({ close }: { close?: () => void }) {
  const { cart, products, setQuantity, introRemaining, settings } = useStore();
  const lines = cart.map((l) => ({
    l,
    p: products.find((p) => p.id === l.productId),
  }));
  const concepts = lines.some(
    ({ l, p }) =>
      !p ||
      p.concept ||
      p.inventoryConfirmed === false ||
      !p.verified ||
      p.variants.find((v) => v.id === l.variantId)?.price == null,
  );
  const quote = quoteLines(
    lines.map(({ l, p }) => ({
      price: p?.variants.find((v) => v.id === l.variantId)?.price || 0,
      quantity: l.quantity,
    })),
    introRemaining,
  );
  const total = quote.total;
  const hasPricedLine = lines.some(({ l, p }) =>
    p?.variants.some((v) => v.id === l.variantId && v.price !== null),
  );
  return (
    <div className="bag-content">
      {cart.length === 0 ? (
        <div className="empty">
          <span className="eyebrow">A FRESH PERSPECTIVE AWAITS</span>
          <h3>Your bag is empty.</h3>
          <Link className="button" href="/shop" onClick={close}>
            Explore eyewear <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {lines.map(({ l, p }) => {
            const v = p?.variants.find((v) => v.id === l.variantId);
            return (
              <div className="bag-line" key={l.variantId}>
                <img src={v?.images[0] || "/media/rectangle-0.svg"} alt="" />
                <div>
                  <Link href={`/product/${p?.slug || ""}`} onClick={close}>
                    {p?.name || "Unavailable frame"}
                  </Link>
                  <p>
                    {v?.color} {p?.concept ? "· Concept" : ""}
                  </p>
                  <span>
                    {v?.price != null
                      ? money(v.price)
                      : "Price to be confirmed"}
                  </span>
                  <div className="quantity">
                    <button
                      aria-label={`Reduce ${p?.name} quantity`}
                      onClick={() =>
                        setQuantity(l.productId, l.variantId, l.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{l.quantity}</span>
                    <button
                      aria-label={`Increase ${p?.name} quantity`}
                      disabled={l.quantity >= 10}
                      onClick={() =>
                        setQuantity(l.productId, l.variantId, l.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="text-button"
                      onClick={() => setQuantity(l.productId, l.variantId, 0)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {quote.discount > 0 && (
            <div className="bag-offer">
              <span>
                Launch offer · {quote.introQuantity}{" "}
                {quote.introQuantity === 1 ? "pair" : "pairs"} at $50 each
              </span>
              <strong>−{money(quote.discount)}</strong>
            </div>
          )}
          <div className="bag-total">
            <span>
              {hasPricedLine
                ? concepts
                  ? "Priced selection estimate"
                  : "Subtotal"
                : "Selection price"}
            </span>
            <strong>
              {hasPricedLine ? money(total) : "Confirm on enquiry"}
            </strong>
          </div>
          <p className="muted">
            {concepts
              ? "Exact prices and availability are confirmed on enquiry. The estimate includes only priced frames and any launch offer estimate. An enquiry does not reserve stock or the offer."
              : "Delivery calculated at the next step. Offer allocation is confirmed when your order is saved. All amounts in USD."}
          </p>
          {settings.whatsapp && concepts && (
            <a
              className="button full"
              href={selectionEnquiry(products, cart, settings.whatsapp)}
              target="_blank"
              rel="noreferrer"
            >
              Enquire on WhatsApp <ArrowUpRight size={17} />
            </a>
          )}
          <Link className="button full" href="/checkout" onClick={close}>
            Review bag & continue <ArrowUpRight size={17} />
          </Link>
          <Link className="underlink" href="/shop" onClick={close}>
            Continue exploring
          </Link>
        </>
      )}
    </div>
  );
}

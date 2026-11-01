"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Plus,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
} from "lucide-react";
import { useStore, money, Modal } from "./store-provider";
import { selectionEnquiry } from "@/lib/enquiry";
import type { Product } from "@/lib/types";
export function ProductCard({
  product: p,
  initialColor,
}: {
  product: Product;
  initialColor?: string;
}) {
  const [color, setColor] = useState(
      Math.max(
        0,
        p.variants.findIndex((v) => v.color === initialColor),
      ),
    ),
    [quick, setQuick] = useState(false);
  const v = p.variants[color] || p.variants[0];
  const { add, introRemaining } = useStore();
  return (
    <article className="product-card">
      <div className="product-visual">
        <Link href={`/product/${p.slug}?variant=${v.id}`}>
          <img
            src={v.images[0]}
            alt={`${p.name}, ${v.color}${p.concept ? ", concept illustration" : ""}`}
            loading="lazy"
          />
          {v.images[1] && (
            <img
              className="alternate"
              src={v.images[1]}
              alt="Alternate angle of the same frame"
              loading="lazy"
            />
          )}
        </Link>
        <span className="product-tag">
          {p.concept
            ? "DESIGN CONCEPT"
            : p.inventoryConfirmed === false
              ? "ENQUIRE TO ORDER"
              : p.newArrival
                ? "NEW ARRIVAL"
                : v.stock
                  ? "AVAILABLE"
                  : "SOLD OUT"}
        </span>
        <button className="quick-button" onClick={() => setQuick(true)}>
          Quick view <Plus size={15} />
        </button>
      </div>
      <p className="product-brand">{p.brand || "The JAEGER selection"}</p>
      <div className="product-meta">
        <Link href={`/product/${p.slug}`}>{p.name}</Link>
        <span>{v.price === null ? "Confirm price" : money(v.price)}</span>
      </div>
      {introRemaining > 0 && v.price !== null && v.price > 5000 && (
        <p className="product-offer">$50 launch offer · First 3 pairs</p>
      )}
      <div className="product-bottom">
        <span>{v.color}</span>
        <div className="swatches" aria-label={`${p.name} colours`}>
          {p.variants.map((variant, i) => (
            <button
              key={variant.id}
              title={variant.color}
              aria-label={`${p.name} in ${variant.color}`}
              aria-pressed={color === i}
              style={{ "--swatch": variant.hex } as React.CSSProperties}
              onClick={() => setColor(i)}
            />
          ))}
        </div>
      </div>
      <button className="card-add" onClick={() => add(p, v.id)}>
        {p.concept
          ? "Add concept to bag"
          : p.inventoryConfirmed === false
            ? "Save to bag"
            : "Add to bag"}{" "}
        <Plus size={14} />
      </button>
      {quick && (
        <Modal title={p.name.toUpperCase()} onClose={() => setQuick(false)}>
          <img
            className="quick-image"
            src={v.images[0]}
            alt={`${p.name} in ${v.color}`}
          />
          <p>{p.description}</p>
          <p className="muted">
            {p.concept
              ? "Concept illustration. Not available for purchase."
              : p.inventoryConfirmed === false
                ? "Availability confirmed on enquiry"
                : v.stock
                  ? `${v.stock} available`
                  : "Currently unavailable"}
          </p>
          <Link
            className="button full"
            href={`/product/${p.slug}?variant=${v.id}`}
            onClick={() => setQuick(false)}
          >
            Explore frame <ArrowUpRight size={17} />
          </Link>
        </Modal>
      )}
    </article>
  );
}

export function CollectionPage({
  category,
  title,
  collection,
  newOnly = false,
  search = false,
}: {
  category?: string;
  title: string;
  collection?: string;
  newOnly?: boolean;
  search?: boolean;
}) {
  const { products, collections } = useStore();
  const params = useSearchParams(),
    router = useRouter(),
    pathname = usePathname();
  const [filters, setFilters] = useState(false);
  const selected = collections.find((c) => c.id === collection);
  const set = (key: string, value: string) => {
    const q = new URLSearchParams(params);
    if (value) q.set(key, value);
    else q.delete(key);
    q.delete("page");
    router.push(pathname + "?" + q.toString(), { scroll: false });
  };
  let results = products.filter(
    (p) =>
      (!category || p.category === category) &&
      (!selected || selected.products.includes(p.id)) &&
      (!newOnly || p.newArrival),
  );
  const q = params.get("q")?.toLowerCase() || "";
  if (q)
    results = results.filter((p) =>
      (
        p.name +
        " " +
        p.shape +
        " " +
        p.variants.map((v) => v.color + " " + v.material).join(" ")
      )
        .toLowerCase()
        .includes(q),
    );
  for (const key of ["category", "shape", "brand"])
    if (params.get(key))
      results = results.filter(
        (p) => p[key as "category" | "shape" | "brand"] === params.get(key),
      );
  results = results.filter((p) =>
    p.variants.some(
      (v) =>
        (!params.get("color") || v.color === params.get("color")) &&
        (!params.get("lens") || v.lens === params.get("lens")) &&
        (!params.get("material") || v.material === params.get("material")) &&
        (!params.get("max") ||
          (v.price !== null && v.price <= Number(params.get("max")) * 100)) &&
        (!params.get("availability") ||
          (params.get("availability") === "enquiry"
            ? p.inventoryConfirmed === false
            : !p.concept &&
              p.verified &&
              p.inventoryConfirmed !== false &&
              v.stock > 0)),
    ),
  );
  const sort = params.get("sort") || "featured";
  results.sort((a, b) => {
    const price = (p: Product) =>
      Math.min(...p.variants.map((v) => v.price ?? Number.MAX_SAFE_INTEGER));
    if (sort === "price-low" || sort === "price-high") {
      const aUnknown = a.variants.every((v) => v.price === null);
      const bUnknown = b.variants.every((v) => v.price === null);
      if (aUnknown !== bUnknown) return Number(aUnknown) - Number(bUnknown);
    }
    return sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "price-low"
        ? price(a) - price(b)
        : sort === "price-high"
          ? price(b) - price(a)
          : sort === "newest"
            ? Number(b.newArrival) - Number(a.newArrival)
            : Number(b.featured) - Number(a.featured);
  });
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(results.length / 8) || 1,
      Number(params.get("page")) || 1,
    ),
  );
  const shown = results.slice((page - 1) * 8, page * 8);
  const active = [
    "category",
    "brand",
    "shape",
    "color",
    "lens",
    "material",
    "max",
    "availability",
  ].filter((k) => params.has(k));
  const filterFields = (
    <>
      <div className="filter-heading">
        <span>Refine your perspective</span>
        <button
          className="text-button"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          Reset all
        </button>
      </div>
      {[
        ["category", "Category", ["sunglasses", "optical"]],
        [
          "brand",
          "Brand",
          [...new Set(products.map((p) => p.brand || "Selected brands"))],
        ],
        ["shape", "Frame shape", [...new Set(products.map((p) => p.shape))]],
        [
          "color",
          "Frame colour",
          [...new Set(products.flatMap((p) => p.variants.map((v) => v.color)))],
        ],
        [
          "lens",
          "Lens colour",
          [...new Set(products.flatMap((p) => p.variants.map((v) => v.lens)))],
        ],
        [
          "material",
          "Material",
          [
            ...new Set(
              products.flatMap((p) => p.variants.map((v) => v.material)),
            ),
          ],
        ],
        ["availability", "Availability", ["available", "enquiry"]],
      ].map(([key, label, options]) => (
        <label className="filter-field" key={String(key)}>
          {label as string}
          <select
            value={params.get(key as string) || ""}
            onChange={(e) => set(key as string, e.target.value)}
          >
            <option value="">All</option>
            {(options as string[]).map((o) => (
              <option key={o} value={o}>
                {o.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="filter-field">
        Maximum price (USD)
        <input
          type="number"
          min="0"
          placeholder="No limit"
          value={params.get("max") || ""}
          onChange={(e) => set("max", e.target.value)}
        />
      </label>
      <p className="muted">
        A price filter includes only frames with a confirmed price. Other
        selected styles go up to $120; enquire for the exact price.
      </p>
    </>
  );
  return (
    <>
      <section className="collection-intro">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{search ? "Search" : title}</span>
        </div>
        <span className="eyebrow">COLLECTION 001 / A STUDY IN FORM</span>
        <h1>
          {search
            ? q
              ? `Results for “${params.get("q")}”`
              : "FIND YOUR FRAME."
            : title}
        </h1>
        <p>
          {selected?.description ||
            "An exploration of proportion, presence and personal expression. Find a silhouette that feels like you."}
        </p>
        {search && (
          <form className="inline-search" action="/search">
            <input
              aria-label="Search frames"
              name="q"
              defaultValue={q}
              placeholder="Search shapes, colours and frames"
            />
            <button className="button">Search</button>
          </form>
        )}
      </section>
      <div className="shop-toolbar">
        <button onClick={() => setFilters(true)}>
          <SlidersHorizontal size={17} /> Filters{" "}
          {active.length > 0 && `(${active.length})`}
        </button>
        <span>
          {results.length} {results.length === 1 ? "silhouette" : "silhouettes"}
        </span>
        <label>
          Sort by{" "}
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="shop-layout">
        <aside className="desktop-filters">{filterFields}</aside>
        <div>
          {active.length > 0 && (
            <div className="filter-chips">
              {active.map((k) => (
                <button key={k} onClick={() => set(k, "")}>
                  {params.get(k)} ×
                </button>
              ))}
            </div>
          )}
          {shown.length ? (
            <div className="product-grid">
              {shown.map((p) => (
                <ProductCard
                  key={p.id + params.get("color")}
                  product={p}
                  initialColor={params.get("color") || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>A fresh perspective.</h2>
              <p>No frames match these filters.</p>
              <button className="button" onClick={() => router.push(pathname)}>
                Clear filters
              </button>
            </div>
          )}
          {results.length > 8 && (
            <nav className="pagination" aria-label="Pagination">
              {Array.from({ length: Math.ceil(results.length / 8) }, (_, i) => (
                <Link
                  aria-current={page === i + 1 ? "page" : undefined}
                  key={i}
                  href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(params), page: String(i + 1) })}`}
                >
                  {i + 1}
                </Link>
              ))}
            </nav>
          )}
          <p className="catalog-note">
            Real photographs, original brand identities. Ray-Ban $60. Selected
            styles up to $120. The first three pairs sold are $50 each, subject
            to remaining allocation. Confirm exact model details and
            availability on enquiry.
          </p>
        </div>
      </div>
      {filters && (
        <Modal title="FILTER EYEWEAR" drawer onClose={() => setFilters(false)}>
          {filterFields}
          <button className="button full" onClick={() => setFilters(false)}>
            View {results.length} results
          </button>
        </Modal>
      )}
    </>
  );
}

export function ProductPage({ product: p }: { product: Product }) {
  const params = useSearchParams(),
    router = useRouter();
  const { add, introRemaining, settings } = useStore();
  const vi = p.variants.findIndex((v) => v.id === params.get("variant"));
  const v = p.variants[Math.max(0, vi)];
  const [image, setImage] = useState(0),
    [quantity, setQuantity] = useState(1),
    [zoom, setZoom] = useState(false),
    [start, setStart] = useState<number | null>(null);
  const next = (d: number) =>
    setImage((i) => (i + d + v.images.length) % v.images.length);
  const enquiry = p.inventoryConfirmed === false;
  const available =
    !p.concept && p.verified && !enquiry && v.price !== null && v.stock > 0;
  return (
    <>
      <div className="breadcrumbs product-crumb">
        <Link href="/shop">Eyewear</Link>
        <span>/</span>
        <Link href={`/${p.category === "optical" ? "optical" : "sunglasses"}`}>
          {p.category}
        </Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="pdp">
        <div className="gallery">
          <div
            className="gallery-main"
            onTouchStart={(e) => setStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (
                start !== null &&
                Math.abs(e.changedTouches[0].clientX - start) > 45
              )
                next(e.changedTouches[0].clientX < start ? 1 : -1);
              setStart(null);
            }}
          >
            <img
              src={v.images[image] || v.images[0]}
              alt={`${p.name} in ${v.color}${p.concept ? " — concept illustration" : ""}`}
            />
            <button
              className="zoom icon-button"
              aria-label="Zoom product image"
              onClick={() => setZoom(true)}
            >
              <ZoomIn size={21} />
            </button>
            {v.images.length > 1 && (
              <div className="gallery-arrows">
                <button
                  className="icon-button"
                  aria-label="Previous image"
                  onClick={() => next(-1)}
                >
                  <ArrowLeft size={20} />
                </button>
                <span>
                  {image + 1} / {v.images.length}
                </span>
                <button
                  className="icon-button"
                  aria-label="Next image"
                  onClick={() => next(1)}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="thumbnails">
            {v.images.map((src, i) => (
              <button
                key={i}
                aria-label={`View photograph ${i + 1}`}
                aria-pressed={i === image}
                onClick={() => setImage(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          {p.concept && (
            <p className="image-caption">
              Original silhouette illustration. Design concept, not a product
              photograph.
            </p>
          )}
        </div>
        <div className="pdp-info">
          <span className="eyebrow">
            COLLECTION 001 /{" "}
            {p.concept ? "PROPOSED SILHOUETTE" : p.category.toUpperCase()}
          </span>
          <h1>{p.name}</h1>
          <p className="pdp-description">{p.description}</p>
          <div className="pdp-price">
            {v.price === null ? "Price to be confirmed" : money(v.price)}
            <small>USD</small>
          </div>
          {introRemaining > 0 && v.price !== null && v.price > 5000 && (
            <div className="pdp-offer">
              <span className="eyebrow">
                THE FIRST PERSPECTIVE / LAUNCH OFFER
              </span>
              <strong>
                $50 <small>for the first 3 pairs sold</small>
              </strong>
              <p>
                Regular price {money(v.price)}. Offer allocation is confirmed
                when an eligible order is saved.
              </p>
            </div>
          )}
          <div className="pdp-color">
            <span>
              Frame colour — <strong>{v.color}</strong>
            </span>
            <div className="swatches">
              {p.variants.map((variant) => (
                <button
                  aria-label={`Select ${variant.color}`}
                  aria-pressed={v.id === variant.id}
                  title={variant.color}
                  key={variant.id}
                  style={{ "--swatch": variant.hex } as React.CSSProperties}
                  onClick={() => {
                    router.replace(`/product/${p.slug}?variant=${variant.id}`, {
                      scroll: false,
                    });
                    setImage(0);
                  }}
                />
              ))}
            </div>
          </div>
          <p className="availability">
            <span />
            {p.concept
              ? "Concept preview · Not for sale"
              : enquiry
                ? "Availability confirmed on enquiry"
                : available
                  ? `${v.stock} available`
                  : "Currently unavailable"}
          </p>
          <label className="qty-label">
            Quantity
            <input
              type="number"
              min="1"
              max={p.concept || enquiry ? 10 : Math.min(10, v.stock) || 1}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                )
              }
            />
          </label>
          <div className="pdp-action">
            <button
              className="button full"
              onClick={() => add(p, v.id, quantity)}
              disabled={!p.concept && !enquiry && !available}
            >
              {p.concept
                ? "Add concept to bag"
                : enquiry
                  ? "Save to bag"
                  : available
                    ? "Add to bag"
                    : "Unavailable"}
              <Plus size={18} />
            </button>
            {enquiry && settings.whatsapp && (
              <a
                className="button outline full"
                href={selectionEnquiry(
                  [p],
                  [{ productId: p.id, variantId: v.id, quantity }],
                  settings.whatsapp,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Enquire on WhatsApp <ArrowUpRight size={17} />
              </a>
            )}
            {available && (
              <Link
                className="button outline full"
                href="/checkout"
                onClick={() => add(p, v.id, quantity)}
              >
                Continue to manual order
              </Link>
            )}
          </div>
          {v.price === null && (
            <p className="muted">
              Selected styles go up to $120. Ask for the exact price of this
              frame.
            </p>
          )}
          {p.concept && (
            <p className="muted">
              Explore it in your bag. Purchasing opens only after the real
              product, imagery and commercial details are approved.
            </p>
          )}
          <div className="pdp-details">
            <details open>
              <summary>
                The details <Plus size={16} />
              </summary>
              <p>
                {p.concept
                  ? "This proposed silhouette explores a direction for JAEGER EYEWEAR. It is not confirmed inventory."
                  : p.description}
              </p>
              <p>
                {v.material === "Unconfirmed"
                  ? "Material and lens information will be added after supplier verification."
                  : `Frame material: ${v.material}. Lens: ${v.lens}.`}
              </p>
              {v.uv && <p>{v.uv}</p>}
            </details>
            <details>
              <summary>
                Fit & measurements <Plus size={16} />
              </summary>
              {v.measurements ? (
                <p>
                  Lens width: {v.measurements.lens} mm
                  <br />
                  Bridge width: {v.measurements.bridge} mm
                  <br />
                  Temple length: {v.measurements.temple} mm
                </p>
              ) : (
                <p>
                  Verified dimensions are not yet available.{" "}
                  <Link className="underlink" href="/size-guide">
                    Understand frame sizing
                  </Link>
                </p>
              )}
            </details>
            <details>
              <summary>
                Shipping & returns <Plus size={16} />
              </summary>
              <p>
                Delivery and returns will be confirmed before commercial
                ordering opens.
              </p>
              <Link className="underlink" href="/shipping-returns">
                Read current information
              </Link>
            </details>
          </div>
        </div>
      </section>
      <section className="section related">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ANOTHER POINT OF VIEW</span>
            <h2>Keep exploring.</h2>
          </div>
          <Link className="underlink" href="/shop">
            All eyewear <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid four">
          {useStore()
            .products.filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
      {zoom && (
        <Modal title={`${p.name} — ${v.color}`} onClose={() => setZoom(false)}>
          <div className="zoom-image">
            <img
              src={v.images[image] || v.images[0]}
              alt={`${p.name} enlarged`}
            />
          </div>
          <p className="muted">
            {p.concept
              ? "Concept illustration."
              : "Use the gallery to explore available product photographs."}
          </p>
        </Modal>
      )}
    </>
  );
}

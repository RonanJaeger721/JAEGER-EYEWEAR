"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Pause,
  Play,
} from "lucide-react";
import { useStore, money } from "./store-provider";
import { ProductCard } from "./catalog";

const photographs = [
  {
    src: "/media/street-rayban.webp",
    name: "Ray-Ban",
    caption: "THE EVERYDAY STATEMENT",
    position: "50% 65%",
    product: "ray-ban-angular-black",
    href: "/product/ray-ban-angular-black",
  },
  {
    src: "/media/ronan-boutique.webp",
    name: "Ronan",
    caption: "A PERSONAL PERSPECTIVE",
    position: "50% 35%",
    product: "",
    href: "/our-story",
  },
  {
    src: "/media/street-miumiu.webp",
    name: "Miu Miu",
    caption: "A DIFFERENT KIND OF CLASSIC",
    position: "50% 42%",
    product: "miu-miu-metal-rectangle",
    href: "/product/miu-miu-metal-rectangle",
  },
  {
    src: "/media/street-dior.webp",
    name: "Dior",
    caption: "CHARACTER IN EVERY DETAIL",
    position: "50% 40%",
    product: "dior-square-as-worn",
    href: "/product/dior-square-as-worn",
  },
];

export function CampaignHero() {
  const { products, settings } = useStore();
  const [active, setActive] = useState(0);
  const photos = photographs
    .filter(
      (photo) => !photo.product || products.some((p) => p.id === photo.product),
    )
    .map((photo) =>
      photo.product === "ray-ban-angular-black"
        ? { ...photo, src: settings.heroImage }
        : photo,
    );
  const selectedIndex = Math.min(active, photos.length - 1);
  const photo = photos[selectedIndex];
  const frame = products.find((p) => p.id === photo.product);
  return (
    <section className="campaign-hero" aria-label="JAEGER eyewear campaign">
      <div className="campaign-intro">
        <div className="campaign-kicker">
          <span className="edition-dot" /> THE JAEGER EDIT / 001
        </div>
        <h1>
          {settings.heroTitle.split("\n").map((line, i) => (
            <span key={i} className={i === 0 ? "hero-title-first" : undefined}>
              {line}
            </span>
          ))}
        </h1>
        <p>{settings.heroCopy}</p>
        <div className="campaign-actions">
          <Link className="button" href="/shop">
            Find your frame <ArrowUpRight size={19} />
          </Link>
          <a className="campaign-look-link" href="#shop-the-look">
            See it. Wear it. <ArrowDown size={17} />
          </a>
        </div>
        <div className="campaign-note">
          <span>CURATED FOR INDIVIDUALITY.</span>
          <span>WORN IN REAL LIFE.</span>
        </div>
      </div>
      <div className="campaign-photo">
        {photos.map((p, i) => (
          <img
            key={p.src}
            src={p.src}
            alt={`${p.name} / ${p.caption}`}
            aria-hidden={i !== selectedIndex}
            className={i === selectedIndex ? "is-active" : ""}
            style={{ objectPosition: p.position }}
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="campaign-photo-top">
          <span>AN INDIVIDUAL POINT OF VIEW</span>
          <span>
            0{selectedIndex + 1} / 0{photos.length}
          </span>
        </div>
        <span className="photo-edge-caption">{photo.caption}</span>
        <div
          className="campaign-photo-switch"
          aria-label="Choose your campaign perspective"
        >
          {photos.map((p, i) => (
            <button
              key={p.name}
              aria-label={`Show ${p.name} campaign`}
              aria-pressed={selectedIndex === i}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {p.name}
            </button>
          ))}
        </div>
        <Link href={photo.href} className="hero-frame-link">
          {frame && <img src={frame.variants[0].images[0]} alt="" />}
          <span>
            <small>
              {frame ? "SHOP THIS PERSPECTIVE" : "BEHIND THE BRAND"}
            </small>
            <strong>{frame?.name || "Ronan’s story"}</strong>
            <em>
              {frame?.variants[0].price != null
                ? money(frame.variants[0].price)
                : frame
                  ? "Discover the frame"
                  : "Ronan & Michael Jaeger"}
            </em>
          </span>
          <ArrowUpRight size={22} />
        </Link>
      </div>
      <div className="hero-running-line" aria-hidden="true">
        <span>STYLE IS PERSONAL.</span>
        <span>A DIFFERENT PERSPECTIVE.</span>
        <span>JAEGER EYEWEAR.</span>
        <ArrowDown size={17} />
      </div>
    </section>
  );
}

export function BrandStrip() {
  const { products } = useStore();
  const [paused, setPaused] = useState(false);
  const brands = [
    ...new Set(
      products
        .map((p) => p.brand)
        .filter((b): b is string => !!b && b !== "Selected brands"),
    ),
  ];
  return (
    <nav
      className={`brand-ribbon ${paused ? "is-paused" : ""}`}
      aria-label="Explore original eyewear brands"
    >
      <div className="brand-ribbon-label">
        ORIGINAL BRANDS.
        <br />
        YOUR PERSPECTIVE.
        <button
          className="brand-motion-toggle"
          aria-label={paused ? "Play brand ribbon" : "Pause brand ribbon"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          <span>{paused ? "Play" : "Pause"}</span>
        </button>
      </div>
      <div className="brand-ribbon-window">
        <div className="brand-ribbon-track">
          <div>
            {brands.map((b) => (
              <Link key={b} href={`/shop?brand=${encodeURIComponent(b)}`}>
                {b}
                <span>↗</span>
              </Link>
            ))}
          </div>
          <div aria-hidden="true">
            {brands.map((b) => (
              <span key={b}>
                {b}
                <i>↗</i>
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

const edits = [
  { id: "as-worn", label: "As worn", href: "/collections/as-worn" },
  { id: "ray-ban", label: "Ray-Ban / $60", href: "/collections/ray-ban" },
  {
    id: "statement",
    label: "The statement edit",
    href: "/collections/statement",
  },
  { id: "optical", label: "Optical", href: "/optical" },
];
export function EditShop() {
  const { products, collections } = useStore();
  const [edit, setEdit] = useState(0);
  const availableEdits = edits.filter(
    (item) =>
      item.id === "optical" || collections.some((c) => c.id === item.id),
  );
  const selectedIndex = Math.min(edit, availableEdits.length - 1);
  const selected = availableEdits[selectedIndex],
    collection = collections.find((c) => c.id === selected.id);
  const list = products.filter((p) =>
    selected.id === "optical"
      ? p.category === "optical"
      : collection?.products.includes(p.id),
  );
  return (
    <section className="section frame-edit reveal-block" id="frame-edit">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND YOUR NEXT EVERYDAY PAIR</span>
          <h2>
            The frame edit<span>.</span>
          </h2>
        </div>
        <Link href="/shop" className="underlink">
          Explore all eyewear <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="edit-shop-toolbar">
        <div className="edit-shop-tabs" aria-label="Choose an eyewear edit">
          {availableEdits.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setEdit(i)}
              aria-pressed={selectedIndex === i}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span aria-live="polite">{list.length} perspectives to explore</span>
      </div>
      <div className="product-grid four edit-results" key={selected.id}>
        {list.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="edit-shop-footer">
        <p>Original brands. Selected with character. Styled by you.</p>
        <Link className="underlink" href={selected.href}>
          View this edit <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}

const lookFrames = [
  {
    id: "ray-ban-angular-black",
    x: 84,
    y: 39,
    label: "Ray-Ban angular frame worn on the right",
  },
  {
    id: "miu-miu-metal-rectangle",
    x: 25,
    y: 21,
    label: "Miu Miu frame worn at the upper left",
  },
  {
    id: "dior-square-as-worn",
    x: 20,
    y: 61,
    label: "Dior frame worn at the lower left",
  },
  {
    id: "metal-rectangle-as-worn",
    x: 51,
    y: 64,
    label: "Metal rectangle worn at the centre",
  },
];
export function ShopTheLook() {
  const { products, add } = useStore();
  const [active, setActive] = useState(0);
  const frames = lookFrames.filter((item) =>
    products.some((p) => p.id === item.id),
  );
  const selectedIndex = Math.min(active, frames.length - 1);
  const item = frames[selectedIndex],
    p = products.find((p) => p.id === item?.id);
  if (!p) return null;
  const v = p.variants[0];
  return (
    <section className="shop-the-look reveal-block" id="shop-the-look">
      <div className="look-photograph">
        <img
          src="/media/friends-lookbook.webp"
          alt="Four friends wearing the four frames featured in the as-worn edit"
          loading="lazy"
        />
        <span className="look-photo-label">
          THE AS-WORN EDIT / REAL LIFE, REAL STYLE.
        </span>
        {frames.map((item, i) => (
          <button
            key={item.id}
            className="look-hotspot"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-label={`Explore ${item.label}`}
            aria-pressed={selectedIndex === i}
            onClick={() => setActive(i)}
          >
            <span>0{i + 1}</span>
          </button>
        ))}
        <span className="look-photo-instruction">
          <Plus size={15} /> TAP A FRAME. FIND YOUR PAIR.
        </span>
      </div>
      <div className="look-content">
        <span className="eyebrow">GOOD FRAMES. BETTER COMPANY.</span>
        <h2>
          See it.
          <br />
          <span>Make it yours.</span>
        </h2>
        <p>
          Four friends. Four points of view.
          <br />
          Meet the frames behind the photograph.
        </p>
        <div className="look-product" key={p.id} aria-live="polite">
          <Link href={`/product/${p.slug}`} className="look-product-image">
            <img
              src={v.images[0]}
              alt={`${p.name} in ${v.color}`}
              loading="lazy"
            />
            <ArrowUpRight size={24} />
          </Link>
          <div className="look-product-heading">
            <div>
              <span className="eyebrow">{p.brand}</span>
              <h3>{p.name}</h3>
            </div>
            <strong>
              {v.price === null ? "Confirm price" : money(v.price)}
            </strong>
          </div>
          <div className="look-product-actions">
            <Link href={`/product/${p.slug}`} className="underlink">
              Explore this frame <ArrowUpRight size={17} />
            </Link>
            <button className="look-save" onClick={() => add(p, v.id)}>
              Save to bag <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="look-controls">
          <button
            className="icon-button"
            aria-label="Previous look"
            onClick={() =>
              setActive((i) => (i + frames.length - 1) % frames.length)
            }
          >
            <ArrowLeft size={19} />
          </button>
          <span>
            0{selectedIndex + 1} <i>/ 0{frames.length}</i>
          </span>
          <button
            className="icon-button"
            aria-label="Next look"
            onClick={() => setActive((i) => (i + 1) % frames.length)}
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function StorefrontReveals() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.closest(".modern-store");
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.querySelectorAll(".reveal-block").forEach((element) => {
      element.classList.add("will-reveal");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} hidden />;
}

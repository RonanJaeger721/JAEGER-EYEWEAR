"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useStore } from "./store-provider";
import { ProductCard } from "./catalog";
import { Newsletter } from "./shell";
export function PerspectiveExplorer() {
  const { products } = useStore();
  const [index, setIndex] = useState(0);
  const p = products[index] || products[0];
  if (!p) return null;
  return (
    <section className="perspective" id="perspective">
      <div className="perspective-top">
        <span className="eyebrow">THE SILHOUETTE STUDY</span>
        <span className="eyebrow">
          00{index + 1} / 00{products.length}
        </span>
      </div>
      <div className="perspective-layout">
        <div className="perspective-copy">
          <h2>
            A frame changes
            <br />
            everything.
          </h2>
          <p>
            Explore the line.
            <br />
            Find your perspective.
          </p>
          <div className="shape-tabs" aria-label="Choose a silhouette">
            {products.map((p, i) => (
              <button
                key={p.id}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <span>0{i + 1}</span>
                {p.shape.replace("-", " ")}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="perspective-stage">
          <span className="stage-type" aria-hidden="true">
            {p.shape.replace("-", " ")}
          </span>
          <img
            key={p.id}
            src={p.variants[0].images[0]}
            alt={`${p.name} original concept illustration`}
          />
          <div className="stage-caption">
            <div>
              <span className="eyebrow">DESIGN CONCEPT</span>
              <h3>{p.name}</h3>
            </div>
            <Link
              className="circle-link"
              href={`/product/${p.slug}`}
              aria-label={`Explore ${p.name}`}
            >
              <ArrowUpRight size={23} />
            </Link>
          </div>
          <div className="stage-controls">
            <button
              className="icon-button"
              aria-label="Previous silhouette"
              onClick={() =>
                setIndex((index + products.length - 1) % products.length)
              }
            >
              <ArrowLeft size={20} />
            </button>
            <span>CHANGE YOUR POINT OF VIEW</span>
            <button
              className="icon-button"
              aria-label="Next silhouette"
              onClick={() => setIndex((index + 1) % products.length)}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Home() {
  const { products, settings } = useStore();
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={settings.heroImage}
          alt="Original JAEGER campaign concept based on founder Ronan's portrait"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-top">
          <span>JAEGER EYEWEAR</span>
          <span>FIRST EDITION / 001</span>
        </div>
        <div className="hero-copy">
          <span className="eyebrow">AN INDIVIDUAL POINT OF VIEW</span>
          <h1>
            {settings.heroTitle.split("\n").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </h1>
          <p>{settings.heroCopy}</p>
          <Link href="/shop" className="button light">
            Explore eyewear <ArrowUpRight size={19} />
          </Link>
          <Link href="/collections" className="hero-secondary">
            View collection 001 <span>↗</span>
          </Link>
        </div>
        <div className="hero-bottom">
          <a href="#perspective">
            SCROLL TO DISCOVER <ArrowDown size={14} />
          </a>
          <span>CAMPAIGN CONCEPT · PRE-LAUNCH</span>
        </div>
      </section>
      <div className="manifesto-strip">
        <span>A DIFFERENT PERSPECTIVE.</span>
        <p>
          Considered silhouettes.
          <br />
          Uncompromising individuality.
        </p>
        <span className="strip-index">J / 001</span>
      </div>
      <PerspectiveExplorer />
      <section className="section first-look">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION TAKES SHAPE</span>
            <h2>The first perspective.</h2>
          </div>
          <Link className="underlink" href="/new-arrivals">
            Explore new arrivals <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid four">
          {products
            .filter((p) => p.featured)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
        <p className="catalog-note">
          A first look at proposed silhouettes. Concept illustrations, with
          pricing and availability to be confirmed.
        </p>
      </section>
      <section className="edits">
        <Link href="/sunglasses" className="edit-tile edit-sun">
          <div className="edit-image">
            <img
              src="/media/rectangle-0.svg"
              alt="Original rectangular sunglasses concept"
              loading="lazy"
            />
          </div>
          <span className="edit-number">01 / SUN</span>
          <div className="edit-title">
            <div>
              <h2>SUNGLASSES</h2>
              <p>Presence, in every light.</p>
            </div>
            <ArrowUpRight size={28} />
          </div>
        </Link>
        <Link href="/optical" className="edit-tile edit-optical">
          <div className="edit-image">
            <img
              src="/media/cat-eye-0.svg"
              alt="Original optical frame concept"
              loading="lazy"
            />
          </div>
          <span className="edit-number">02 / OPTICAL</span>
          <div className="edit-title">
            <div>
              <h2>OPTICAL FRAMES</h2>
              <p>A considered point of view.</p>
            </div>
            <ArrowUpRight size={28} />
          </div>
        </Link>
        <Link href="/shop?shape=statement" className="edit-tile edit-statement">
          <div className="edit-image">
            <img
              src="/media/statement-1.svg"
              alt="Original sculptural statement frame concept"
              loading="lazy"
            />
          </div>
          <span className="edit-number">03 / EXPRESSION</span>
          <div className="edit-title">
            <div>
              <h2>THE STATEMENT EDIT</h2>
              <p>For the way you see yourself.</p>
            </div>
            <ArrowUpRight size={28} />
          </div>
        </Link>
      </section>
      <section className="campaign">
        <img
          src={settings.heroImage}
          alt="JAEGER campaign concept portrait"
          loading="lazy"
        />
        <div>
          <span className="eyebrow">THE JAEGER ATTITUDE</span>
          <h2>
            FRAME YOUR
            <br />
            PRESENCE.
          </h2>
          <p>Distinctive silhouettes. Everyday confidence.</p>
          <Link className="underlink" href="/collections">
            Discover collection 001 <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="campaign-credit">ORIGINAL CAMPAIGN CONCEPT</span>
      </section>
      <section className="story-preview section">
        <div className="story-image">
          <img
            src={settings.campaignImage}
            alt="Ronan, JAEGER founder, exploring eyewear in a showroom"
            loading="lazy"
          />
          <span>RONAN / THE FOUNDER’S PERSPECTIVE</span>
        </div>
        <div>
          <span className="eyebrow">THE JAEGER PERSPECTIVE</span>
          <h2>
            DESIGNED FOR
            <br />
            INDIVIDUALITY.
          </h2>
          <p>
            JAEGER explores the intersection of modern design, personal
            expression and everyday style. Our vision is to create eyewear that
            feels considered, distinctive and effortlessly wearable.
          </p>
          <Link className="underlink" href="/our-story">
            A closer look at JAEGER <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="packaging section">
        <div>
          <span className="eyebrow">THE COMPLETE PERSPECTIVE</span>
          <h2>
            Considered.
            <br />
            Down to the case.
          </h2>
          <p>
            A proposed packaging direction: a matte black protective case, a
            quiet wordmark and the original JAEGER crown. Nothing more than it
            needs.
          </p>
          <small>PACKAGING DESIGN STUDY / SUBJECT TO APPROVAL</small>
        </div>
        <div
          className="packaging-study"
          aria-label="Illustrative JAEGER packaging design concept"
        >
          <div className="package-box">
            <span>
              JAEGER<small>EYEWEAR</small>
            </span>
          </div>
          <div className="package-case">
            <img src="/media/crown.png" alt="Original crown on proposed case" />
            <span>JAEGER</span>
          </div>
          <div className="package-card">
            A DIFFERENT
            <br />
            PERSPECTIVE.<small>JAEGER EYEWEAR</small>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}

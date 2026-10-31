"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useStore } from "./store-provider";
import { ProductCard } from "./catalog";
import { Newsletter } from "./shell";
export function PerspectiveExplorer() {
  const { products: allProducts } = useStore();
  const products = allProducts.filter((p) => p.featured).slice(0, 5);
  const [index, setIndex] = useState(0);
  const p = products[index] || products[0];
  if (!p) return null;
  return (
    <section className="perspective" id="perspective">
      <div className="perspective-top">
        <span className="eyebrow">THE CURATED FRAME EDIT</span>
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
                {p.brand || p.shape.replace("-", " ")}
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
            alt={`${p.name} original brand photograph`}
          />
          <div className="stage-caption">
            <div>
              <span className="eyebrow">THE CURATED SELECTION</span>
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
export function LaunchOffer() {
  const { introRemaining } = useStore();
  return (
    <section
      className="launch-offer"
      aria-label="Collection pricing and launch offer"
    >
      <div>
        <span className="eyebrow">THE COLLECTION</span>
        <strong>$60–$120</strong>
        <span>Ray-Ban $60. Selected styles up to $120.</span>
      </div>
      <span className="launch-divider" aria-hidden="true" />
      <div>
        <span className="eyebrow">
          {introRemaining > 0
            ? "THE FIRST PERSPECTIVE / LAUNCH OFFER"
            : "THE FIRST PERSPECTIVE"}
        </span>
        <strong>
          {introRemaining > 0 ? "$50" : "A different point of view."}
        </strong>
        <span>
          {introRemaining > 0
            ? "First 3 pairs sold. $50 each."
            : "The introductory allocation is fully reserved."}
        </span>
      </div>
      <Link className="underlink" href="/shop">
        Find your frame <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
export function Home() {
  const { products, settings } = useStore();
  const [heroIndex, setHeroIndex] = useState(0);
  const heroPhotos = [
    { src: settings.heroImage, caption: "THE AS-WORN EDIT / RAY-BAN" },
    {
      src: "/media/ronan-boutique.webp",
      caption: "RONAN JAEGER / A PERSONAL PERSPECTIVE",
    },
    { src: "/media/street-miumiu.webp", caption: "THE AS-WORN EDIT / MIU MIU" },
    { src: "/media/street-dior.webp", caption: "THE AS-WORN EDIT / DIOR" },
  ];
  const hero = heroPhotos[heroIndex];
  return (
    <>
      <section className="hero hero-portrait">
        <img
          className="hero-image"
          key={hero.src}
          src={hero.src}
          srcSet={
            hero.src === "/media/ronan-boutique.webp"
              ? "/media/ronan-boutique-mobile.webp 700w, /media/ronan-boutique.webp 1122w"
              : undefined
          }
          sizes="(max-width: 800px) 100vw, 54vw"
          alt={hero.caption}
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
          <span>{hero.caption}</span>
        </div>
        <div
          className="hero-photo-nav"
          aria-label="Choose a campaign photograph"
        >
          {heroPhotos.map((photo, i) => (
            <button
              key={photo.src}
              aria-pressed={heroIndex === i}
              aria-label={`Campaign photograph ${i + 1}: ${photo.caption}`}
              onClick={() => setHeroIndex(i)}
            >
              0{i + 1}
            </button>
          ))}
        </div>
      </section>
      <LaunchOffer />
      <PerspectiveExplorer />
      <section className="section first-look">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ORIGINAL EYEWEAR / MULTIPLE ORIGINAL BRANDS
            </span>
            <h2>The as-worn selection.</h2>
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
          Original brands. Individual perspectives. Ray-Ban $60. Selected styles
          up to $120; exact price and availability confirmed on enquiry.
        </p>
      </section>
      <section className="edits">
        <Link href="/sunglasses" className="edit-tile edit-sun">
          <div className="edit-image">
            <img
              src="/media/street-rayban-front.webp"
              alt="Ray-Ban sunglasses worn in the supplied street portrait"
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
              src="/media/versace-optical-black.webp"
              alt="Versace optical frames in the supplied shelf photograph"
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
        <Link
          href="/collections/statement"
          className="edit-tile edit-statement"
        >
          <div className="edit-image">
            <img
              src="/media/prada-blue-shield.webp"
              alt="Prada blue shield photographed on the showroom shelf"
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
          src="/media/friends-edit.webp"
          alt="Four friends wearing their selected original-brand eyewear"
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
        <span className="campaign-credit">
          ORIGINAL BRANDS / INDIVIDUAL PERSPECTIVES
        </span>
      </section>
      <section className="story-preview section">
        <div className="story-image">
          <img
            src={settings.campaignImage}
            alt="Two friends wearing their selected frames in a supplied street photograph"
            loading="lazy"
          />
          <span>STYLE IS PERSONAL / THE JAEGER PERSPECTIVE</span>
        </div>
        <div>
          <span className="eyebrow">THE JAEGER PERSPECTIVE</span>
          <h2>
            DESIGNED FOR
            <br />
            INDIVIDUALITY.
          </h2>
          <p>
            “Instead of constantly searching for my style, why not create a
            place that reflects it?”
          </p>
          <p>
            Founded by brothers Ronan and Michael Jaeger, JAEGER EYEWEAR brings
            our passion for style, creativity and individuality into something
            more personal.
          </p>
          <p className="founder-signature">
            Ronan &amp; Michael Jaeger — Co-founders
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

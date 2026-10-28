"use client";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { useStore, BagContents } from "./store-provider";
import { PerspectiveExplorer } from "./home";
export function InformationPage({ page }: { page: string }) {
  const { settings, collections } = useStore();
  if (page === "cart")
    return (
      <section className="section cart-page">
        <span className="eyebrow">YOUR PERSPECTIVE</span>
        <h1>Your bag.</h1>
        <BagContents />
      </section>
    );
  if (page === "collections")
    return (
      <>
        <section className="collection-intro">
          <span className="eyebrow">THE FIRST EDITION</span>
          <h1>COLLECTION 001.</h1>
          <p>
            Five studies in form. One individual point of view.
            <br />
            Explore the proposed silhouettes of JAEGER EYEWEAR.
          </p>
        </section>
        <div className="collection-list">
          {collections.map((c) => (
            <Link href={`/collections/${c.id}`} key={c.id}>
              <span>{c.name}</span>
              <img src={c.image} alt={`${c.name} concept illustration`} />
              <p>{c.description}</p>
              <ArrowUpRight size={24} />
            </Link>
          ))}
        </div>
      </>
    );
  if (page === "our-story")
    return (
      <>
        <section className="story-page section">
          <div>
            <span className="eyebrow">THE JAEGER PERSPECTIVE</span>
            <h1>
              DESIGNED FOR
              <br />
              INDIVIDUALITY.
            </h1>
            <p className="large-copy">
              A frame is a small thing.
              <br />A point of view is everything.
            </p>
            <p>
              JAEGER explores the intersection of modern design, personal
              expression and everyday style. Our vision is to create eyewear
              that feels considered, distinctive and effortlessly wearable.
            </p>
            <p>
              Founded by Ronan, this proposed eyewear division brings a personal
              perspective to the JAEGER fashion world. Collection 001 begins
              with an exploration of silhouette: the rectangle, the square, the
              aviator, the cat eye and the statement.
            </p>
            <p className="muted">
              JAEGER remains a provisional commercial name pending trademark
              clearance. The first collection is in development.
            </p>
            <Link className="underlink" href="/collections">
              Explore the first collection <ArrowUpRight size={17} />
            </Link>
          </div>
          <figure>
            <img
              src={settings.campaignImage}
              alt="Founder Ronan exploring eyewear in a showroom"
            />
            <figcaption>
              RONAN / A PERSONAL PERSPECTIVE
              <br />
              Showroom visit; frames pictured are third-party design references.
            </figcaption>
          </figure>
        </section>
        <PerspectiveExplorer />
      </>
    );
  if (page === "faq")
    return (
      <section className="section document-page">
        <span className="eyebrow">A LITTLE CLARITY</span>
        <h1>
          Your questions.
          <br />
          Considered answers.
        </h1>
        <div className="faq-list">
          {settings.faqs.map((f, i) => (
            <details key={i}>
              <summary>
                {f.question}
                <Plus size={18} />
              </summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
        <Link className="underlink" href="/contact">
          Still have a question? Get in touch <ArrowUpRight size={17} />
        </Link>
      </section>
    );
  if (page === "size-guide")
    return (
      <section className="section document-page">
        <span className="eyebrow">FIND YOUR FIT</span>
        <h1>
          A guide to
          <br />
          frame proportions.
        </h1>
        <img
          className="size-frame"
          src="/media/rectangle-0.svg"
          alt="Concept rectangle frame illustration"
        />
        <p>
          Three measurements commonly describe a frame. Compare verified
          dimensions with a pair you already find comfortable. No dimensions are
          claimed for our concept silhouettes.
        </p>
        <div className="measurement-list">
          <div>
            <span>01</span>
            <h2>Lens width</h2>
            <p>The horizontal width of one lens, in millimetres.</p>
          </div>
          <div>
            <span>02</span>
            <h2>Bridge width</h2>
            <p>The distance between the lenses at the bridge.</p>
          </div>
          <div>
            <span>03</span>
            <h2>Temple length</h2>
            <p>The length of the arm, from hinge to tip.</p>
          </div>
        </div>
        <p>
          Fit also depends on the frame’s shape and construction.
          Supplier-confirmed dimensions will appear on individual product pages
          when available.
        </p>
        <Link className="underlink" href="/contact">
          Ask about fit <ArrowUpRight size={17} />
        </Link>
      </section>
    );
  const title =
    page === "shipping-returns"
      ? "Shipping & returns."
      : page === "privacy"
        ? "Your privacy."
        : "Terms & conditions.";
  return (
    <section className="section document-page">
      <span className="eyebrow">JAEGER / PRE-LAUNCH INFORMATION</span>
      <h1>{title}</h1>
      {page === "shipping-returns" ? (
        <>
          <h2>Shipping</h2>
          <p className="policy-text">{settings.shipping}</p>
          <h2>Returns</h2>
          <p className="policy-text">{settings.returns}</p>
        </>
      ) : (
        <p className="policy-text">
          {page === "privacy" ? settings.privacy : settings.terms}
        </p>
      )}
      <div className="notice">
        <p>
          Current status: pre-launch. The catalogue contains clearly labelled
          concept silhouettes. Commercial launch remains subject to brand and
          operational approval.
        </p>
      </div>
      <Link href="/contact" className="underlink">
        Contact JAEGER <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}

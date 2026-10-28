import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section empty">
      <span className="eyebrow">404 / OUT OF FRAME</span>
      <h1>A different direction.</h1>
      <p>This page could not be found.</p>
      <Link className="button" href="/shop">
        Explore eyewear ↗
      </Link>
    </section>
  );
}

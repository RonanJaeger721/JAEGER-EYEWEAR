import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Home } from "@/components/home";
import { CollectionPage, ProductPage } from "@/components/catalog";
import {
  AccountPage,
  CheckoutPage,
  ContactPage,
} from "@/components/customer-pages";
import { InformationPage } from "@/components/information";
import { readState } from "@/lib/db";
type Props = { params: Promise<{ slug?: string[] }> };
const titles: Record<string, string> = {
  shop: "All eyewear",
  sunglasses: "Sunglasses",
  optical: "Optical frames",
  "new-arrivals": "New arrivals",
  collections: "Collection 001",
  search: "Search eyewear",
  cart: "Your bag",
  checkout: "Review your bag",
  account: "Your account",
  orders: "Your orders",
  "our-story": "Our story",
  contact: "Contact",
  faq: "Your questions",
  "shipping-returns": "Shipping & returns",
  "size-guide": "Size guide",
  privacy: "Privacy",
  terms: "Terms & conditions",
};
export async function generateMetadata({ params }: Props) {
  const { slug = [] } = await params;
  if (slug[0] === "product") {
    const p = (await readState()).products.find(
      (p) => p.slug === slug[1] && !p.archived,
    );
    return { title: p?.name || "Frame not found", description: p?.description };
  }
  return slug.length ? { title: titles[slug[0]] || "JAEGER EYEWEAR" } : {};
}
export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const [page, item] = slug;
  let content: React.ReactNode;
  if (!page) content = <Home />;
  else if (page === "product" && slug.length === 2) {
    const p = (await readState()).products.find(
      (p) => p.slug === item && !p.archived,
    );
    if (!p) notFound();
    content = (
      <>
        <ProductPage product={p} />
        {p.verified &&
          !p.concept &&
          p.variants.every((v) => v.price !== null) && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Product",
                  name: p.name,
                  description: p.description,
                  brand: { "@type": "Brand", name: "JAEGER EYEWEAR" },
                  offers: p.variants.map((v) => ({
                    "@type": "Offer",
                    priceCurrency: "USD",
                    price: (v.price! / 100).toFixed(2),
                    availability: v.stock
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                    sku: v.id,
                  })),
                }).replace(/</g, "\\u003c"),
              }}
            />
          )}
      </>
    );
  } else if (page === "collections" && item && slug.length === 2) {
    const c = (await readState()).collections.find((c) => c.id === item);
    if (!c) notFound();
    content = <CollectionPage title={c.name} collection={c.id} />;
  } else if (slug.length !== 1 || !titles[page]) notFound();
  else if (
    ["shop", "sunglasses", "optical", "new-arrivals", "search"].includes(page)
  )
    content = (
      <CollectionPage
        title={
          page === "shop"
            ? "ALL EYEWEAR."
            : page === "optical"
              ? "OPTICAL FRAMES."
              : page === "new-arrivals"
                ? "NEW PERSPECTIVES."
                : "SUNGLASSES."
        }
        category={["sunglasses", "optical"].includes(page) ? page : undefined}
        newOnly={page === "new-arrivals"}
        search={page === "search"}
      />
    );
  else if (["account", "orders"].includes(page))
    content = <AccountPage ordersOnly={page === "orders"} />;
  else if (page === "checkout") content = <CheckoutPage />;
  else if (page === "contact") content = <ContactPage />;
  else content = <InformationPage page={page} />;
  return (
    <Suspense
      fallback={<div className="empty">A new perspective is loading…</div>}
    >
      {content}
    </Suspense>
  );
}

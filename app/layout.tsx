import type { Metadata } from "next";
import { readState, storageReady } from "@/lib/db";
import { StoreProvider } from "@/components/store-provider";
import { Header, Footer } from "@/components/shell";
import "./globals.css";
import "./modern.css";
import { introRemaining } from "@/lib/pricing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://jaeger-eyewear.vercel.app",
  ),
  title: {
    default: "JAEGER EYEWEAR — A Different Perspective.",
    template: "%s | JAEGER EYEWEAR",
  },
  description:
    "Original eyewear from multiple original brands. Ray-Ban $60, selected styles up to $120. Curated by JAEGER EYEWEAR. A Different Perspective.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "JAEGER EYEWEAR — A Different Perspective.",
    description:
      "Original brands. Individual perspectives. Explore the real frames curated by JAEGER EYEWEAR.",
    images: [{ url: "/media/ronan-boutique.webp", width: 1122, height: 1402 }],
  },
  twitter: { card: "summary_large_image" },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await readState();
  const ready = storageReady();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StoreProvider
          catalog={{
            products: state.products.filter((p) => !p.archived),
            collections: state.collections.sort((a, b) => a.order - b.order),
            settings: state.settings,
            introRemaining: introRemaining(state.orders),
            storageReady: ready,
            orderingOpen:
              ready &&
              state.settings.launchApproved &&
              state.settings.manualOrdersEnabled,
          }}
        >
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}

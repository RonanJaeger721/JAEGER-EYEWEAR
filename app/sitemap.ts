import type { MetadataRoute } from "next";
import { readState } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const state = await readState();
  if (!state.settings.launchApproved) return [];
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://jaeger-eyewear.vercel.app";
  return [
    "",
    "/shop",
    "/sunglasses",
    "/optical",
    "/collections",
    "/our-story",
    "/contact",
    ...state.products
      .filter((p) => !p.archived)
      .map((p) => "/product/" + p.slug),
  ].map((route) => ({ url: base + route }));
}

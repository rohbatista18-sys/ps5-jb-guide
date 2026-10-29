import type { MetadataRoute } from "next";
import { INTL_TAG, LOCALES } from "@/i18n/config";
import { getErrors, getGuides, getRanges } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; lastModified?: string }[] = [
    { path: "" },
    ...getRanges().map((r) => ({ path: `/fw/${r.id}`, lastModified: r.reviewedAt })),
    { path: "/riscos" },
    { path: "/erros" },
    ...getErrors().map((e) => ({ path: `/erros/${e.slug}`, lastModified: e.reviewedAt })),
    { path: "/guias" },
    { path: "/guias/repositorios" },
    ...getGuides().map((g) => ({ path: `/guias/${g.slug}`, lastModified: g.reviewedAt })),
    { path: "/firmwares" },
  ];

  return paths.flatMap(({ path, lastModified }) =>
    LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [INTL_TAG[l], `${SITE_URL}/${l}${path}`])),
      },
    })),
  );
}

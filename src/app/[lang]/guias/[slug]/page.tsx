import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Suspense } from "react";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import RepoCard from "@/components/RepoCard";
import { getGuide, getGuides, getListedRepos } from "@/lib/content";
import { formatDate } from "@/lib/format";
import section from "../../section.module.css";
import fwStyles from "../../fw/[range]/page.module.css";

export function generateStaticParams() {
  return getGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/guias/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const entry = getGuide(slug);
  if (!hasLocale(lang) || !entry) return {};
  return {
    title: `${entry.title[lang]} · ${getDictionary(lang).meta.title}`,
    alternates: { canonical: `/${lang}/guias/${slug}` },
  };
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guias/[slug]">) {
  const locale = await rootLang();
  if (!hasLocale(locale)) notFound();

  return (
    <div className={fwStyles.page}>
      <Link href={`/${locale}/guias`} className={fwStyles.back}>
        {getDictionary(locale).guides.back}
      </Link>
      <Suspense fallback={<div className={`px-box ${fwStyles.hero} ${fwStyles.loading}`} aria-busy="true" />}>
        <GuideContent params={params} />
      </Suspense>
    </div>
  );
}

async function GuideContent({ params }: Pick<PageProps<"/[lang]/guias/[slug]">, "params">) {
  const { lang, slug } = await params;
  const entry = getGuide(slug);
  if (!hasLocale(lang) || !entry) notFound();
  const dict = getDictionary(lang);
  // Only listed repos with a GitHub snapshot are shown; the card's data all comes from that snapshot.
  const repos = getListedRepos(entry.repos);

  const { default: Body } = await import(`@content/${lang}/guides/${slug}.mdx`).catch(
    () => import(`@content/en/guides/${slug}.mdx`),
  );

  return (
    <article className={fwStyles.page} aria-labelledby="guide-title">
      <header className={`px-box ${fwStyles.hero}`}>
        <h1 id="guide-title" className={fwStyles.title}>
          {entry.title[lang]}
        </h1>
        <p className={fwStyles.muted}>{entry.summary[lang]}</p>
      </header>

      <div className={section.prose}>
        <Body />
      </div>

      {repos.length > 0 && (
        <section aria-labelledby="repos-title" className={fwStyles.section}>
          <h2 id="repos-title" className={fwStyles.sectionTitle}>
            {dict.guides.repos}
          </h2>
          <p className={section.note}>{dict.guides.repoNote}</p>
          <ul className={section.repoGrid}>
            {repos.map(({ entry: r }) => (
              <li key={r.id}>
                <RepoCard id={r.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={fwStyles.muted}>{fill(dict.range.reviewed, { date: formatDate(entry.reviewedAt, lang) })}</p>
      <Link href={`/${lang}/guias`} className={fwStyles.back}>
        {dict.guides.back}
      </Link>
    </article>
  );
}

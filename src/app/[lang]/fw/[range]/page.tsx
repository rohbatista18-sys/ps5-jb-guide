import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Suspense } from "react";
import Claim from "@/components/Claim";
import RepoCard from "@/components/RepoCard";
import StatusBadge from "@/components/StatusBadge";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { getListedRepos, getRange, getRanges, getSource } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { TRACKER_URL } from "@/lib/site";
import type { Source } from "@/lib/types";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getRanges().map((r) => ({ range: r.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/fw/[range]">): Promise<Metadata> {
  const { lang, range: id } = await params;
  const range = getRange(id);
  if (!hasLocale(lang) || !range) return {};
  return {
    title: `${range.title[lang]} · ${getDictionary(lang).meta.title}`,
    alternates: { canonical: `/${lang}/fw/${id}` },
  };
}

// `lang` is a root param and belongs to the shared App Shell; `range` is URL data, so everything
// that depends on it streams inside <Suspense> on client navigation (prerendered at build anyway).
export default async function RangePage({ params }: PageProps<"/[lang]/fw/[range]">) {
  const locale = await rootLang();
  if (!hasLocale(locale)) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/${locale}`} className={styles.back}>
        {getDictionary(locale).range.back}
      </Link>
      <Suspense fallback={<div className={`px-box ${styles.hero} ${styles.loading}`} aria-busy="true" />}>
        <RangeContent params={params} />
      </Suspense>
    </div>
  );
}

async function RangeContent({ params }: Pick<PageProps<"/[lang]/fw/[range]">, "params">) {
  const { lang, range: id } = await params;
  const range = getRange(id);
  if (!hasLocale(lang) || !range) notFound();
  const dict = getDictionary(lang);
  const t = dict.range;

  // check-content guarantees content/en/<id>.mdx for every non-draft range.
  let Tutorial: React.ComponentType | null = null;
  if (!range.draft) {
    Tutorial = (
      await import(`@content/${lang}/${id}.mdx`).catch(() => import(`@content/en/${id}.mdx`))
    ).default;
  }

  const repos = getListedRepos(range.repos);
  const sources = [...new Set(range.claims.map((c) => c.source))]
    .map(getSource)
    .filter((s): s is Source => s !== null);

  return (
    <article className={styles.page} aria-labelledby="range-title">
      <header className={`px-box ${styles.hero}`} data-status={range.status}>
        <h1 id="range-title" className={styles.title}>
          {range.title[lang]}
        </h1>
        <StatusBadge status={range.status} draft={range.draft} labels={dict.status} />
      </header>

      {range.status === "none" && (
        <section className={`px-box ${styles.none}`} aria-labelledby="none-title">
          <h2 id="none-title" className={styles.sectionTitle}>
            {t.noneTitle}
          </h2>
          <p>{t.noneBody}</p>
          <a href={`${TRACKER_URL}/${lang}`} className="px-btn" target="_blank" rel="noopener noreferrer">
            {t.trackerCta}
          </a>
        </section>
      )}

      {range.draft && (
        <p className={styles.draft} role="note">
          {t.draftNotice}
        </p>
      )}

      {Tutorial && (
        <div className={styles.prose}>
          <Tutorial />
        </div>
      )}

      {range.claims.length > 0 && (
        <section aria-labelledby="claims-title" className={styles.section}>
          <h2 id="claims-title" className={styles.sectionTitle}>
            {t.claimsTitle}
          </h2>
          <ul className={styles.claims}>
            {range.claims.map((c) => (
              <li key={c.text}>
                <Claim evidence={c.evidence} src={c.source}>
                  {dict.claims[c.text] ?? c.text}
                </Claim>
              </li>
            ))}
          </ul>
        </section>
      )}

      {range.status !== "none" && (
        <section aria-labelledby="repos-title" className={styles.section}>
          <h2 id="repos-title" className={styles.sectionTitle}>
            {t.reposTitle}
          </h2>
          {repos.length > 0 ? (
            <div className={styles.repos}>
              {repos.map(({ entry }) => (
                <RepoCard key={entry.id} id={entry.id} />
              ))}
            </div>
          ) : (
            <p className={styles.muted}>{t.noRepos}</p>
          )}
        </section>
      )}

      {sources.length > 0 && (
        <section aria-labelledby="sources-title" className={styles.section}>
          <h2 id="sources-title" className={styles.sectionTitle}>
            {t.sourcesTitle}
          </h2>
          <ol className={styles.sources}>
            {sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>{" "}
                <span className={styles.muted}>({formatDate(s.accessedAt, lang)})</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className={styles.muted}>{fill(t.reviewed, { date: formatDate(range.reviewedAt, lang) })}</p>
    </article>
  );
}

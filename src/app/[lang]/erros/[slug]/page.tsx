import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { Suspense } from "react";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { getError, getErrors, getSource } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { Source } from "@/lib/types";
import badge from "@/components/Badge.module.css";
import section from "../../section.module.css";
import styles from "../../fw/[range]/page.module.css";

const TONE = { low: "proven", medium: "reported", high: "none" } as const;

export function generateStaticParams() {
  return getErrors().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/erros/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const entry = getError(slug);
  if (!hasLocale(lang) || !entry) return {};
  return {
    title: `${entry.title[lang]} · ${getDictionary(lang).meta.title}`,
    alternates: { canonical: `/${lang}/erros/${slug}` },
  };
}

// Same split as /fw/[range]: `lang` is in the shared App Shell, the slug-dependent part streams.
export default async function ErrorPage({ params }: PageProps<"/[lang]/erros/[slug]">) {
  const locale = await rootLang();
  if (!hasLocale(locale)) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/${locale}/erros`} className={styles.back}>
        {getDictionary(locale).errors.back}
      </Link>
      <Suspense fallback={<div className={`px-box ${styles.hero} ${styles.loading}`} aria-busy="true" />}>
        <ErrorContent params={params} />
      </Suspense>
    </div>
  );
}

async function ErrorContent({ params }: Pick<PageProps<"/[lang]/erros/[slug]">, "params">) {
  const { lang, slug } = await params;
  const entry = getError(slug);
  if (!hasLocale(lang) || !entry) notFound();
  const dict = getDictionary(lang);
  const t = dict.errors;

  // check-content guarantees content/en/errors/<slug>.mdx for every entry.
  const { default: Body } = await import(`@content/${lang}/errors/${slug}.mdx`).catch(
    () => import(`@content/en/errors/${slug}.mdx`),
  );
  // Sony pages exist per language (id suffix -en/-es/-esmx/-pt): list only this page's language.
  const sources = entry.sources
    .filter((id) => {
      const suffix = /-(en|es|esmx|pt)$/.exec(id)?.[1];
      return !suffix || suffix === lang || (lang === "es" && suffix === "esmx");
    })
    .map(getSource)
    .filter((s): s is Source => s !== null);

  return (
    <article className={styles.page} aria-labelledby="error-title">
      <header className={`px-box ${styles.hero}`} data-status={TONE[entry.severity] === "none" ? "none" : undefined}>
        <h1 id="error-title" className={styles.title}>
          {entry.title[lang]}
        </h1>
        <span className={badge.badge} data-tone={TONE[entry.severity]}>
          {t.severity[entry.severity]}
        </span>
      </header>

      <section aria-labelledby="symptoms-title" className={styles.section}>
        <h2 id="symptoms-title" className={styles.sectionTitle}>
          {t.symptoms}
        </h2>
        <ul className={section.bullets}>
          {entry.symptoms[lang].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <div className={section.prose}>
        <Body />
      </div>

      <section aria-labelledby="sources-title" className={styles.section}>
        <h2 id="sources-title" className={styles.sectionTitle}>
          {t.sources}
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

      <p className={styles.muted}>{fill(dict.range.reviewed, { date: formatDate(entry.reviewedAt, lang) })}</p>
    </article>
  );
}

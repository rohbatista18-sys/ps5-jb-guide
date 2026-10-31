import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ErrorList from "@/components/ErrorList";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ERROR_GROUPS, getErrors } from "@/lib/content";
import styles from "../section.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/erros">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: `${dict.errors.title} · ${dict.meta.title}`, alternates: { canonical: `/${lang}/erros` } };
}

export default async function ErrorsPage({ params }: PageProps<"/[lang]/erros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  // Only this locale's text crosses to the client for the filter.
  const entries = getErrors().map((e) => ({
    slug: e.slug,
    group: e.group,
    severity: e.severity,
    evidence: e.evidence,
    title: e.title[lang],
    symptoms: e.symptoms[lang],
  }));

  return (
    <article className={styles.page} aria-labelledby="errors-title">
      <h1 id="errors-title" className={styles.title}>
        {dict.errors.title}
      </h1>
      <p className={styles.intro}>{dict.errors.intro}</p>
      {entries.length === 0 ? (
        <p className={styles.empty}>{dict.errors.empty}</p>
      ) : (
        <ErrorList
          lang={lang}
          entries={entries}
          groups={ERROR_GROUPS}
          labels={dict.errors}
          evidenceLabels={dict.evidence}
        />
      )}
    </article>
  );
}

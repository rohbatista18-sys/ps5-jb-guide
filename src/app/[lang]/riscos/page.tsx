import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "../section.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/riscos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: `${dict.risks.title} · ${dict.meta.title}`, alternates: { canonical: `/${lang}/riscos` } };
}

export default async function RisksPage({ params }: PageProps<"/[lang]/riscos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { default: Risks } = await import(`@content/${lang}/risks.mdx`);

  return (
    <article className={styles.page} aria-labelledby="risks-title">
      <h1 id="risks-title" className={styles.title}>
        {dict.risks.title}
      </h1>
      <div className={styles.prose}>
        <Risks />
      </div>
    </article>
  );
}

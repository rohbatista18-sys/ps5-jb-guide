import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getFirmwareDownloads } from "@/lib/content";
import FirmwareList from "./FirmwareList";
import styles from "./page.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/firmwares">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.firmwares.title} · ${dict.meta.title}`,
    alternates: { canonical: `/${lang}/firmwares` },
  };
}

export default async function FirmwaresPage({ params }: PageProps<"/[lang]/firmwares">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).firmwares;
  const fw = getFirmwareDownloads();

  return (
    <article className={styles.page} aria-labelledby="fw-title">
      <h1 id="fw-title" className={styles.title}>
        {t.title}
      </h1>
      <p className={styles.intro}>{t.intro}</p>

      <section className={`px-box ${styles.warn}`} aria-labelledby="fw-warn-title">
        <h2 id="fw-warn-title" className={styles.warnTitle}>
          <span aria-hidden="true">! </span>
          {t.warnTitle}
        </h2>
        <p>{t.warnBody}</p>
      </section>

      <p className={styles.source}>
        {t.sourceLabel}{" "}
        <a href={fw.source} target="_blank" rel="noopener noreferrer">
          {fw.sourceTitle} ↗
        </a>
      </p>

      <FirmwareList
        groups={[
          { id: "official", title: t.official, items: fw.official },
          { id: "recovery", title: t.recovery, items: fw.recovery },
        ]}
        pinned={{ versions: ["11.40", "10.60"], label: t.pinned }}
        text={{
          filterLabel: t.filterLabel,
          filterPlaceholder: t.filterPlaceholder,
          noMatch: t.noMatch,
          jumpLabel: t.jumpLabel,
          downloadAria: t.downloadAria,
        }}
      />
    </article>
  );
}

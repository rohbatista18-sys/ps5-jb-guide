import type { ReactNode } from "react";
import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { getSource } from "@/lib/content";
import styles from "./Step.module.css";

interface Props {
  n: number;
  title: string;
  /** Id in sources.json for the README line this step comes from; check-content validates it. */
  src?: string;
  children?: ReactNode;
}

// MDX: <Step n={1} title="…" src="relapse-readme">…</Step>
export default async function Step({ n, title, src, children }: Props) {
  const source = src ? getSource(src) : null;
  const locale = await lang();
  const dict = getDictionary(hasLocale(locale) ? locale : "en");

  return (
    <section className={`px-box ${styles.step}`}>
      <h3 className={styles.title}>
        <span className={styles.n} aria-hidden="true">
          {n}
        </span>
        {title}
      </h3>
      {children && <div className={styles.body}>{children}</div>}
      {source && (
        <a href={source.url} className={styles.source} target="_blank" rel="noopener noreferrer">
          {fill(dict.evidence.sourceLabel, { title: source.title })} ↗
        </a>
      )}
    </section>
  );
}

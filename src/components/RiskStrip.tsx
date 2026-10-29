import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./RiskStrip.module.css";

// Shown on every page (spec US5): the three rules a beginner must not miss.
export default function RiskStrip({ lang, labels }: { lang: Locale; labels: Dictionary["riskStrip"] }) {
  return (
    <aside className={styles.strip} aria-label={labels.label}>
      <ul className={styles.items}>
        <li>{labels.offline}</li>
        <li>{labels.noUpdate}</li>
        <li>{labels.noScam}</li>
      </ul>
      <Link href={`/${lang}/riscos`} className={styles.more}>
        {labels.more} →
      </Link>
    </aside>
  );
}

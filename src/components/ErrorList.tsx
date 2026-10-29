"use client";

import { useDeferredValue, useId, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import type { ErrorEntry } from "@/lib/types";
import badge from "./Badge.module.css";
import styles from "@/app/[lang]/section.module.css";

interface Entry {
  slug: string;
  severity: ErrorEntry["severity"];
  title: string;
  symptoms: string[];
}

// Accents and case are ignored, so "congela" also finds "Congelá".
const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const TONE = { low: "proven", medium: "reported", high: "none" } as const;

export default function ErrorList({ lang, entries, labels }: { lang: Locale; entries: Entry[]; labels: Dictionary["errors"] }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const q = normalize(deferred.trim());
  const shown = q
    ? entries.filter((e) => [e.title, ...e.symptoms].some((text) => normalize(text).includes(q)))
    : entries;

  return (
    <div className={styles.group}>
      <label htmlFor={inputId}>{labels.filter}</label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={labels.filterPlaceholder}
        autoComplete="off"
      />
      <p role="status" aria-live="polite" className={styles.intro}>
        {!q
          ? null
          : shown.length === 0
            ? fill(labels.noMatch, { query: deferred.trim() })
            : fill(labels.matches, { count: shown.length, total: entries.length })}
      </p>
      <ul className={styles.cards}>
        {shown.map((e) => (
          <li key={e.slug}>
            <Link href={`/${lang}/erros/${e.slug}`} className={`px-box ${styles.card}`}>
              <span className={styles.cardTitle}>{e.title}</span>
              <span className={badge.badge} data-tone={TONE[e.severity]}>
                {labels.severity[e.severity]}
              </span>
              <span>{e.symptoms.join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

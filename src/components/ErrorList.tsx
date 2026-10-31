"use client";

import { useDeferredValue, useId, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import type { ErrorEntry, ErrorGroup } from "@/lib/types";
import badge from "./Badge.module.css";
import styles from "@/app/[lang]/section.module.css";

interface Entry {
  slug: string;
  group: ErrorGroup;
  severity: ErrorEntry["severity"];
  evidence?: ErrorEntry["evidence"];
  title: string;
  symptoms: string[];
}

interface Props {
  lang: Locale;
  entries: Entry[];
  groups: ErrorGroup[];
  labels: Dictionary["errors"];
  evidenceLabels: Dictionary["evidence"];
}

// Accents and case are ignored, so "congela" also finds "Congelá".
const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const TONE = { low: "proven", medium: "reported", high: "none" } as const;

export default function ErrorList({ lang, entries, groups, labels, evidenceLabels }: Props) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const q = normalize(deferred.trim());
  const shown = q
    ? entries.filter((e) => [e.title, ...e.symptoms].some((text) => normalize(text).includes(q)))
    : entries;
  const sections = groups
    .map((g) => ({ id: g, items: shown.filter((e) => e.group === g) }))
    .filter((s) => s.items.length > 0);

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

      {!q && (
        <nav aria-label={labels.topics} className={styles.topics}>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="px-btn">
              {labels.groups[s.id]} ({s.items.length})
            </a>
          ))}
        </nav>
      )}

      {sections.map((s) => (
        <section key={s.id} id={s.id} className={styles.group} aria-labelledby={`${s.id}-title`}>
          <h2 id={`${s.id}-title`} className={styles.groupTitle}>
            {labels.groups[s.id]}
          </h2>
          <ul className={styles.cards}>
            {s.items.map((e) => (
              <li key={e.slug}>
                <Link href={`/${lang}/erros/${e.slug}`} className={`px-box ${styles.card}`}>
                  <span className={styles.cardTitle}>{e.title}</span>
                  <span className={badge.group}>
                    <span className={badge.badge} data-tone={TONE[e.severity]}>
                      {labels.severity[e.severity]}
                    </span>
                    {e.evidence && <span className={badge.badge}>{evidenceLabels[e.evidence]}</span>}
                  </span>
                  <span>{e.symptoms.join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

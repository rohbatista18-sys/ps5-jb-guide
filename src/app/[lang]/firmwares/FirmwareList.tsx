"use client";

import { useId, useState } from "react";
import type { FirmwareDownload } from "@/lib/types";
import styles from "./page.module.css";

interface Group {
  id: string;
  title: string;
  items: FirmwareDownload[];
}

interface Props {
  groups: Group[];
  pinned: { versions: string[]; label: string };
  text: { filterLabel: string; filterPlaceholder: string; noMatch: string; jumpLabel: string; downloadAria: string };
}

// Local, so the client bundle does not pull in every language's dictionary.
const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

// "9.6" and "09.60" both find 09.60.00: compare without leading zeros.
const norm = (v: string) => v.trim().replace(/^0+(?=\d)/, "").replace(/\.0+(?=\d)/g, ".");

export default function FirmwareList({ groups, pinned, text }: Props) {
  const [query, setQuery] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const inputId = useId();
  const q = norm(query);
  const pins = pinned.versions.map(norm);
  const match = (version: string) =>
    onlyPinned ? pins.some((p) => norm(version).startsWith(p)) : !q || norm(version).startsWith(q);
  const shown = groups.map((g) => ({ ...g, items: g.items.filter((f) => match(f.version)) }));
  const total = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <div className={`px-box ${styles.tools}`}>
        <label htmlFor={inputId} className={styles.filterLabel}>
          {text.filterLabel}
        </label>
        <input
          id={inputId}
          type="search"
          inputMode="decimal"
          autoComplete="off"
          className={styles.filter}
          placeholder={text.filterPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOnlyPinned(false);
          }}
        />
        <button
          type="button"
          className={`px-btn ${styles.pinned}`}
          aria-pressed={onlyPinned}
          onClick={() => {
            setOnlyPinned((v) => !v);
            setQuery("");
          }}
        >
          {pinned.label}
        </button>
        <nav aria-label={text.jumpLabel} className={styles.jump}>
          {shown.filter((g) => g.items.length > 0).map((g) => (
            <a key={g.id} href={`#${g.id}`} className={`px-btn ${styles.jumpLink}`}>
              {g.title} ({g.items.length})
            </a>
          ))}
        </nav>
        <p className="sr-only" role="status">
          {q && total === 0 ? fill(text.noMatch, { q: query }) : ""}
        </p>
      </div>

      {q && total === 0 && <p className={styles.empty}>{fill(text.noMatch, { q: query })}</p>}

      {shown.map((g) =>
        g.items.length === 0 ? null : (
          <section key={g.id} id={g.id} className={styles.section} aria-labelledby={`${g.id}-title`}>
            <h2 id={`${g.id}-title`} className={styles.sectionTitle}>
              {g.title} ({g.items.length})
            </h2>
            <ul className={styles.list}>
              {g.items.map((f) => (
                <li key={f.version} className={styles.row}>
                  <span className={styles.version}>{f.version}</span>
                  <span className={styles.links}>
                    <a
                      className={styles.dlLink}
                      href={f.mega}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={fill(text.downloadAria, { version: f.version, kind: g.title, host: "MEGA" })}
                    >
                      MEGA ↗
                    </a>
                    {f.onefichier && (
                      <a
                        className={styles.dlLink}
                        href={f.onefichier}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={fill(text.downloadAria, { version: f.version, kind: g.title, host: "1Fichier" })}
                      >
                        1Fichier ↗
                      </a>
                    )}
                  </span>
                  <code className={styles.md5}>
                    <span className={styles.md5Label}>MD5</span> {f.md5}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </>
  );
}

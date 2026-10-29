"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import { matchRange, type RangeSummary } from "@/lib/match";
import StatusBadge from "./StatusBadge";
import styles from "./FirmwarePicker.module.css";

export type PickerRange = RangeSummary & { title: string };

interface Props {
  lang: Locale;
  ranges: PickerRange[];
  latestKnownFirmware: string;
  labels: Dictionary["picker"];
  statusLabels: Dictionary["status"];
}

export default function FirmwarePicker({ lang, ranges, latestKnownFirmware, labels, statusLabels }: Props) {
  const router = useRouter();
  const inputId = useId();
  const messageId = useId();
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("version") ?? "");
    const result = matchRange(ranges, latestKnownFirmware, value);
    switch (result.kind) {
      case "range":
        setMessage(null);
        router.push(`/${lang}/fw/${result.range.id}`);
        break;
      case "invalid":
        setMessage(labels.invalid);
        break;
      case "newer":
        setMessage(fill(labels.newer, { version: result.version, latest: latestKnownFirmware }));
        break;
      case "undocumented":
        setMessage(fill(labels.undocumented, { version: result.version }));
        break;
    }
  }

  return (
    <div className={styles.picker}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label htmlFor={inputId} className={styles.label}>
          {labels.label}
        </label>
        <div className={styles.row}>
          <input
            id={inputId}
            name="version"
            className={styles.input}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder={labels.placeholder}
            maxLength={6}
            aria-describedby={message ? messageId : undefined}
            aria-invalid={message === labels.invalid || undefined}
          />
          <button type="submit" className="px-btn" style={{ "--pb": "var(--magenta)" } as React.CSSProperties}>
            {labels.go}
          </button>
        </div>
        <p id={messageId} className={styles.message} role="status" aria-live="polite">
          {message}
        </p>
      </form>

      <section aria-labelledby={`${inputId}-ranges`}>
        <h2 id={`${inputId}-ranges`} className={styles.rangesTitle}>
          {labels.rangesTitle}
        </h2>
        <ul className={styles.grid}>
          {ranges.map((r) => (
            <li key={r.id}>
              <Link
                href={`/${lang}/fw/${r.id}`}
                className={`px-box ${styles.range}`}
                aria-label={fill(labels.open, { range: r.title })}
                data-status={r.status}
              >
                <span className={styles.rangeName}>{r.title}</span>
                <StatusBadge status={r.status} draft={r.draft} labels={statusLabels} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

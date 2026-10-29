"use client";

import { useSyncExternalStore } from "react";
import styles from "./RepoCard.module.css";

const noop = () => () => {};

// Judged in the browser: on a prerendered page, a server-side Date.now() would freeze at build time.
export default function StaleNotice({ checkedAt, maxAgeDays, text }: { checkedAt: string; maxAgeDays: number; text: string }) {
  const stale = useSyncExternalStore(
    noop,
    () => Date.now() - new Date(checkedAt).getTime() > maxAgeDays * 86_400_000,
    () => false,
  );
  if (!stale) return null;
  return (
    <p className={styles.stale} role="note">
      {text}
    </p>
  );
}

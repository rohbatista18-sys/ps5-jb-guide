import type { ReactNode } from "react";
import styles from "./Warn.module.css";

type Kind = "ban" | "update" | "brick" | "terms" | "scam";

// MDX: <Warn kind="update" title="Do not update">…</Warn>
export default function Warn({ kind, title, children }: { kind: Kind; title: string; children: ReactNode }) {
  return (
    <section className={`px-box ${styles.warn}`} data-kind={kind}>
      <h2 className={styles.title}>
        <span aria-hidden="true">! </span>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

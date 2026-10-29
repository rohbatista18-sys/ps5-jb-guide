import type { RangeStatus } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./Badge.module.css";

interface Props {
  status: RangeStatus;
  draft?: boolean;
  labels: Dictionary["status"];
}

export default function StatusBadge({ status, draft, labels }: Props) {
  return (
    <span className={styles.group}>
      <span className={styles.badge} data-tone={status}>
        {labels[status]}
      </span>
      {draft && (
        <span className={styles.badge} data-tone="draft">
          {labels.draft}
        </span>
      )}
    </span>
  );
}

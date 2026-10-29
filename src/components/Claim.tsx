import type { ReactNode } from "react";
import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { getSource } from "@/lib/content";
import type { Evidence } from "@/lib/types";
import badge from "./Badge.module.css";
import styles from "./Claim.module.css";

interface Props {
  evidence: Evidence;
  /** Id in sources.json; check-content fails the build if it is missing or unknown. */
  src: string;
  children: ReactNode;
}

// Server component usable both from MDX (<Claim evidence="proven" src="…">) and from pages.
export default async function Claim({ evidence, src, children }: Props) {
  const locale = await lang();
  const dict = getDictionary(hasLocale(locale) ? locale : "en");
  const source = getSource(src);

  return (
    <span className={styles.claim}>
      <span className={badge.badge} data-tone={evidence}>
        {dict.evidence[evidence]}
      </span>{" "}
      <span>{children}</span>
      {source && (
        <>
          {" "}
          <a
            href={source.url}
            className={styles.source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={fill(dict.evidence.sourceLabel, { title: source.title })}
          >
            [{source.title}]
          </a>
        </>
      )}
    </span>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { GuideMenu, RangeStatus } from "@/lib/types";
import styles from "./SiteMenu.module.css";

type Panel = "firmware" | "guides";

interface Props {
  lang: Locale;
  labels: Dictionary["nav"];
  ranges: { id: string; title: string; status: RangeStatus }[];
  guideMenus: GuideMenu[];
}

export default function SiteMenu({ lang, labels, ranges, guideMenus }: Props) {
  const pathname = usePathname();
  const id = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Panel | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cache Components keeps routes mounted, so menus must close on navigation themselves.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!open && !mobileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, mobileOpen]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") return;
    if (open) {
      document.getElementById(`${id}-${open}-btn`)?.focus();
      setOpen(null);
    } else if (mobileOpen) {
      document.getElementById(`${id}-toggle`)?.focus();
      setMobileOpen(false);
    }
  }

  const toggle = (panel: Panel) => setOpen((current) => (current === panel ? null : panel));
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <nav ref={rootRef} className={styles.nav} aria-label={labels.label} onKeyDown={onKeyDown}>
      <button
        id={`${id}-toggle`}
        type="button"
        className={`px-btn ${styles.toggle}`}
        aria-expanded={mobileOpen}
        aria-controls={`${id}-list`}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {labels.menu} <Caret open={mobileOpen} />
      </button>

      <ul id={`${id}-list`} className={styles.list} data-open={mobileOpen || undefined}>
        <li className={styles.item}>
          <button
            id={`${id}-firmware-btn`}
            type="button"
            className={`px-btn ${styles.trigger}`}
            aria-expanded={open === "firmware"}
            aria-controls={`${id}-firmware`}
            onClick={() => toggle("firmware")}
          >
            {labels.firmware} <Caret open={open === "firmware"} />
          </button>
          <ul id={`${id}-firmware`} className={styles.panel} hidden={open !== "firmware"}>
            {ranges.map((r) => (
              <li key={r.id}>
                <Link href={`/${lang}/fw/${r.id}`} aria-current={current(`/${lang}/fw/${r.id}`)} data-status={r.status}>
                  {r.title}
                </Link>
              </li>
            ))}
            <li className={styles.panelFooter}>
              <Link href={`/${lang}`} aria-current={current(`/${lang}`)}>
                {labels.allFirmware}
              </Link>
            </li>
          </ul>
        </li>

        <li className={styles.item}>
          <button
            id={`${id}-guides-btn`}
            type="button"
            className={`px-btn ${styles.trigger}`}
            aria-expanded={open === "guides"}
            aria-controls={`${id}-guides`}
            onClick={() => toggle("guides")}
          >
            {labels.guides} <Caret open={open === "guides"} />
          </button>
          <ul id={`${id}-guides`} className={styles.panel} hidden={open !== "guides"}>
            {guideMenus.map((m) => (
              <li key={m}>
                <Link href={`/${lang}/guias#${m}`}>{labels.guideMenus[m]}</Link>
              </li>
            ))}
            <li className={styles.panelFooter}>
              <Link href={`/${lang}/guias`} aria-current={current(`/${lang}/guias`)}>
                {labels.allGuides}
              </Link>
            </li>
          </ul>
        </li>

        <li className={styles.item}>
          <Link href={`/${lang}/erros`} className={`px-btn ${styles.trigger}`} aria-current={current(`/${lang}/erros`)}>
            {labels.errors}
          </Link>
        </li>
        <li className={styles.item}>
          <Link href={`/${lang}/riscos`} className={`px-btn ${styles.trigger}`} aria-current={current(`/${lang}/riscos`)}>
            {labels.risks}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// The pixel font has no ▾ glyph, so the caret is a 3-step pixel triangle.
function Caret({ open }: { open: boolean }) {
  return (
    <svg className={styles.caret} data-open={open || undefined} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
      <path d="M0 0h10v2H8v2H6v2H4V4H2V2H0z" fill="currentColor" />
    </svg>
  );
}

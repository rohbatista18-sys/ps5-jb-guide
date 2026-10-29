"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import styles from "./Dialog.module.css";

interface Props {
  label: string;
  closeLabel: string;
  /** id of the visible heading inside `children`, used as the dialog's accessible name. */
  titleId?: string;
  /** Extra class for the trigger button (e.g. a quieter footer variant). */
  triggerClassName?: string;
  children?: ReactNode;
}

// Button that opens the content in a native modal <dialog> (from ps5-jb-tracker's NewsDialog):
// focus is trapped while open, Esc closes it, and focus returns to the button. A click on the
// backdrop also closes it. Cache Components keeps a left route mounted (hidden), so the dialog
// also closes on navigation instead of reappearing open when the visitor comes back.
export default function Dialog({ label, closeLabel, titleId, triggerClassName, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={`px-btn ${styles.open} ${triggerClassName ?? ""}`}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={open}
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <span aria-hidden="true">▶ </span>
        {label}
      </button>

      <dialog
        ref={dialog}
        id={dialogId}
        className={styles.dialog}
        aria-labelledby={titleId}
        aria-label={titleId ? undefined : label}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className={styles.panel}>
          <button type="button" className={`px-btn ${styles.close}`} onClick={() => dialog.current?.close()}>
            <span aria-hidden="true">✕ </span>
            {closeLabel}
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}

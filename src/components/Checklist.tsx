"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Checklist.module.css";

// MDX: <Checklist items={["…", "…"]} />. Ticks are a per-visitor convenience kept in
// localStorage (never sent anywhere); the list works the same when storage is blocked.
export default function Checklist({ items }: { items: string[] }) {
  const pathname = usePathname();
  const id = useId();
  const key = `checklist:${pathname}`;
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
      if (Array.isArray(saved) && saved.length === items.length) setDone(saved.map(Boolean));
    } catch {}
  }, [key, items.length]);

  function toggle(i: number) {
    setDone((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <li key={item}>
          <input id={`${id}-${i}`} type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
          <label htmlFor={`${id}-${i}`}>{item}</label>
        </li>
      ))}
    </ul>
  );
}

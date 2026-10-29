import styles from "./MenuPath.module.css";

// MDX: <MenuPath items={["Settings", "System", "System Software", "Console Information"]} />
// Labels are written per language in each MDX file, copied from Sony's support page for that language.
// Index keys: a path can repeat a label (Settings › Network › Settings).
export default function MenuPath({ items }: { items: string[] }) {
  return (
    <ol className={styles.path}>
      {items.map((item, i) => (
        <li key={i} className={styles.step}>
          {i > 0 && (
            <span className={styles.sep} aria-hidden="true">
              ›
            </span>
          )}
          <span className={styles.item}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

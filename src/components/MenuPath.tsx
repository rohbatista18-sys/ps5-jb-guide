import { Fragment } from "react";
import styles from "./MenuPath.module.css";

// MDX: <MenuPath items={["Settings", "System", "System Software", "Console Information"]} />
// Labels are written per language in each MDX file, copied from Sony's support page for that language.
export default function MenuPath({ items }: { items: string[] }) {
  return (
    <ol className={styles.path}>
      {items.map((item, i) => (
        <Fragment key={item}>
          {i > 0 && (
            <li className={styles.sep} aria-hidden="true">
              ›
            </li>
          )}
          <li className={styles.item}>{item}</li>
        </Fragment>
      ))}
    </ol>
  );
}

import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import CopyButton from "./CopyButton";
import styles from "./CopyValue.module.css";

// MDX: <CopyValue value="45.56.67.85" /> for a value the reader must type on the console.
export default async function CopyValue({ value }: { value: string }) {
  const locale = await lang();
  const { copy } = getDictionary(hasLocale(locale) ? locale : "en");

  return (
    <span className={styles.wrap}>
      <code className={styles.value}>{value}</code>
      <CopyButton value={value} ariaLabel={fill(copy.aria, { value })} text={copy} className={`px-btn ${styles.btn}`} />
    </span>
  );
}

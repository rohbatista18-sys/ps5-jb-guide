import { INTL_TAG, type Locale } from "@/i18n/config";

/** Calendar date in UTC, so a build in one timezone never shifts a day in another. */
export const formatDate = (iso: string, lang: Locale) =>
  new Intl.DateTimeFormat(INTL_TAG[lang], { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso));

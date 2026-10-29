import { notFound } from "next/navigation";
import Dialog from "@/components/Dialog";
import FirmwarePicker from "@/components/FirmwarePicker";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getRanges, latestKnownFirmware } from "@/lib/content";
import styles from "./page.module.css";
import section from "./section.module.css";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { default: CheckFirmware } = await import(`@content/${lang}/check-firmware.mdx`);
  // Only what the picker needs crosses to the client, not the whole firmware.json.
  const ranges = getRanges().map(({ id, min, max, status, draft, title }) => ({
    id,
    min,
    max,
    status,
    draft,
    title: title[lang],
  }));

  return (
    <>
      <section className={`px-box ${styles.hero}`} aria-labelledby="home-title">
        <h1 id="home-title" className={styles.heading}>
          {dict.home.title}
        </h1>
        <div className={styles.howTo}>
          <Dialog label={dict.home.howTo} closeLabel={dict.footer.close} titleId="how-to-title">
            <article className={`px-box ${section.prose} ${styles.howToBody}`}>
              <h2 id="how-to-title" className={section.groupTitle}>
                {dict.home.howTo}
              </h2>
              <CheckFirmware />
            </article>
          </Dialog>
        </div>
      </section>
      <FirmwarePicker
        lang={lang}
        ranges={ranges}
        latestKnownFirmware={latestKnownFirmware()}
        labels={dict.picker}
        statusLabels={dict.status}
      />
    </>
  );
}

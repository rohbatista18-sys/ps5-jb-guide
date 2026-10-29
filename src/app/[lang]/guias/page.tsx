import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { GUIDE_MENUS, getGuides } from "@/lib/content";
import styles from "../section.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/guias">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: `${dict.guides.title} · ${dict.meta.title}`, alternates: { canonical: `/${lang}/guias` } };
}

export default async function GuidesPage({ params }: PageProps<"/[lang]/guias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const guides = getGuides();

  return (
    <article className={styles.page} aria-labelledby="guides-title">
      <h1 id="guides-title" className={styles.title}>
        {dict.guides.title}
      </h1>
      <p className={styles.intro}>{dict.guides.intro}</p>

      {GUIDE_MENUS.map((menu) => {
        const inMenu = guides.filter((g) => g.menu === menu);
        return (
          <section key={menu} id={menu} className={styles.group} aria-labelledby={`${menu}-title`}>
            <h2 id={`${menu}-title`} className={styles.groupTitle}>
              {dict.nav.guideMenus[menu]}
            </h2>
            {inMenu.length === 0 ? (
              <p className={styles.empty}>{dict.guides.empty}</p>
            ) : (
              <ul className={styles.cards}>
                {inMenu.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/${lang}/guias/${g.slug}`} className={`px-box ${styles.card}`}>
                      <span className={styles.cardTitle}>{g.title[lang]}</span>
                      <span>{g.summary[lang]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </article>
  );
}

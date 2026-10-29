import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { GUIDE_MENUS, getGuides, getListedRepos, getListedReposInCategory, type ListedRepo } from "@/lib/content";
import styles from "../../section.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/guias/repositorios">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.guides.allRepos} · ${dict.meta.title}`,
    alternates: { canonical: `/${lang}/guias/repositorios` },
  };
}

export default async function AllReposPage({ params }: PageProps<"/[lang]/guias/repositorios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const guides = getGuides();

  // One section per Guides menu (repos of all its guides, without repeats), then the general guides.
  const sections: { id: string; title: string; repos: ListedRepo[] }[] = [
    ...GUIDE_MENUS.map((menu) => ({
      id: menu,
      title: dict.nav.guideMenus[menu],
      repos: getListedRepos([...new Set(guides.filter((g) => g.menu === menu).flatMap((g) => g.repos))]),
    })),
    { id: "general", title: dict.guides.generalGuides, repos: getListedReposInCategory("guide") },
  ].filter((s) => s.repos.length > 0);

  return (
    <article className={styles.page} aria-labelledby="repos-title">
      <h1 id="repos-title" className={styles.title}>
        {dict.guides.allRepos}
      </h1>
      <p className={styles.intro}>{dict.guides.allReposIntro}</p>
      <p className={styles.intro}>{dict.guides.repoNote}</p>

      <div className={styles.groups}>
        {sections.map((s) => (
          <section key={s.id} id={s.id} className={styles.group} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className={styles.groupTitle}>
              {s.title}
            </h2>
            <ul className={`px-box ${styles.linkList}`}>
              {s.repos.map(({ entry, snapshot }) => (
                <li key={entry.id}>
                  <a href={`https://github.com/${entry.id}`} target="_blank" rel="noopener noreferrer" className={styles.repoLink}>
                    <span className={styles.repoName}>{entry.id}</span>
                    <span className={styles.repoMeta}>
                      ★ {fill(dict.guides.stars, { n: snapshot.stargazers_count.toLocaleString(lang) })}
                      {snapshot.fork && ` · ${dict.guides.fork}`}
                    </span>
                    <span className="sr-only"> {dict.header.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Link href={`/${lang}/guias`} className={styles.backLink}>
        {dict.guides.back}
      </Link>
    </article>
  );
}

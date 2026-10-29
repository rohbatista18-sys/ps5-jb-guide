import { lang } from "next/root-params";
import { hasLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { SNAPSHOT_MAX_AGE_DAYS, getListedRepo, snapshotCheckedAt } from "@/lib/content";
import { formatDate } from "@/lib/format";
import StaleNotice from "./StaleNotice";
import styles from "./RepoCard.module.css";

// Text only, no avatar or README preview: everything comes from the local snapshot (FR-022).
// A repo that is not "listed" or has no snapshot renders nothing.
export default async function RepoCard({ id }: { id: string }) {
  const listed = getListedRepo(id);
  if (!listed) return null;
  const locale = await lang();
  const l = hasLocale(locale) ? locale : "en";
  const t = getDictionary(l).repo;
  const { snapshot } = listed;
  const checkedAt = snapshotCheckedAt();

  return (
    <article className={`px-box ${styles.card}`}>
      <h3 className={styles.name}>
        <a href={snapshot.html_url} target="_blank" rel="noopener noreferrer">
          {snapshot.full_name}
        </a>
      </h3>
      <ul className={styles.meta}>
        <li>{fill(t.stars, { count: snapshot.stargazers_count.toLocaleString(l) })}</li>
        <li>{snapshot.license ? fill(t.license, { license: snapshot.license }) : t.noLicense}</li>
        <li>{fill(t.lastPush, { date: formatDate(snapshot.pushed_at, l) })}</li>
        <li>{snapshot.latestRelease ? fill(t.release, { tag: snapshot.latestRelease.tag }) : t.noRelease}</li>
        {checkedAt && <li>{fill(t.verified, { date: formatDate(checkedAt, l) })}</li>}
      </ul>
      {checkedAt && (
        <StaleNotice
          checkedAt={checkedAt}
          maxAgeDays={SNAPSHOT_MAX_AGE_DAYS}
          text={fill(t.stale, { days: SNAPSHOT_MAX_AGE_DAYS })}
        />
      )}
      <a href={snapshot.html_url} className="px-btn" target="_blank" rel="noopener noreferrer">
        {t.open}
      </a>
    </article>
  );
}

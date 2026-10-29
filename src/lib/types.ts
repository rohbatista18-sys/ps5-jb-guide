import type { Localized } from "@/i18n/config";

// Shapes of the files in content/ (plan.md › "Modelo de conteúdo"). scripts/check-content.mjs
// validates the same rules at build time, so a malformed file never reaches a page.

export type Evidence = "proven" | "reported";

/** "public" = a released method exists; "none" = no public method; "unknown" = not documented here yet. */
export type RangeStatus = "public" | "none" | "unknown";

export interface Claim {
  /** Key into the dictionary or the range's MDX; the text itself is localized elsewhere. */
  text: string;
  evidence: Evidence;
  /** Id in sources.json. */
  source: string;
}

export interface FirmwareRange {
  /** Route slug, e.g. "7.00-13.60". */
  id: string;
  /** Inclusive bounds as "X.YY". */
  min: string;
  max: string;
  status: RangeStatus;
  title: Localized;
  /** Ids in repos.json; only "listed" ones are rendered. */
  repos: string[];
  claims: Claim[];
  /** Draft ranges render an "in preparation" notice and need no tutorial MDX yet. */
  draft?: boolean;
  reviewedAt: string;
}

export interface FirmwareFile {
  /** Newest firmware the guide knows about; anything newer is treated as "no public method". */
  latestKnownFirmware: string;
  ranges: FirmwareRange[];
}

export type RepoCategory = "exploit" | "hen" | "loader" | "homebrew" | "store" | "utility" | "backup" | "research";
export type RepoStatus = "listed" | "review" | "excluded";

export interface RepoEntry {
  /** Expected GitHub full_name; verify-repos fails if the API returns a different one. */
  id: string;
  category: RepoCategory;
  firmware: { min: string; max: string; evidence: Evidence; source: string }[];
  status: RepoStatus;
  /** Set when the repo is archived on GitHub; verify-repos fails if GitHub says so and this is not set. */
  archived?: boolean;
  /** Required when status is "listed": a person read the README and releases. */
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface RepoSnapshot {
  full_name: string;
  html_url: string;
  archived: boolean;
  fork: boolean;
  created_at: string;
  pushed_at: string;
  stargazers_count: number;
  license: string | null;
  latestRelease: { tag: string; published_at: string } | null;
  flags: string[];
}

export interface SnapshotFile {
  checkedAt: string | null;
  repos: Record<string, RepoSnapshot>;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  kind: "readme" | "release" | "sony-support" | "news" | "forum" | "video";
  accessedAt: string;
}

export type GuideMenu = "packages" | "apps" | "payloads" | "transfer" | "backup" | "emulators";

export interface GuideEntry {
  slug: string;
  menu: GuideMenu;
  requires: { ranges: string[]; hen: boolean };
  repos: string[];
  title: Localized;
  summary: Localized;
  reviewedAt: string;
}

export interface ErrorEntry {
  slug: string;
  /** "high" = risk of losing data. */
  severity: "low" | "medium" | "high";
  title: Localized;
  symptoms: Record<keyof Localized, string[]>;
  sources: string[];
  reviewedAt: string;
}

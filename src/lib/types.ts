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

export type RepoCategory =
  | "exploit"
  | "hen"
  | "loader"
  | "homebrew"
  | "store"
  | "utility"
  | "backup"
  | "research"
  | "package-manager"
  | "payload"
  | "emulator"
  | "guide";
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
  kind: "readme" | "release" | "sony-support" | "news" | "forum" | "video" | "archive";
  accessedAt: string;
}

export type GuideMenu = "jailbreak" | "packages" | "apps" | "payloads" | "transfer" | "backup" | "emulators";

export interface GuideEntry {
  slug: string;
  menu: GuideMenu;
  requires: { ranges: string[]; hen: boolean };
  repos: string[];
  title: Localized;
  summary: Localized;
  reviewedAt: string;
}

export interface FirmwareDownload {
  version: string;
  md5: string;
  mega: string;
  onefichier?: string;
}

export interface FirmwareDownloadsFile {
  source: string;
  sourceTitle: string;
  scrapedAt: string;
  official: FirmwareDownload[];
  recovery: FirmwareDownload[];
}

export type ErrorGroup =
  | "exploit"
  | "autoloader"
  | "compat"
  | "y2jb"
  | "network"
  | "hen"
  | "bdj"
  | "games-mount"
  | "games-run"
  | "saves"
  | "storage"
  | "emulators"
  | "hardware"
  | "codes"
  | "triage";

export interface ErrorEntry {
  slug: string;
  group: ErrorGroup;
  /** "high" = risk of losing data. */
  severity: "low" | "medium" | "high";
  /** Omitted for diagnostic recommendations that are not a documented fix or a user report. */
  evidence?: Evidence;
  title: Localized;
  symptoms: Record<keyof Localized, string[]>;
  sources: string[];
  reviewedAt: string;
}

export interface PresenceResponse {
  online: number;
  visits: number; // all-time page views (one per page load; no identifier stored)
}

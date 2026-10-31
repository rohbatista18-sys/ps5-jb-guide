import errorsFile from "@content/errors.json";
import firmwareFile from "@content/firmware.json";
import firmwareDownloadsFile from "@content/firmwares-downloads.json";
import guidesFile from "@content/guides.json";
import reposFile from "@content/repos.json";
import snapshotFile from "@content/repos.snapshot.json";
import sourcesFile from "@content/sources.json";
import { matchRange } from "./match";
import type {
  ErrorEntry,
  ErrorGroup,
  FirmwareDownloadsFile,
  FirmwareFile,
  GuideEntry,
  GuideMenu,
  RepoEntry,
  RepoSnapshot,
  SnapshotFile,
  Source,
} from "./types";
import { compareVersions, strictVersion } from "./version";

// Everything is a static module import, so it is read once at build time and every page that
// uses it is prerendered. scripts/check-content.mjs has already rejected malformed files.
const firmware = firmwareFile as FirmwareFile;
const fwDownloads = firmwareDownloadsFile as FirmwareDownloadsFile;
const repos = (reposFile as { repos: RepoEntry[] }).repos;
const snapshot = snapshotFile as SnapshotFile;
const sources = (sourcesFile as { sources: Source[] }).sources;
const guides = (guidesFile as { guides: GuideEntry[] }).guides;
const errors = (errorsFile as { errors: ErrorEntry[] }).errors;

export const SNAPSHOT_MAX_AGE_DAYS = 14;

export const getRanges = () =>
  [...firmware.ranges].sort((a, b) => compareVersions(strictVersion(a.min), strictVersion(b.min)));

export const getRange = (id: string) => firmware.ranges.find((r) => r.id === id) ?? null;

export const latestKnownFirmware = () => firmware.latestKnownFirmware;

export const findRange = (input: string) => matchRange(firmware.ranges, firmware.latestKnownFirmware, input);

export interface ListedRepo {
  entry: RepoEntry;
  snapshot: RepoSnapshot;
}

/**
 * When verify-repos last ran. Staleness (older than SNAPSHOT_MAX_AGE_DAYS) is judged in the
 * browser by RepoCard: a server-side Date.now() would freeze at build time in a static page.
 */
export const snapshotCheckedAt = () => snapshot.checkedAt;

/** Only repos a person reviewed ("listed") and that have a snapshot are ever rendered. */
export function getListedRepo(id: string): ListedRepo | null {
  const entry = repos.find((r) => r.id === id);
  const snap = snapshot.repos[id];
  if (!entry || entry.status !== "listed" || !snap) return null;
  return { entry, snapshot: snap };
}

export const getListedRepos = (ids: string[]) =>
  ids.map(getListedRepo).filter((r): r is ListedRepo => r !== null);

export const getListedReposInCategory = (category: RepoEntry["category"]) =>
  getListedRepos(repos.filter((r) => r.category === category).map((r) => r.id));

export const getSource = (id: string) => sources.find((s) => s.id === id) ?? null;

/** Order of the Guides menu and of the sections on /guias. */
export const GUIDE_MENUS: GuideMenu[] = ["jailbreak", "packages", "apps", "payloads", "transfer", "backup", "emulators"];

export const getGuides = () => guides;
export const getGuide = (slug: string) => guides.find((g) => g.slug === slug) ?? null;

/** Order of the topic sections on /erros. */
export const ERROR_GROUPS: ErrorGroup[] = [
  "exploit",
  "autoloader",
  "compat",
  "y2jb",
  "network",
  "hen",
  "bdj",
  "games-mount",
  "games-run",
  "codes",
  "triage",
];

export const getErrors = () => errors;
export const getError = (slug: string) => errors.find((e) => e.slug === slug) ?? null;

export const getFirmwareDownloads = () => fwDownloads;

// PS5 system software versions are "major.minor" with a two-digit minor ("9.60", "13.60").
// Visitors type them loosely ("9.6", "09.60", "9,60"), so parsing normalizes to "X.YY".

export interface Version {
  major: number;
  minor: number;
}

const PATTERN = /^\s*0*(\d{1,2})\s*[.,]\s*(\d{1,2})\s*$/;

export function parseVersion(input: string): Version | null {
  const m = PATTERN.exec(input);
  if (!m) return null;
  const major = Number(m[1]);
  // "9.6" means 9.60, not 9.06: the minor is always shown with two digits.
  const minor = Number(m[2].length === 1 ? `${m[2]}0` : m[2]);
  if (major < 1) return null;
  return { major, minor };
}

export const formatVersion = ({ major, minor }: Version) => `${major}.${String(minor).padStart(2, "0")}`;

export function compareVersions(a: Version, b: Version) {
  return a.major - b.major || a.minor - b.minor;
}

/** Parses a version already stored in content/ (always "X.YY"); throws on bad data. */
export function strictVersion(value: string): Version {
  const v = /^\d{1,2}\.\d{2}$/.test(value) ? parseVersion(value) : null;
  if (!v) throw new Error(`Invalid firmware version in content: "${value}"`);
  return v;
}

export function inRange(v: Version, min: string, max: string) {
  return compareVersions(v, strictVersion(min)) >= 0 && compareVersions(v, strictVersion(max)) <= 0;
}

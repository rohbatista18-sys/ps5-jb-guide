import type { FirmwareRange } from "./types.ts";
import { compareVersions, formatVersion, inRange, parseVersion, strictVersion } from "./version.ts";

export type RangeSummary = Pick<FirmwareRange, "id" | "min" | "max" | "status" | "draft">;

export type FindResult =
  | { kind: "invalid" }
  | { kind: "range"; version: string; range: RangeSummary }
  /** Newer than anything documented: no public method is known. */
  | { kind: "newer"; version: string }
  /** Inside the known span but in a gap the guide does not cover yet. */
  | { kind: "undocumented"; version: string };

// Pure, so the client-side FirmwarePicker can use it without importing content/*.json.
export function matchRange<R extends RangeSummary>(
  ranges: R[],
  latestKnownFirmware: string,
  input: string,
): FindResult {
  const v = parseVersion(input);
  if (!v) return { kind: "invalid" };
  const version = formatVersion(v);
  const range = ranges.find((r) => inRange(v, r.min, r.max));
  if (range) return { kind: "range", version, range };
  if (compareVersions(v, strictVersion(latestKnownFirmware)) > 0) return { kind: "newer", version };
  return { kind: "undocumented", version };
}

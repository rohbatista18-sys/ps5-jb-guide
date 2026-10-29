import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRange } from "./match.ts";

const ranges = [
  { id: "7.00-13.60", min: "7.00", max: "13.60", status: "public" as const },
  { id: "14.00-14.10", min: "14.00", max: "14.10", status: "none" as const },
];

test("matchRange finds the range at both edges", () => {
  for (const v of ["7.0", "13.60", "13,6"]) {
    const r = matchRange(ranges, "14.10", v);
    assert.equal(r.kind === "range" && r.range.id, "7.00-13.60", v);
  }
  const r = matchRange(ranges, "14.10", "14.00");
  assert.equal(r.kind === "range" && r.range.id, "14.00-14.10");
});

test("matchRange separates newer, gaps and garbage", () => {
  assert.deepEqual(matchRange(ranges, "14.10", "14.20"), { kind: "newer", version: "14.20" });
  assert.deepEqual(matchRange(ranges, "14.10", "4.03"), { kind: "undocumented", version: "4.03" });
  assert.deepEqual(matchRange(ranges, "14.10", "nine"), { kind: "invalid" });
});

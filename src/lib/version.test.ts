import { test } from "node:test";
import assert from "node:assert/strict";
import { compareVersions, formatVersion, inRange, parseVersion, strictVersion } from "./version.ts";

test("parseVersion normalizes loose input to X.YY", () => {
  assert.equal(formatVersion(parseVersion("9.6")!), "9.60");
  assert.equal(formatVersion(parseVersion("9.60")!), "9.60");
  assert.equal(formatVersion(parseVersion(" 09.60 ")!), "9.60");
  assert.equal(formatVersion(parseVersion("13,6")!), "13.60");
  assert.equal(formatVersion(parseVersion("14.00")!), "14.00");
  assert.equal(formatVersion(parseVersion("4.03")!), "4.03");
});

test("parseVersion rejects garbage", () => {
  for (const bad of ["", "abc", "9", "9.", ".60", "9.600", "0.50", "1.2.3", "100.00", "-9.60"]) {
    assert.equal(parseVersion(bad), null, bad);
  }
});

test("compareVersions orders by major, then minor", () => {
  assert.ok(compareVersions(parseVersion("13.60")!, parseVersion("14.00")!) < 0);
  assert.ok(compareVersions(parseVersion("9.60")!, parseVersion("10.01")!) < 0);
  assert.equal(compareVersions(parseVersion("7.0")!, parseVersion("7.00")!), 0);
});

test("inRange is inclusive at both ends", () => {
  assert.ok(inRange(parseVersion("7.00")!, "7.00", "13.60"));
  assert.ok(inRange(parseVersion("13.60")!, "7.00", "13.60"));
  assert.ok(!inRange(parseVersion("14.00")!, "7.00", "13.60"));
  assert.ok(!inRange(parseVersion("6.50")!, "7.00", "13.60"));
});

test("strictVersion only accepts the stored X.YY form", () => {
  assert.throws(() => strictVersion("9.6"));
  assert.deepEqual(strictVersion("9.60"), { major: 9, minor: 60 });
});

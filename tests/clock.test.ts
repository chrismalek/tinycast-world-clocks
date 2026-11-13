import test from "node:test";
import assert from "node:assert/strict";
import {
  formatRelativeOffset,
  formatSummarySubtitle,
  formatTime,
  formatUtcOffset,
  getDayDifferenceLabel,
  getUtcOffsetMinutes,
  isDaytime,
} from "../src/clock.ts";
import {
  getAllTimeZoneEntries,
  isValidTimeZone,
  parsePreferenceZones,
  resolveTimeZoneQuery,
} from "../src/zones.ts";

test("isValidTimeZone validates IANA identifiers", () => {
  assert.equal(isValidTimeZone("America/New_York"), true);
  assert.equal(isValidTimeZone("Asia/Tokyo"), true);
  assert.equal(isValidTimeZone("UTC"), true);
  assert.equal(isValidTimeZone("Not/A_Zone"), false);
  assert.equal(isValidTimeZone(""), false);
});

test("resolveTimeZoneQuery resolves cities, abbreviations, and IANA IDs", () => {
  const entries = getAllTimeZoneEntries();
  assert.equal(resolveTimeZoneQuery("sf", entries)?.timeZone, "America/Los_Angeles");
  assert.equal(resolveTimeZoneQuery("tokyo", entries)?.timeZone, "Asia/Tokyo");
  assert.equal(resolveTimeZoneQuery("Europe/London", entries)?.timeZone, "Europe/London");
  assert.equal(resolveTimeZoneQuery("no-such-place-xyz", entries), null);
});

test("parsePreferenceZones parses custom labels and deduplicates IDs", () => {
  const parsed = parsePreferenceZones("HQ=America/New_York, London, Backup HQ=America/New_York, InvalidZone");
  assert.equal(parsed.length, 3);
  assert.deepEqual(parsed[0], { id: "America/New_York", timeZone: "America/New_York", label: "HQ" });
  assert.deepEqual(parsed[1], { id: "Europe/London", timeZone: "Europe/London", label: "London" });
  assert.deepEqual(parsed[2], { id: "America/New_York#2", timeZone: "America/New_York", label: "Backup HQ" });
});

test("UTC offset, relative offset, and day difference calculations", () => {
  // 2026-01-15T22:00:00Z -> New York (UTC-5) is 17:00 same day; Tokyo (UTC+9) is 07:00 next day.
  const date = new Date("2026-01-15T22:00:00Z");

  assert.equal(getUtcOffsetMinutes(date, "UTC"), 0);
  assert.equal(getUtcOffsetMinutes(date, "America/New_York"), -300);
  assert.equal(getUtcOffsetMinutes(date, "Asia/Tokyo"), 540);
  assert.equal(getUtcOffsetMinutes(date, "Asia/Kolkata"), 330);

  assert.equal(formatUtcOffset(0), "UTC");
  assert.equal(formatUtcOffset(-300), "UTC-5");
  assert.equal(formatUtcOffset(330), "UTC+5:30");

  assert.equal(formatRelativeOffset(540, -300), "+14h");
  assert.equal(formatRelativeOffset(330, 0), "+5h30m");
  assert.equal(formatRelativeOffset(-300, -300), "Same");

  assert.equal(getDayDifferenceLabel(date, "Asia/Tokyo", "UTC"), "Tomorrow");
  assert.equal(getDayDifferenceLabel(date, "America/New_York", "UTC"), "Today");
  assert.equal(getDayDifferenceLabel(new Date("2026-01-16T02:00:00Z"), "America/New_York", "UTC"), "Yesterday");

  assert.equal(isDaytime(date, "Asia/Tokyo"), true); // 07:00
  assert.equal(isDaytime(date, "UTC"), false); // 22:00
});

test("formatTime and formatSummarySubtitle format multiple clocks cleanly", () => {
  const date = new Date("2026-01-15T14:30:00Z");
  assert.equal(formatTime(date, "UTC", { timeFormat: "24h", showSeconds: false }), "14:30");
  assert.equal(formatTime(date, "UTC", { timeFormat: "12h", showSeconds: false }), "2:30 PM");

  const summaryDefault12h = formatSummarySubtitle(
    [
      { id: "UTC", timeZone: "UTC", label: "UTC" },
      { id: "Asia/Tokyo", timeZone: "Asia/Tokyo", label: "Tokyo" },
      { id: "America/New_York", timeZone: "America/New_York", label: "NYC" },
    ],
    date,
    { summaryMaxClocks: "2" },
  );
  assert.equal(summaryDefault12h, "UTC 2:30 PM · Tokyo 11:30 PM · +1 more");

  const summary24h = formatSummarySubtitle(
    [
      { id: "UTC", timeZone: "UTC", label: "UTC" },
      { id: "Asia/Tokyo", timeZone: "Asia/Tokyo", label: "Tokyo" },
    ],
    date,
    { clockFormat: "24h", summaryMaxClocks: "4" },
  );
  assert.equal(summary24h, "UTC 14:30 · Tokyo 23:30");
});

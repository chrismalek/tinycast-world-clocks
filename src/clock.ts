import type { ExtensionPreferences, FavoriteClock } from "./types";

export function formatTime(
  date: Date,
  timeZone: string,
  options: { timeFormat: "12h" | "24h"; showSeconds: boolean },
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: options.timeFormat === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: options.showSeconds ? "2-digit" : undefined,
    hour12: options.timeFormat === "12h",
  }).format(date);
}

export function formatShortDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFullDateTime(
  date: Date,
  timeZone: string,
  timeFormat: "12h" | "24h",
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: timeFormat === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: timeFormat === "12h",
    timeZoneName: "short",
  }).format(date);
}

function getDateParts(date: Date, timeZone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const val = parts.find((p) => p.type === type)?.value ?? "0";
    return Number.parseInt(val, 10);
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") === 24 ? 0 : get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function getUtcOffsetMinutes(date: Date, timeZone: string): number {
  const tz = getDateParts(date, timeZone);
  const asUtc = Date.UTC(tz.year, tz.month - 1, tz.day, tz.hour, tz.minute, tz.second);
  const utcSeconds = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUtc - utcSeconds) / 60000);
}

export function formatUtcOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "UTC";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return mins === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`;
}

export function formatRelativeOffset(targetMinutes: number, localMinutes: number): string {
  const diff = targetMinutes - localMinutes;
  if (diff === 0) return "Same";
  const sign = diff > 0 ? "+" : "-";
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (mins === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h${String(mins).padStart(2, "0")}m`;
}

export function getDayDifferenceLabel(
  date: Date,
  timeZone: string,
  localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): "Today" | "Tomorrow" | "Yesterday" | string {
  const target = getDateParts(date, timeZone);
  const local = getDateParts(date, localTimeZone);
  const targetDayUtc = Date.UTC(target.year, target.month - 1, target.day);
  const localDayUtc = Date.UTC(local.year, local.month - 1, local.day);
  const diffDays = Math.round((targetDayUtc - localDayUtc) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return diffDays > 0 ? `+${diffDays}d` : `${diffDays}d`;
}

export function isDaytime(date: Date, timeZone: string): boolean {
  const { hour } = getDateParts(date, timeZone);
  return hour >= 6 && hour < 18;
}

export function formatSummarySubtitle(
  clocks: FavoriteClock[],
  date: Date,
  prefs: Pick<ExtensionPreferences, "timeFormat" | "summaryMaxClocks">,
): string {
  if (clocks.length === 0) {
    return "No favorite clocks — press Return to add time zones";
  }

  const timeFormat = prefs.timeFormat === "24h" ? "24h" : "12h";
  const parsedMax = Number.parseInt(prefs.summaryMaxClocks ?? "4", 10);
  const maxClocks = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 4;

  const visible = clocks.slice(0, maxClocks);
  const parts = visible.map((clock) => {
    const time = formatTime(date, clock.timeZone, { timeFormat, showSeconds: false });
    return `${clock.label} ${time}`;
  });

  if (clocks.length > maxClocks) {
    parts.push(`+${clocks.length - maxClocks} more`);
  }

  return parts.join(" · ");
}

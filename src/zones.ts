import type { FavoriteClock, TimeZoneEntry } from "./types";

interface CuratedZone {
  timeZone: string;
  city: string;
  aliases: string[];
}

const CURATED_ZONES: CuratedZone[] = [
  { timeZone: "UTC", city: "UTC", aliases: ["utc", "gmt", "coordinated universal time", "zulu"] },
  { timeZone: "America/Los_Angeles", city: "San Francisco / Los Angeles", aliases: ["sf", "la", "pst", "pdt", "pacific", "seattle", "silicon valley"] },
  { timeZone: "America/Denver", city: "Denver", aliases: ["mst", "mdt", "mountain", "boulder", "salt lake city"] },
  { timeZone: "America/Phoenix", city: "Phoenix", aliases: ["arizona", "mst"] },
  { timeZone: "America/Chicago", city: "Chicago", aliases: ["cst", "cdt", "central", "austin", "dallas", "houston"] },
  { timeZone: "America/New_York", city: "New York", aliases: ["nyc", "ny", "est", "edt", "eastern", "boston", "miami", "washington", "dc", "atlanta"] },
  { timeZone: "America/Toronto", city: "Toronto", aliases: ["canada", "est", "edt", "montreal", "ottawa"] },
  { timeZone: "America/Vancouver", city: "Vancouver", aliases: ["canada", "pacific", "pst", "pdt"] },
  { timeZone: "America/Anchorage", city: "Anchorage", aliases: ["alaska", "akst", "akdt"] },
  { timeZone: "Pacific/Honolulu", city: "Honolulu", aliases: ["hawaii", "hst"] },
  { timeZone: "America/Mexico_City", city: "Mexico City", aliases: ["cdmx", "mexico"] },
  { timeZone: "America/Bogota", city: "Bogota", aliases: ["colombia"] },
  { timeZone: "America/Lima", city: "Lima", aliases: ["peru"] },
  { timeZone: "America/Santiago", city: "Santiago", aliases: ["chile"] },
  { timeZone: "America/Sao_Paulo", city: "Sao Paulo", aliases: ["brazil", "rio", "brt"] },
  { timeZone: "America/Argentina/Buenos_Aires", city: "Buenos Aires", aliases: ["argentina", "art"] },
  { timeZone: "Europe/London", city: "London", aliases: ["uk", "britain", "england", "ldn", "gmt", "bst"] },
  { timeZone: "Europe/Dublin", city: "Dublin", aliases: ["ireland", "ist", "gmt"] },
  { timeZone: "Europe/Lisbon", city: "Lisbon", aliases: ["portugal", "wet"] },
  { timeZone: "Atlantic/Reykjavik", city: "Reykjavik", aliases: ["iceland", "gmt"] },
  { timeZone: "Europe/Paris", city: "Paris", aliases: ["france", "cet", "cest"] },
  { timeZone: "Europe/Berlin", city: "Berlin", aliases: ["germany", "munich", "frankfurt", "cet", "cest"] },
  { timeZone: "Europe/Amsterdam", city: "Amsterdam", aliases: ["netherlands", "holland", "cet", "cest"] },
  { timeZone: "Europe/Brussels", city: "Brussels", aliases: ["belgium", "cet", "cest"] },
  { timeZone: "Europe/Zurich", city: "Zurich", aliases: ["switzerland", "geneva", "cet", "cest"] },
  { timeZone: "Europe/Madrid", city: "Madrid", aliases: ["spain", "barcelona", "cet", "cest"] },
  { timeZone: "Europe/Rome", city: "Rome", aliases: ["italy", "milan", "cet", "cest"] },
  { timeZone: "Europe/Vienna", city: "Vienna", aliases: ["austria", "cet", "cest"] },
  { timeZone: "Europe/Stockholm", city: "Stockholm", aliases: ["sweden", "cet", "cest"] },
  { timeZone: "Europe/Oslo", city: "Oslo", aliases: ["norway", "cet", "cest"] },
  { timeZone: "Europe/Copenhagen", city: "Copenhagen", aliases: ["denmark", "cet", "cest"] },
  { timeZone: "Europe/Warsaw", city: "Warsaw", aliases: ["poland", "cet", "cest"] },
  { timeZone: "Europe/Prague", city: "Prague", aliases: ["czechia", "czech", "cet", "cest"] },
  { timeZone: "Europe/Athens", city: "Athens", aliases: ["greece", "eet", "eest"] },
  { timeZone: "Europe/Helsinki", city: "Helsinki", aliases: ["finland", "eet", "eest"] },
  { timeZone: "Europe/Bucharest", city: "Bucharest", aliases: ["romania", "eet", "eest"] },
  { timeZone: "Europe/Kyiv", city: "Kyiv", aliases: ["ukraine", "eet", "eest"] },
  { timeZone: "Europe/Istanbul", city: "Istanbul", aliases: ["turkey", "trt"] },
  { timeZone: "Europe/Moscow", city: "Moscow", aliases: ["russia", "msk"] },
  { timeZone: "Africa/Cairo", city: "Cairo", aliases: ["egypt", "eet"] },
  { timeZone: "Africa/Casablanca", city: "Casablanca", aliases: ["morocco"] },
  { timeZone: "Africa/Lagos", city: "Lagos", aliases: ["nigeria", "wat"] },
  { timeZone: "Africa/Nairobi", city: "Nairobi", aliases: ["kenya", "eat"] },
  { timeZone: "Africa/Johannesburg", city: "Johannesburg", aliases: ["south africa", "cape town", "sast"] },
  { timeZone: "Asia/Jerusalem", city: "Jerusalem / Tel Aviv", aliases: ["israel", "tlv", "ist"] },
  { timeZone: "Asia/Riyadh", city: "Riyadh", aliases: ["saudi arabia", "ast"] },
  { timeZone: "Asia/Dubai", city: "Dubai", aliases: ["uae", "abu dhabi", "gst"] },
  { timeZone: "Asia/Karachi", city: "Karachi", aliases: ["pakistan", "pkt"] },
  { timeZone: "Asia/Kolkata", city: "Mumbai / Bengaluru / Delhi", aliases: ["india", "ist", "bangalore", "chennai", "hyderabad", "kolkata"] },
  { timeZone: "Asia/Kathmandu", city: "Kathmandu", aliases: ["nepal", "npt"] },
  { timeZone: "Asia/Dhaka", city: "Dhaka", aliases: ["bangladesh", "bst"] },
  { timeZone: "Asia/Bangkok", city: "Bangkok", aliases: ["thailand", "ict"] },
  { timeZone: "Asia/Ho_Chi_Minh", city: "Ho Chi Minh City", aliases: ["vietnam", "saigon", "hanoi"] },
  { timeZone: "Asia/Jakarta", city: "Jakarta", aliases: ["indonesia", "wib"] },
  { timeZone: "Asia/Singapore", city: "Singapore", aliases: ["sg", "sgt"] },
  { timeZone: "Asia/Kuala_Lumpur", city: "Kuala Lumpur", aliases: ["malaysia", "myt"] },
  { timeZone: "Asia/Manila", city: "Manila", aliases: ["philippines", "pht"] },
  { timeZone: "Asia/Hong_Kong", city: "Hong Kong", aliases: ["hk", "hkt"] },
  { timeZone: "Asia/Taipei", city: "Taipei", aliases: ["taiwan", "cst"] },
  { timeZone: "Asia/Shanghai", city: "Shanghai / Beijing", aliases: ["china", "cst", "shenzhen"] },
  { timeZone: "Asia/Seoul", city: "Seoul", aliases: ["korea", "south korea", "kst"] },
  { timeZone: "Asia/Tokyo", city: "Tokyo", aliases: ["japan", "osaka", "kyoto", "jst"] },
  { timeZone: "Australia/Perth", city: "Perth", aliases: ["australia", "awst"] },
  { timeZone: "Australia/Adelaide", city: "Adelaide", aliases: ["australia", "acst"] },
  { timeZone: "Australia/Brisbane", city: "Brisbane", aliases: ["australia", "aest"] },
  { timeZone: "Australia/Sydney", city: "Sydney", aliases: ["australia", "melbourne", "aest", "aedt"] },
  { timeZone: "Australia/Melbourne", city: "Melbourne", aliases: ["australia", "aest", "aedt"] },
  { timeZone: "Pacific/Auckland", city: "Auckland", aliases: ["new zealand", "nz", "nzst", "nzdt", "wellington"] },
  { timeZone: "Pacific/Fiji", city: "Fiji", aliases: ["suva", "fjt"] },
];

export const FALLBACK_FAVORITES: FavoriteClock[] = [
  { id: "America/New_York", timeZone: "America/New_York", label: "New York" },
  { id: "Europe/London", timeZone: "Europe/London", label: "London" },
  { id: "Asia/Tokyo", timeZone: "Asia/Tokyo", label: "Tokyo" },
];

export function isValidTimeZone(timeZone: string): boolean {
  const trimmed = timeZone.trim();
  if (!trimmed) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function cityNameFromTimeZone(timeZone: string): string {
  const curated = CURATED_ZONES.find((z) => z.timeZone === timeZone);
  if (curated) return curated.city;
  const parts = timeZone.split("/");
  const leaf = parts[parts.length - 1] ?? timeZone;
  return leaf.replace(/_/g, " ");
}

export function regionFromTimeZone(timeZone: string): string {
  if (timeZone === "UTC" || timeZone === "GMT") return "UTC";
  const prefix = timeZone.split("/")[0] ?? "Other";
  if (prefix === "Australia" || prefix === "Pacific") return "Pacific / Oceania";
  return prefix;
}

export function getAllTimeZoneEntries(): TimeZoneEntry[] {
  const curatedMap = new Map<string, CuratedZone>();
  for (const item of CURATED_ZONES) {
    if (isValidTimeZone(item.timeZone)) {
      curatedMap.set(item.timeZone, item);
    }
  }

  let allIds: string[] = [];
  const intlWithSupported = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  if (typeof intlWithSupported.supportedValuesOf === "function") {
    try {
      allIds = intlWithSupported.supportedValuesOf("timeZone");
    } catch {
      allIds = [];
    }
  }
  if (!allIds.includes("UTC")) {
    allIds = ["UTC", ...allIds];
  }
  for (const curated of CURATED_ZONES) {
    if (!allIds.includes(curated.timeZone) && isValidTimeZone(curated.timeZone)) {
      allIds.push(curated.timeZone);
    }
  }

  const entries: TimeZoneEntry[] = [];
  for (const tz of allIds) {
    const curated = curatedMap.get(tz);
    const city = curated?.city ?? cityNameFromTimeZone(tz);
    const region = regionFromTimeZone(tz);
    const aliases = curated?.aliases ?? [];
    entries.push({
      id: tz,
      timeZone: tz,
      city,
      region,
      aliases,
    });
  }

  // Put curated zones first (in curated order), then remaining IANA zones alphabetically by city.
  const curatedOrder = new Map<string, number>();
  CURATED_ZONES.forEach((z, index) => curatedOrder.set(z.timeZone, index));

  return entries.sort((a, b) => {
    const aOrder = curatedOrder.get(a.timeZone);
    const bOrder = curatedOrder.get(b.timeZone);
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    return a.city.localeCompare(b.city);
  });
}

/**
 * Resolves either an exact IANA ID (case-insensitive) or a city/alias query to a valid IANA time zone.
 */
export function resolveTimeZoneQuery(input: string, entries = getAllTimeZoneEntries()): TimeZoneEntry | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Direct IANA validation first (supports Etc/GMT+5, America/New_York, etc.)
  if (isValidTimeZone(trimmed)) {
    const existing = entries.find((e) => e.timeZone.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    return {
      id: trimmed,
      timeZone: trimmed,
      city: cityNameFromTimeZone(trimmed),
      region: regionFromTimeZone(trimmed),
      aliases: [],
    };
  }

  const lower = trimmed.toLowerCase();

  // 2. Exact match on city or alias
  for (const entry of entries) {
    if (entry.city.toLowerCase() === lower) return entry;
    if (entry.aliases.some((alias) => alias.toLowerCase() === lower)) return entry;
  }

  // 3. Partial match on city, IANA ID, or alias
  for (const entry of entries) {
    if (
      entry.city.toLowerCase().includes(lower) ||
      entry.timeZone.toLowerCase().includes(lower) ||
      entry.aliases.some((alias) => alias.toLowerCase().includes(lower))
    ) {
      return entry;
    }
  }

  return null;
}

/**
 * Parses comma-separated preference strings such as:
 * "New York=America/New_York, London, Tokyo=Asia/Tokyo"
 */
export function parsePreferenceZones(raw: string | undefined): FavoriteClock[] {
  if (!raw || !raw.trim()) return [];
  const entries = getAllTimeZoneEntries();
  const result: FavoriteClock[] = [];
  const seenIds = new Set<string>();

  for (const chunk of raw.split(",")) {
    const item = chunk.trim();
    if (!item) continue;

    let label: string | undefined;
    let query = item;
    const eqIdx = item.indexOf("=");
    if (eqIdx > 0) {
      label = item.slice(0, eqIdx).trim();
      query = item.slice(eqIdx + 1).trim();
    }

    const resolved = resolveTimeZoneQuery(query, entries);
    if (!resolved) continue;

    const finalLabel = label && label.length > 0 ? label : resolved.city;
    let id = resolved.timeZone;
    if (seenIds.has(id)) {
      let suffix = 2;
      while (seenIds.has(`${resolved.timeZone}#${suffix}`)) suffix += 1;
      id = `${resolved.timeZone}#${suffix}`;
    }
    seenIds.add(id);

    result.push({
      id,
      timeZone: resolved.timeZone,
      label: finalLabel,
    });
  }

  return result;
}

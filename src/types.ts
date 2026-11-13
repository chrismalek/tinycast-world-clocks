export interface FavoriteClock {
  /** Stable identifier (defaults to the IANA time zone ID, or unique ID if duplicated with a custom label). */
  id: string;
  /** Valid IANA time zone identifier, e.g. "America/New_York". */
  timeZone: string;
  /** Display label shown in the list and Favorites summary, e.g. "New York" or "HQ". */
  label: string;
}

export interface TimeZoneEntry {
  id: string;
  timeZone: string;
  city: string;
  region: string;
  aliases: string[];
}

export interface ExtensionPreferences {
  defaultZones?: string;
  timeFormat?: "12h" | "24h";
  showSeconds?: boolean;
  showUtcOffset?: boolean;
  showDayDiff?: boolean;
  summaryMaxClocks?: string;
}

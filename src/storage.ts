import { LocalStorage } from "@raycast/api";
import type { ExtensionPreferences, FavoriteClock } from "./types";
import { FALLBACK_FAVORITES, isValidTimeZone, parsePreferenceZones } from "./zones";

const STORAGE_KEY = "favorite-clocks-v1";

export async function loadFavoriteClocks(prefs: ExtensionPreferences): Promise<FavoriteClock[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is FavoriteClock =>
            Boolean(
              item &&
                typeof item.id === "string" &&
                typeof item.timeZone === "string" &&
                typeof item.label === "string" &&
                isValidTimeZone(item.timeZone),
            ),
        );
      }
    } catch {
      // Fall through to seeding if stored JSON was corrupted.
    }
  }

  const seeded = parsePreferenceZones(prefs.defaultZones);
  const initial = seeded.length > 0 ? seeded : FALLBACK_FAVORITES;
  await saveFavoriteClocks(initial);
  return initial;
}

export async function saveFavoriteClocks(clocks: FavoriteClock[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(clocks));
}

export function addFavoriteClock(
  clocks: FavoriteClock[],
  timeZone: string,
  label: string,
): FavoriteClock[] {
  const cleanLabel = label.trim() || timeZone;
  let id = timeZone;
  if (clocks.some((c) => c.id === id)) {
    let suffix = 2;
    while (clocks.some((c) => c.id === `${timeZone}#${suffix}`)) suffix += 1;
    id = `${timeZone}#${suffix}`;
  }
  return [...clocks, { id, timeZone, label: cleanLabel }];
}

export function removeFavoriteClock(clocks: FavoriteClock[], id: string): FavoriteClock[] {
  return clocks.filter((c) => c.id !== id);
}

export function renameFavoriteClock(
  clocks: FavoriteClock[],
  id: string,
  newLabel: string,
): FavoriteClock[] {
  const trimmed = newLabel.trim();
  if (!trimmed) return clocks;
  return clocks.map((c) => (c.id === id ? { ...c, label: trimmed } : c));
}

export function moveFavoriteClock(
  clocks: FavoriteClock[],
  id: string,
  direction: -1 | 1,
): FavoriteClock[] {
  const index = clocks.findIndex((c) => c.id === id);
  if (index === -1) return clocks;
  const target = index + direction;
  if (target < 0 || target >= clocks.length) return clocks;
  const next = [...clocks];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

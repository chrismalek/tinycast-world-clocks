import {
  Action,
  ActionPanel,
  Color,
  Form,
  Icon,
  Keyboard,
  LaunchType,
  List,
  Toast,
  getPreferenceValues,
  launchCommand,
  openExtensionPreferences,
  showToast,
  updateCommandMetadata,
  useNavigation,
} from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatFullDateTime,
  formatRelativeOffset,
  formatShortDate,
  formatSummarySubtitle,
  formatTime,
  formatUtcOffset,
  getDayDifferenceLabel,
  getUtcOffsetMinutes,
  isDaytime,
} from "./clock";
import {
  addFavoriteClock,
  loadFavoriteClocks,
  moveFavoriteClock,
  removeFavoriteClock,
  renameFavoriteClock,
  saveFavoriteClocks,
} from "./storage";
import type { ExtensionPreferences, FavoriteClock, TimeZoneEntry } from "./types";
import { getAllTimeZoneEntries, parsePreferenceZones } from "./zones";

function ClockLabelForm({
  title,
  initialLabel,
  timeZone,
  submitTitle,
  onSave,
}: {
  title: string;
  initialLabel: string;
  timeZone: string;
  submitTitle: string;
  onSave: (label: string) => Promise<void>;
}) {
  const { pop } = useNavigation();
  const [label, setLabel] = useState(initialLabel);

  return (
    <Form
      navigationTitle={title}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={submitTitle}
            icon={Icon.Check}
            onSubmit={async () => {
              await onSave(label.trim() || initialLabel);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="Time Zone" text={timeZone} />
      <Form.TextField
        id="label"
        title="Custom Label"
        placeholder="e.g. HQ, Tokyo Team, Mom"
        value={label}
        onChange={setLabel}
        autoFocus
      />
    </Form>
  );
}

export default function WorldClocksCommand() {
  const prefs = useMemo(() => getPreferenceValues<ExtensionPreferences>(), []);
  const timeFormat = prefs.timeFormat === "12h" ? "12h" : "24h";
  const showSeconds = Boolean(prefs.showSeconds);
  const showUtcOffset = prefs.showUtcOffset !== false;
  const showDayDiff = prefs.showDayDiff !== false;

  const [favorites, setFavorites] = useState<FavoriteClock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [now, setNow] = useState<Date>(() => new Date());

  const allZones = useMemo(() => getAllTimeZoneEntries(), []);
  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const z of allZones) set.add(z.region);
    return Array.from(set).sort();
  }, [allZones]);

  const localTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const localOffsetMinutes = useMemo(
    () => getUtcOffsetMinutes(now, localTimeZone),
    [now, localTimeZone],
  );

  const syncSummaryMetadata = useCallback(
    async (nextFavorites: FavoriteClock[]) => {
      const summary = formatSummarySubtitle(nextFavorites, new Date(), prefs);
      await updateCommandMetadata({ subtitle: summary }).catch(() => {});
      await launchCommand({ name: "favorite-clocks", type: LaunchType.Background }).catch(() => {});
    },
    [prefs],
  );

  useEffect(() => {
    let active = true;
    loadFavoriteClocks(prefs).then((loaded) => {
      if (!active) return;
      setFavorites(loaded);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [prefs]);

  useEffect(() => {
    const intervalMs = showSeconds ? 1000 : 15000;
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [showSeconds]);

  const persistFavorites = useCallback(
    async (next: FavoriteClock[], toastTitle?: string) => {
      setFavorites(next);
      await saveFavoriteClocks(next);
      await syncSummaryMetadata(next);
      if (toastTitle) {
        await showToast({ style: Toast.Style.Success, title: toastTitle });
      }
    },
    [syncSummaryMetadata],
  );

  const handleAddFavorite = useCallback(
    async (entry: TimeZoneEntry, customLabel?: string) => {
      const label = customLabel?.trim() || entry.city;
      const next = addFavoriteClock(favorites, entry.timeZone, label);
      await persistFavorites(next, `Added ${label} to Favorites`);
    },
    [favorites, persistFavorites],
  );

  const handleRemoveFavorite = useCallback(
    async (clock: FavoriteClock) => {
      const next = removeFavoriteClock(favorites, clock.id);
      await persistFavorites(next, `Removed ${clock.label}`);
    },
    [favorites, persistFavorites],
  );

  const handleRenameFavorite = useCallback(
    async (clock: FavoriteClock, newLabel: string) => {
      const next = renameFavoriteClock(favorites, clock.id, newLabel);
      await persistFavorites(next, `Renamed to ${newLabel}`);
    },
    [favorites, persistFavorites],
  );

  const handleMoveFavorite = useCallback(
    async (clock: FavoriteClock, direction: -1 | 1) => {
      const next = moveFavoriteClock(favorites, clock.id, direction);
      await persistFavorites(next);
    },
    [favorites, persistFavorites],
  );

  const handleSyncFromPreferences = useCallback(async () => {
    const parsed = parsePreferenceZones(prefs.defaultZones);
    if (parsed.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No valid zones in Default Time Zones preference",
        message: "Check Settings → Extensions → World Clocks",
      });
      return;
    }
    await persistFavorites(parsed, `Imported ${parsed.length} favorite clock(s)`);
  }, [prefs.defaultZones, persistFavorites]);

  const favoriteZoneSet = useMemo(() => new Set(favorites.map((f) => f.timeZone)), [favorites]);

  const filteredZones = useMemo(() => {
    if (regionFilter === "favorites") return [];
    if (regionFilter === "all") return allZones;
    return allZones.filter((z) => z.region === regionFilter);
  }, [allZones, regionFilter]);

  const buildClockAccessories = (timeZone: string): List.Item.Accessory[] => {
    const targetMinutes = getUtcOffsetMinutes(now, timeZone);
    const relative = formatRelativeOffset(targetMinutes, localOffsetMinutes);
    const dayDiff = getDayDifferenceLabel(now, timeZone, localTimeZone);
    const utcOffset = formatUtcOffset(targetMinutes);
    const formattedTime = formatTime(now, timeZone, { timeFormat, showSeconds });

    const accessories: List.Item.Accessory[] = [];
    if (showDayDiff && dayDiff !== "Today") {
      accessories.push({
        tag: {
          value: dayDiff,
          color: dayDiff === "Tomorrow" ? Color.Blue : Color.Orange,
        },
      });
    }
    if (showUtcOffset) {
      accessories.push({ text: utcOffset });
    }
    accessories.push({ text: relative });
    accessories.push({
      tag: {
        value: formattedTime,
        color: Color.PrimaryText,
      },
    });
    return accessories;
  };

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search cities, abbreviations (SF, NYC, IST), or IANA zones..."
      searchBarAccessory={
        <List.Dropdown tooltip="Filter Region" value={regionFilter} onChange={setRegionFilter}>
          <List.Dropdown.Item title="All Regions" value="all" />
          <List.Dropdown.Item title="Favorites Only" value="favorites" />
          <List.Dropdown.Section title="Regions">
            {regions.map((region) => (
              <List.Dropdown.Item key={region} title={region} value={region} />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      <List.Section title="Favorites" subtitle={`${favorites.length}`}>
        {favorites.map((clock, index) => {
          const day = isDaytime(now, clock.timeZone);
          const timeText = formatTime(now, clock.timeZone, { timeFormat, showSeconds });
          const fullText = formatFullDateTime(now, clock.timeZone, timeFormat);
          const shortDate = formatShortDate(now, clock.timeZone);
          const utcOffset = formatUtcOffset(getUtcOffsetMinutes(now, clock.timeZone));

          return (
            <List.Item
              key={`fav-${clock.id}`}
              id={`fav-${clock.id}`}
              icon={{
                source: day ? Icon.Sun : Icon.Moon,
                tintColor: day ? Color.Yellow : Color.Purple,
              }}
              title={clock.label}
              subtitle={`${clock.timeZone} · ${shortDate}`}
              keywords={[clock.label, clock.timeZone, "favorite", "pinned"]}
              accessories={buildClockAccessories(clock.timeZone)}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Copy">
                    <Action.CopyToClipboard
                      title="Copy Time"
                      content={`${clock.label}: ${timeText} (${utcOffset})`}
                    />
                    <Action.CopyToClipboard
                      title="Copy Full Date & Time"
                      content={`${clock.label}: ${fullText}`}
                      shortcut={Keyboard.Shortcut.Common.Copy}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="Manage Favorite">
                    <Action.Push
                      title="Rename Label"
                      icon={Icon.Pencil}
                      shortcut={Keyboard.Shortcut.Common.Edit}
                      target={
                        <ClockLabelForm
                          title="Rename Favorite Clock"
                          initialLabel={clock.label}
                          timeZone={clock.timeZone}
                          submitTitle="Save Label"
                          onSave={(newLabel) => handleRenameFavorite(clock, newLabel)}
                        />
                      }
                    />
                    {index > 0 && (
                      <Action
                        title="Move Up"
                        icon={Icon.ArrowUp}
                        shortcut={Keyboard.Shortcut.Common.MoveUp}
                        onAction={() => handleMoveFavorite(clock, -1)}
                      />
                    )}
                    {index < favorites.length - 1 && (
                      <Action
                        title="Move Down"
                        icon={Icon.ArrowDown}
                        shortcut={Keyboard.Shortcut.Common.MoveDown}
                        onAction={() => handleMoveFavorite(clock, 1)}
                      />
                    )}
                    <Action
                      title="Remove from Favorites"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      shortcut={Keyboard.Shortcut.Common.Remove}
                      onAction={() => handleRemoveFavorite(clock)}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="Settings">
                    <Action
                      title="Import Favorites from Preferences"
                      icon={Icon.ArrowClockwise}
                      onAction={handleSyncFromPreferences}
                    />
                    <Action
                      title="Open Extension Preferences"
                      icon={Icon.Gear}
                      shortcut={{ modifiers: ["cmd"], key: "," }}
                      onAction={openExtensionPreferences}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      {regionFilter !== "favorites" && (
        <List.Section title="All Time Zones" subtitle={`${filteredZones.length}`}>
          {filteredZones.map((entry) => {
            const isFav = favoriteZoneSet.has(entry.timeZone);
            const day = isDaytime(now, entry.timeZone);
            const timeText = formatTime(now, entry.timeZone, { timeFormat, showSeconds });
            const fullText = formatFullDateTime(now, entry.timeZone, timeFormat);
            const shortDate = formatShortDate(now, entry.timeZone);
            const utcOffset = formatUtcOffset(getUtcOffsetMinutes(now, entry.timeZone));

            return (
              <List.Item
                key={entry.id}
                id={`zone-${entry.id}`}
                icon={{
                  source: isFav ? Icon.Star : day ? Icon.Sun : Icon.Moon,
                  tintColor: isFav ? Color.Yellow : day ? Color.Orange : Color.SecondaryText,
                }}
                title={entry.city}
                subtitle={`${entry.timeZone} · ${shortDate}`}
                keywords={[entry.city, entry.timeZone, entry.region, ...entry.aliases]}
                accessories={buildClockAccessories(entry.timeZone)}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section title="Favorites">
                      <Action
                        title={isFav ? "Add Duplicate Favorite" : "Add to Favorites"}
                        icon={Icon.Star}
                        onAction={() => handleAddFavorite(entry)}
                      />
                      <Action.Push
                        title="Add to Favorites with Custom Label…"
                        icon={Icon.Pencil}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
                        target={
                          <ClockLabelForm
                            title="Add Favorite Clock"
                            initialLabel={entry.city}
                            timeZone={entry.timeZone}
                            submitTitle="Add Favorite"
                            onSave={(label) => handleAddFavorite(entry, label)}
                          />
                        }
                      />
                    </ActionPanel.Section>
                    <ActionPanel.Section title="Copy">
                      <Action.CopyToClipboard
                        title="Copy Time"
                        content={`${entry.city}: ${timeText} (${utcOffset})`}
                      />
                      <Action.CopyToClipboard
                        title="Copy Full Date & Time"
                        content={`${entry.city}: ${fullText}`}
                        shortcut={Keyboard.Shortcut.Common.Copy}
                      />
                    </ActionPanel.Section>
                    <ActionPanel.Section title="Settings">
                      <Action
                        title="Import Favorites from Preferences"
                        icon={Icon.ArrowClockwise}
                        onAction={handleSyncFromPreferences}
                      />
                      <Action
                        title="Open Extension Preferences"
                        icon={Icon.Gear}
                        shortcut={{ modifiers: ["cmd"], key: "," }}
                        onAction={openExtensionPreferences}
                      />
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}

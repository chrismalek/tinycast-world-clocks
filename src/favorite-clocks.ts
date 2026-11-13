import {
  environment,
  getPreferenceValues,
  launchCommand,
  LaunchType,
  showHUD,
  updateCommandMetadata,
} from "@raycast/api";
import { formatSummarySubtitle } from "./clock";
import { loadFavoriteClocks } from "./storage";
import type { ExtensionPreferences } from "./types";

export default async function Command() {
  const prefs = getPreferenceValues<ExtensionPreferences>();
  const clocks = await loadFavoriteClocks(prefs);
  const subtitle = formatSummarySubtitle(clocks, new Date(), prefs);

  await updateCommandMetadata({ subtitle });

  if (environment.launchType === LaunchType.UserInitiated) {
    try {
      await launchCommand({ name: "world-clocks", type: LaunchType.UserInitiated });
    } catch {
      await showHUD(subtitle);
    }
  }
}

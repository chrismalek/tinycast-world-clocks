# Tinycast World Clocks

A customizable World Clocks extension for [Tinycast](https://github.com/abue-ammar/tinycast) (and Raycast) with favorite time zones and a live-updating launcher Favorites summary.

## Features

- **World Clocks (`world-clocks`)**: Search any IANA time zone, city, or common abbreviation (`SF`, `NYC`, `LDN`, `IST`, `JST`, `UTC`, etc.) with a pinned **Favorites** section at the top.
- **Customizable Favorites**:
  - Add/remove favorites from the list
  - Give any favorite a custom label (e.g., `HQ`, `Tokyo Team`, `Mom`)
  - Reorder favorites (`⌘⇧↑` / `⌘⇧↓`)
  - Filter by region (`All Regions`, `Favorites Only`, `America`, `Europe`, `Asia`, `Pacific / Oceania`, `Africa`, `UTC`)
- **Tinycast Favorites Summary (`favorite-clocks`)**:
  - A `no-view` command with `interval: "1m"` that updates its launcher subtitle every minute (e.g. `New York 19:06 · London 00:06 · Tokyo 09:06`)
  - Pin **Favorite Clocks** to Tinycast's root Favorites (`⇧⌘F`) so your configured time zones are visible right when you open Tinycast
  - Pressing `Return` (or its `⌘1`–`⌘0` favorite slot) on **Favorite Clocks** opens the full **World Clocks** view
- **Extension Preferences**:
  - Seed / import comma-separated time zones (`New York=America/New_York, London=Europe/London, Tokyo=Asia/Tokyo`)
  - Toggle 12h / 24h time format, seconds, UTC offsets, day-difference tags (`Tomorrow` / `Yesterday`), and summary clock count

## Installing in Tinycast

1. Make sure extensions are enabled in **Tinycast → Settings → Extensions**.
2. Choose **Install New → Install from GitHub** and enter `chrismalek/tinycast-world-clocks`, **or** build locally (`npm install && npm run build`) and use **Add from folder**.
3. Open **Favorite Clocks** once (or enable **Background Refresh** under **Settings → Extensions → World Clocks → Favorite Clocks**) so its subtitle updates every minute.
4. Select **Favorite Clocks** in the Tinycast launcher and press `⇧⌘F` (or `⌘K → Add to Favorites`) to pin it to your Tinycast Favorites.

## Development & Customization

Edit [`src/zones.ts`](src/zones.ts) to add custom city aliases or default favorites, or customize display formatting in [`src/clock.ts`](src/clock.ts) and [`src/world-clocks.tsx`](src/world-clocks.tsx).

```bash
npm install
npm run lint
npm test
npm run build
```

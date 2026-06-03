# KALA-KALA — Ohuhu Marker Tracker

## ⚠️ Assistant Rules (read first)
- **NEVER delete any file without explicit user confirmation first.**
- Only modify files that are directly required by the requested feature or fix.
- After making changes, update this file if anything architecturally relevant changed.
- **WHEN MULTIPLE FILES ARE CHANGED: present all changed files together in a single `present_files` call in the same reply. This renders multiple download cards. No exceptions.**

## Project Overview
A React PWA (Vite) for tracking a user's Ohuhu alcohol marker collection. Intended to be wrapped in Capacitor for Android. No backend — all state in localStorage.

## Tech Stack
- React 18 + Vite
- No UI library — all styles are inline
- Font: Nunito (Google Fonts, loaded in `index.html`)
- Storage: localStorage via `src/hooks/useOwnership.js`
- Dev: `run-dev.bat` starts Vite dev server on Windows

## Project Structure
```
kala-kala/
├── index.html
├── vite.config.js
├── package.json
├── run-dev.bat                      ← Windows dev server launcher
├── claude.md                        ← this file
└── src/
    ├── main.jsx
    ├── App.jsx                      ← shell, nav, routing, swipe gestures
    ├── data/
    │   ├── colors.js                ← AUTO-GENERATED from CSV (365 colors)
    │   └── honolulu-sets.js         ← AUTO-GENERATED from CSV (96 bundles)
    ├── components/
    │   ├── ColorSwatch.jsx          ← square swatch with code + legacy code
    │   └── ColorDetailModal.jsx     ← popup: own/wish per series + "Found In" sets
    ├── hooks/
    │   └── useOwnership.js          ← localStorage persistence
    ├── pages/
    │   ├── MyColorsPage.jsx         ← full color list, search, tabs, grid
    │   ├── MyMarkersPage.jsx        ← series cards, chip grid, completion %
    │   └── RecommendedPage.jsx      ← retail bundle browser
    └── utils/
        └── colorUtils.js            ← getLegacyDisplay, getSeriesForColor
```

> `.bak` files (`ColorDetailModal.jsx.bak`, `MyMarkersPage.jsx.bak`) are historical snapshots — do not edit or delete them without asking.

## Data Files (AUTO-GENERATED — do not edit manually)

### `src/data/colors.js`
Generated from `Ohuhu_Ultimate_Database_-_Color_List.csv`.
To update: user provides new CSV, developer runs the parser script (see below).

Each color object:
```js
{
  sort: 1,                  // from SORT column — used for display order
  name: "Lemon Mist",
  code: "Y00",
  hex: "fdfcee",            // no leading #
  legacy: {
    honolulu: { name: "Primrose", code: "Y010" },  // or null
    oahu: null,
    kaala: null,
  }
}
```

### `src/data/honolulu-sets.js`
Generated from `Ohuhu_Ultimate_Database_-_Honolulu.csv`.
To update: user provides new CSV, developer regenerates.

Each bundle object:
```js
{
  id: "honolulu_bundle_0",
  name: "Honolulu 320",
  series: "Honolulu",           // groups cards on My Markers page
  edition: "Black Case",        // or null
  version: "Version 1",         // or null
  count: 320,
  tipType: "Brush / Chisel",
  colors: ["Y00", "Y02", ...]   // color codes in this bundle
}
```

Future series files to add (not yet available):
- `src/data/oahu-sets.js`
- `src/data/kaala-sets.js`

## Ownership Model
Stored in localStorage key `kala-kala-ownership`.

```js
// ownership[colorCode][seriesName] = 'owned' | 'wishlist' | undefined
{
  "Y02": { "Honolulu B": "owned", "Honolulu": "wishlist" },
  "Y00": { "Honolulu": "owned" }
}
```

Three states per color+series combination:
- **owned** — user has this marker
- **wishlist** — user wants it but doesn't own it
- **unowned** (default/null) — neither

### `useOwnership` hook API
Exported: `{ ownership, setStatus, getStatus, isOwned, isWishlist }`
- `setStatus(colorCode, seriesName, status)` — sets 'owned' | 'wishlist' | null (null deletes the key)
- `getStatus(colorCode, seriesName?)` — returns status; without seriesName returns aggregate ('owned' if any series owned, 'wishlist' if any wishlisted)
- `isOwned(colorCode, seriesName?)` — boolean, aggregate if no series
- `isWishlist(colorCode, seriesName?)` — boolean, aggregate if no series

## UI Conventions

### Color Swatch (square, rounded corners)
- Background = marker hex color
- Text color auto-calculated from luminance (dark text on light bg, white on dark)
- Shows: primary code (top, bold) + legacy code below (priority: Honolulu → Oahu → Kaala)

### Color Chip (circle, My Markers / Recommended pages)
- **Owned**: filled with marker color, text auto-contrast
- **Wishlist**: white fill, dashed pink border (`#f48fb1`) — only shown in My Markers; Recommended page chips show unowned style for wishlist
- **Unowned**: light grey fill (`#f4f7f7`), grey border (`#e0e8e8`)

### Status Badge
- OWNED: teal border + text (`#1ab5b5`)
- WISHLIST: orange/amber border + text (`#ffb347`)
- UNOWNED: grey border + text

### Tabs (All / Owned / Unowned / Wishlist)
- "Unowned" includes wishlist items (not owned = unowned)
- "Wishlist" shows only wishlist items
- Active tab: teal fill (`#1ab5b5`)

## Color Palette
- Primary teal: `#1ab5b5`
- Background: `#f7fafa`
- Card bg: `#fff`
- Border light: `#eef2f2` / `#f0f4f4`
- Text primary: `#1a2a2a`
- Text secondary: `#5a7a7a`
- Text muted: `#8aabab`
- Missing/error red: `#e57373`
- Wishlist amber: `#ffb347`
- Wishlist chip border (dashed): `#f48fb1`

## Pages

### My Colors (`MyColorsPage.jsx`)
- Search by name, code, or legacy name/code
- Tabs filter: All / Owned / Unowned / Wishlist
- 2-column card grid, sorted by `color.sort`
- Card border tinted: teal if owned, amber if wishlist, grey if unowned
- Tap card → `ColorDetailModal`

### My Markers (`MyMarkersPage.jsx`)
- Search bar filters series cards by name
- One card per distinct series (derived from honolulu-sets.js via `getSeriesGroups()`)
- Shows: completion %, progress bar, Owned / Total / Missing counts
- Missing = total − owned (wishlist still counts as missing)
- Collapsible chip grid sorted by `color.sort`; chips filtered by active tab
- Tabs filter which chips are shown (not which cards)
- Tap chip → `ColorDetailModal`
- Search and chip tabs are both present in the current build

### Recommended (`RecommendedPage.jsx`)
Lists retail bundles (excludes "Individual" sets via name filter).

**Filters / controls:**
- Search bar (by name or edition)
- **Exact Markers** toggle: only count same-series owned markers toward completion
- **Colors Only** toggle: count any series ownership of that color toward completion
- Series dropdown: All Markers | Honolulu | Honolulu B | Honolulu Plus | Honolulu S | Honolulu² | Honolulu² B
- Sort By: Most New | Most Owned | Largest | Smallest

**SetCard** (used in RecommendedPage, not the same as SeriesCard in MyMarkersPage):
- Shows series badge, edition badge, bundle name, version/meta, tip icon, marker count
- Progress bar (owned / total based on colorMode)
- "+ Add All" button → confirmation modal → marks all colors in that bundle as owned for that series
- Collapsible "Included Colors" chip grid (chips show owned status, tap → ColorDetailModal)
- Tip icon: `A` standard, `A+` Supreme, `A²` Brush²

**SERIES_ORDER** (canonical ordering used in dropdowns):
```js
['Honolulu', 'Honolulu B', 'Honolulu Plus', 'Honolulu S', 'Honolulu²', 'Honolulu² B']
```

## Components

### `ColorDetailModal.jsx`
- Fixed overlay, scrollable body
- Header: colored background (marker hex), auto-contrast text, color name + code + legacy
- Body sections grouped by series variant (tip style):
  - Each series row: tip icon (A / A+ / A²), series name, tip type, Own / Wish toggle buttons
  - "Found In" collapsible: lists all retail sets containing this color in that series (sorted by count desc), shown in 2-col grid
- Buttons are toggles: pressing active state → clears it (sets null)
- `onSetStatus` is passed as no-op `() => {}` from chip taps in RecommendedPage (read-only context); fully functional from MyColorsPage and MyMarkersPage

### `ColorSwatch.jsx`
- Square swatch component
- Shows primary code + legacy code (priority: Honolulu → Oahu → Kaala)

## App Shell (`App.jsx`)
- 3-tab nav: My Colors | My Markers | Recommended
- Leaf-in-circle SVG logo, gear icon (decorative/not wired)
- `ownership` + `setStatus` from `useOwnership` passed down to all pages
- maxWidth 480px, centered
- **Swipe gestures**: horizontal swipe navigates between pages; vertical swipes and swipes < 50px ignored

## Utils

### `colorUtils.js`
- `getLegacyDisplay(color)` — returns best legacy `{ name, code }` or null (priority: honolulu > oahu > kaala)
- `getSeriesForColor(colorCode, allSets)` — returns `[{ series, tipType }]` of all series this color appears in (deduped)

## Known Decisions & Rules
- Color hex values have leading `#` stripped (one color in CSV had it; parser handles both)
- `colors.js` and `honolulu-sets.js` are never edited manually — always regenerated from CSV
- When user provides updated CSV, developer regenerates the relevant data file
- Do not add features beyond what has been explicitly discussed/shown in screenshots
- Future data files (oahu-sets.js, kaala-sets.js) follow same pattern as honolulu-sets.js
- RecommendedPage filters out Individual marker sets (`!s.name.includes('Individual')`)
- ColorDetailModal's `onSetStatus` is intentionally a no-op when opened from chip taps in RecommendedPage
- Wishlist chips in Recommended page render as unowned style (not dashed pink) — this is intentional per SetCard's `getStatus` logic
- `.bak` files are not part of the build; do not delete without asking

## CSV Parser Logic (for regenerating data files)

### colors.js parser
```python
import csv, json
with open('Ohuhu_Ultimate_Database_-_Color_List.csv') as f:
    reader = csv.DictReader(f)
    colors = []
    for row in reader:
        def legacy(name_col, code_col):
            n = row.get(name_col, 'FALSE')
            c = row.get(code_col, 'FALSE')
            if not n or n == 'FALSE' or n == '---': return None
            return {'name': n, 'code': (c if c and c != 'FALSE' else None)}
        colors.append({
            'sort': int(row['SORT']),
            'name': row['Color Name'],
            'code': row['Color Code'],
            'hex': row['Hex Color'].lstrip('#'),
            'legacy': {
                'honolulu': legacy('Legacy Name (Honolulu)', 'Legacy Code (Honolulu)'),
                'oahu': legacy('Legacy Name (Oahu)', 'Legacy Code (Oahu)'),
                'kaala': legacy('Legacy Name (Kaala)', 'Legacy Code (Kaala)'),
            }
        })
# Write as: export const colors = [...];
```

### honolulu-sets.js parser
```python
import csv, json
with open('Ohuhu_Ultimate_Database_-_Honolulu.csv') as f:
    rows = list(csv.reader(f))
bundle_names = rows[0][1:]
series_row   = rows[1][1:]
edition_row  = rows[2][1:]
version_row  = rows[3][1:]
count_row    = rows[4][1:]
tip_row      = rows[5][1:]
color_rows   = rows[6:]
# For each bundle column i, collect color codes where value == 'TRUE'
# Write as: export const honoluluSets = [...];
```

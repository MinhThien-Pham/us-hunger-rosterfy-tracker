# US Hunger Rosterfy Tracker

Chrome extension for viewing US Hunger Rosterfy opportunities with filters for application status, personal application status, project flags, warehouse projects, state/city grouping, and calendar exports.

## Current scope

- Runs only on `https://ushunger.rosterfy.com/*`
- Uses the current browser login session; no passwords, cookies, or tokens are stored
- Opens the full dashboard directly from the extension icon
- Syncs opportunities from `/api/v2/event`
- Syncs your applied/confirmed/pending shifts from `/api/v2/me/event` and `/api/v2/me/event/shift`
- Syncs promoted Rosterfy events from the dashboard `promoted=1` endpoint as a separate project flag
- Loads from the local snapshot first when available; it only calls Rosterfy when you click Sync/Refresh Apps or when no snapshot exists yet
- Stores one rolling local snapshot under one Chrome storage key: `usHungerRosterfyTracker`
- Each Sync overwrites that same snapshot instead of creating multiple historical snapshots
- Supports single-select filters:
  - Application: Open or Closed
  - My Status: Unapplied, Applied, Pending, or Confirmed
  - Location: Florida, Out-of-state, or Warehouse
  - Flags: New, Reopened, Starred, Closing soon, or Promoted
  - Date range: overlaps or excludes a selected range
  - Duration: One-day or Multi-day projects
- Exports CSV
- Exports ICS for filtered projects
- Exports ICS for confirmed projects
- Treats USH Warehouse projects as Longwood, FL with a warehouse badge
- Shows the Apply button only for Open projects where your status is Unapplied; Applied, Pending, and Confirmed projects do not show Apply again

## Local storage model

The extension uses `chrome.storage.local` and keeps one consolidated object:

```js
{
  usHungerRosterfyTracker: {
    schemaVersion: 1,
    state: {
      initialized: true,
      projectHistory: {},
      starredProjects: {},
      settings: {
        newBadgeDays: 7,
        reopenedBadgeDays: 14,
        closingSoonDays: 14
      }
    },
    snapshot: {
      events: [],
      myEvents: [],
      pendingEvents: [], // legacy name; stores promoted=1 events
      myShifts: [],
      syncedAt: "...",
      savedAt: "..."
    },
    updatedAt: "..."
  }
}
```

`state` is small local history/preferences for New, Reopened, and Starred. `snapshot` is the latest synced Rosterfy data. Sync updates the same object and replaces the latest snapshot. The `pendingEvents` snapshot field keeps promoted=1 event payloads for backward compatibility with older patch names; promoted events are not treated as your Pending status.

Legacy keys from older patches are migrated automatically and removed:

- `usHungerRosterfyTrackerState`
- `usHungerRosterfyTrackerSnapshot`

## Development install

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.
6. Open `https://ushunger.rosterfy.com/` and log in.
7. Click the extension icon.

## Safety notes

Do not commit cookies, authorization headers, copied API responses with tokens, or personal user IDs.
This extension reads data from your own logged-in Rosterfy session and does not store auth tokens.

## Confirm shift safety

Confirmable shifts are detected from `/api/v2/me/event/shift`. The extension displays that status as `Pending`, while the action button remains `Confirm` when Rosterfy allows shift confirmation. The Confirm button only appears when the shift payload has `permissions.confirm === true` and a valid `object.id` shift id. It asks for confirmation before POSTing to `/api/v2/event/shift/{shiftId}/confirm`.


## Promoted events

Rosterfy promoted events come from the dashboard promoted endpoint (`promoted=1`). They now show as a `Promoted` flag/filter and summary card. Promoted is not the same as your `Pending` status. A project is only `Pending` when your shift-level payload from `/api/v2/me/event/shift` says the applied status is pending or `permissions.confirm === true`.

## Estimated earnings

The dashboard now adds a rough `Est. Pay` column and an `Est. Confirmed Pay` summary card.

Defaults are intentionally local/static and do not call Paylocity:

- Hourly rate: `$15/hour`
- Net estimate ratio: `187 / 202.50 ≈ 92.35%`
- Origin airport: `MCO`
- Domestic airport report/check-in buffer: `2h`
- Arrival airport exit buffer: `0.5h`
- Estimated flight block: approximate distance / 500 mph + taxi/takeoff/landing buffer

The estimate is a range and is color-coded:

- Green: higher confidence
- Yellow: medium confidence
- Red: lower confidence

Hover over the Est. Pay cell to see the per-day breakdown. Details also shows the same breakdown. This is only a planning estimate; actual paid time still depends on lead/event-manager clock-in/out instructions and Paylocity punches.

## Latest UI cleanup

- Renamed the summary card from `Est. Confirmed Pay` to `Est. Pay` and placed it between `Confirmed` and `Meals`.
- Removed colored estimate boxes; estimate values now use colored bold text only.
- Replaced the browser-native black tooltip with an instant custom tooltip that matches the dashboard UI and uses a wider multi-column breakdown.

## Update: compact estimated-pay tooltip

- Est. Pay tooltip is more compact for one-day projects.
- Tooltip now shows only day, estimated hours, net, and gross values.
- Confidence is represented by color only: green = high, yellow = medium, red = low.
- Project/header confidence now uses an average of the underlying estimates instead of always taking the lowest confidence day.

## Latest patch: compact staffing/schedule table

- Replaced duplicate Dates/Days table display with:
  - Crew Need: lead/support counts parsed from the project description.
  - Days: number of explicit project schedule entries when available.
  - Schedule: date + label from the Rosterfy project description, such as `Wednesday 7/28: Travel/Load in`.
- Removed the long project description text from the table row to reduce duplicate schedule information.
- Estimated pay day labels now use the schedule labels from the Rosterfy description when available, for example `Return Travel` instead of a fixed `Travel back` label.
- Estimated pay detail styling now matches the hover popup style: day title is black/bold, while money/hour values are bold and colored by confidence.


## Patch note: schedule date parser fix

- Fixed schedule rows where lines like `Event Day 6/25 Thursday` were being parsed as `/25 Thursday: Event Day 6`.
- The parser now supports both `Label: Wednesday 7/28` and `Label 6/25 Thursday` formats.
- Table schedule and estimated pay breakdown now use the corrected date/label split.

## Patch note: inferred multi-day earnings

- Fixed estimated pay for projects that only provide a broad date range such as `Monday-Thursday` without a detailed day-by-day schedule.
- When no explicit schedule rows are available, the estimator now uses every calendar day in the project date range instead of collapsing the project into only Travel / Event / Return.
- For out-of-state multi-day projects, the estimator infers first day as Travel, last day as Return Travel, and middle days as Project/Event days. These inferred days remain lower confidence than explicit Rosterfy schedule rows.

## Patch note: inferred schedule labels

- Date-range fallback no longer uses generic `Project day 1` / `Project day 2` labels.
- For 3-day out-of-state projects without explicit schedule rows, the estimator now infers:
  - Day 1: `Travel/Load in`
  - Day 2: `Event day`
  - Day 3: `Return Travel`
- For 4+ day out-of-state projects, the estimator uses:
  - first day: `Travel/Load in`
  - second day: `Setup day`
  - middle event days: `Event day`, `Event day 2`, etc.
  - last day: `Return Travel`
- These fallback labels are only used when Rosterfy does not provide explicit day-by-day schedule lines.

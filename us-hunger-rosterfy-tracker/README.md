# US Hunger Rosterfy Tracker

Chrome extension for viewing US Hunger Rosterfy opportunities with filters for application status, personal application status, warehouse projects, state/city grouping, and calendar exports.

## Current scope

- Runs only on `https://ushunger.rosterfy.com/*`
- Uses the current browser login session; no passwords, cookies, or tokens are stored
- Syncs opportunities from `/api/v2/event`
- Syncs your applied/confirmed projects from `/api/v2/me/event`
- Supports single-select filters:
  - Application: Open or Closed
  - My Status: Unapplied, Applied, or Confirmed
  - Location: Florida, Out-of-state, or Warehouse
- Exports CSV
- Exports ICS for filtered projects
- Exports ICS for confirmed projects
- Treats USH Warehouse projects as Longwood, FL with a warehouse badge

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
This extension reads data from your own logged-in Rosterfy session and does not call the apply API directly.

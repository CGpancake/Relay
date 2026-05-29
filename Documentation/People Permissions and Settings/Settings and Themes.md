# Settings and Themes

Settings controls the current prototype user, visual theme, accent slot, planning timezone, Calendar overlay defaults, and Day-view time padding.

Theme, accent, current prototype user, timezone, calendar overlays, and Day-view padding are saved in browser local storage. These are local preferences.

Browser localStorage may also hold fallback annotations or drafts. It is not the canonical store for People contacts, phone numbers, engagement status, or permissions. When the backend is running, People can be API-backed and persisted in local SQLite instead.

Deliverable, project, allocation, archive, and notification state still mostly resets on page load.

Relay includes native concrete themes plus community-inspired theme families. The quick light/dark toggle stays within the selected family when a matching variant exists.

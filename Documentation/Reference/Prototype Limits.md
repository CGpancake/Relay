# Prototype Limits

Relay is still a prototype, but not every area has the same persistence model.

## Current persistence limits

- Core app state for projects, deliverables, allocations, archive records, comments, notifications, and most review workflow data remains prototype/local state.
- People has an optional FastAPI + SQLite local persistence path when the backend is running.
- If the People API is unavailable, the app can fall back to seeded frontend People data.
- SQLite is a development placeholder. PostgreSQL remains the intended production direction for durable backend data.
- Theme, accent, current prototype user, timezone, calendar overlay settings, and Day-view padding persist in local storage.
- Fallback annotations may use local storage when the annotation API is unavailable.

## Local behavior

- Seeded core workflow records may reset on page load.
- Permission controls are UI affordances, not production authorization.
- People permission settings help validate UX behavior, but they are not a secure access-control system.
- Archive restore validates product behavior but does not represent a final data-retention policy.
- Deliverable attachments in Calendar update due dates during apply, but allocation records do not store deliverable ids.
- Review media uses local demo assets and generated proxy paths rather than production asset storage.

# Prototype Limits

Relay is currently a frontend-only prototype. There is no durable backend persistence for projects, deliverables, allocations, archive records, comments, notifications, or annotations in the core app state.

## Local behavior

- Seeded records reset on page load.
- Theme, accent, current prototype user, timezone, calendar overlay settings, and Day-view padding persist in local storage.
- Permission controls are UI affordances, not production authorization.
- Archive restore validates product behavior but does not represent a final data-retention policy.
- Deliverable attachments in Calendar update due dates during apply, but allocation records do not store deliverable ids.
- Review media uses local demo assets and generated proxy paths rather than production asset storage.

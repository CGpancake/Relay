# Implementation Log

## Current slice

- Renamed user-facing Tasks language to Deliverables while keeping internal `Task` model names.
- Added `/deliverables` as the canonical route and retained `/tasks` as a compatibility alias.
- Updated in-app documentation under `Documentation/` and developer docs under `docs/` for current behavior.
- Added an Archive relationship graph using native canvas rendering, `requestAnimationFrame`, drag, pan, zoom, hover focus, selected-node emphasis, wheel-to-zoom, and reset view.
- Extended Archive metrics with studio counts while preserving active projects, archived projects, archived deliverables, completed deliverables, subdeliverable completion, tag counts, and tool counts.

## Existing validated behavior

- Projects are grouped by studio and support local project and deliverable creation for Admin and Manager users.
- Deliverables support grouped rows, filters, multi-pane review, local review media, annotations, A/B preview, zoom, comments, follower notifications, and subdeliverables.
- Calendar supports Allocation, Time Off, and Milestones modes with day/week/month/year views and transient deliverable attachments.
- Archive supports restoreable project and deliverable flows.
- People and Settings support local permission, theme, accent, user, timezone, and calendar preference testing.

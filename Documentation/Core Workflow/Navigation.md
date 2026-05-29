# Navigation

Relay uses a left sidebar and a persistent header. The sidebar can collapse into an icon rail and expands again from the header brand or rail control.

## Views

- Projects: create projects, edit studio/tag/tool metadata, archive projects, and create deliverables for a selected project.
- Calendar: plan allocation, time off, and milestones. The compatibility paths `/allocation`, `/bookings`, and `/goals` open Calendar modes.
- Deliverables: inspect grouped work, filter deliverables, open review panes, edit metadata, manage subdeliverables, annotate review frames, and send comments.
- Bidding: reserved prototype view.
- Archive: review active and archived projects, archived deliverables and subdeliverables, aggregate counts, filters, restore actions, and the relationship graph.
- Documentation: browse these bundled markdown pages with wiki links.
- People: inspect and edit people records and permission levels where allowed; records may be API-backed when the local backend is running.
- Settings: choose current prototype user, theme, accent, timezone, and calendar display preferences.

## Routes

`/deliverables` is the canonical deliverables route. `/tasks` remains a compatibility alias and opens the same view. Other current routes include `/projects`, `/calendar`, `/bidding`, `/archive`, `/documentation`, `/people`, and `/settings`.

## Notifications

The notification bell stores session-only deliverable update records. It validates follower behavior and update placement, but it is not realtime, durable, or production authorization.

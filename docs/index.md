# Relay Developer Docs

Relay is a frontend-only Vite, React, and TypeScript prototype. The active app covers `/projects`, `/calendar`, `/deliverables`, `/bidding`, `/archive`, `/documentation`, `/people`, and `/settings`. `/tasks` remains a compatibility alias for `/deliverables`.

The prototype validates a deliverable workflow:

- Deliverable table grouped by status with user, project, status, phase, priority, and search filters.
- Up to three side-by-side review panes with editable metadata, review versions, annotations, A/B preview, zoom, comments, followers, and notifications.
- Subdeliverable toggles, row highlighting, archive actions, and automatic completion when all subdeliverables are done.
- Project creation, studio/tag/tool editing, and project deliverable creation for Admin and Manager users.
- Calendar allocation, time off, and milestones modes with transient deliverable attachments that can update due dates.
- Archive view with grouped filters, collapsed active/archived project statistics, studio counts, archived deliverables/subdeliverables, restore actions, and an interactive canvas relationship graph.

## Docs

- `project-overview.md`: current product and implementation overview.
- `decisions.md`: architectural and product decisions.
- `implementation-log.md`: condensed implementation history.
- `glossary.md`: current terms.
- `testing-debug-guide.md`: verification and debugging checklist.
- `relay-design-system.md`: visual reference; current app language should read Deliverables.

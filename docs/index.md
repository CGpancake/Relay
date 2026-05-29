# Relay Developer Docs

Relay is a frontend-first Vite, React, and TypeScript prototype with an optional local FastAPI backend for People persistence. The active app covers `/projects`, `/calendar`, `/deliverables`, `/bidding`, `/archive`, `/documentation`, `/people`, and `/settings`. `/tasks` remains a compatibility alias for `/deliverables`.

The prototype validates a deliverable workflow:

- Deliverable table grouped by status with user, project, status, phase, priority, and search filters.
- Up to three side-by-side review panes with editable metadata, review versions, annotations, A/B preview, zoom, comments, followers, and notifications.
- Subdeliverable toggles, row highlighting, archive actions, and automatic completion when all subdeliverables are done.
- Project creation, studio/tag/tool editing, and project deliverable creation for Admin and Manager users.
- Calendar allocation, time off, and milestones modes with transient deliverable attachments that can update due dates.
- Archive view with grouped filters, collapsed active/archived project statistics, studio counts, archived deliverables/subdeliverables, restore actions, and an interactive canvas relationship graph.
- People can load from `/api/people` and persist to the local SQLite dev database when the backend is running; frontend seed data remains the fallback.

## Reading order

1. `index.md`: navigation and current state.
2. `project-overview.md`: product and implementation summary.
3. `glossary.md`: canonical developer terms.
4. `decisions.md`: architectural/product decisions.
5. Feature docs such as `backend-api.md`, `people-data.md`, and design/deployment notes.
6. `testing-debug-guide.md`: validation and troubleshooting.
7. `deployment.md`: local and hosted runbooks.
8. `implementation-log.md`: implementation history.

## Docs

- `project-overview.md`: current product and implementation overview.
- `backend-api.md`: FastAPI People API endpoints, local commands, and validation.
- `people-data.md`: People seed/import data shape and counts.
- `decisions.md`: architectural, product, hosting, persistence, and environment decisions.
- `deployment.md`: local frontend/backend runbooks, Rez build, static hosting, and reverse proxy notes.
- `implementation-log.md`: condensed implementation history and deployment learnings.
- `glossary.md`: current terms.
- `testing-debug-guide.md`: verification and debugging checklist.
- `doc-flow.md`: when changing code, which docs to update.
- `relay-design-system.md`: visual reference; current app language should read Deliverables.

## Documentation update map

- People schema/API changes: update `backend-api.md`, `people-data.md`, `glossary.md`, `decisions.md`, and `Documentation/Reference/Prototype Limits.md`.
- Persistence changes: update `decisions.md`, `deployment.md`, and `testing-debug-guide.md`.
- UI behavior changes: update the relevant `Documentation/*` in-app page and `testing-debug-guide.md`.
- Terminology changes: update both `docs/glossary.md` and `Documentation/Reference/Glossary.md`.

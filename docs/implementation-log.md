# Implementation Log

## Current slice

- Renamed user-facing Tasks language to Deliverables while keeping internal `Task` model names.
- Added `/deliverables` as the canonical route and retained `/tasks` as a compatibility alias.
- Updated in-app documentation under `Documentation/` and developer docs under `docs/` for current behavior.
- Added an Archive relationship graph using native canvas rendering, `requestAnimationFrame`, drag, pan, zoom, hover focus, selected-node emphasis, wheel-to-zoom, and reset view.
- Extended Archive metrics with studio counts while preserving active projects, archived projects, archived deliverables, completed deliverables, subdeliverable completion, tag counts, and tool counts.
- Extracted and documented the canonical Calendar time-off model while keeping allocation, time off, and milestone planning behavior aligned.
- Captured the hypervisor and Rez hosting direction: build the frontend with Rez-managed Node tooling, deploy `dist/` as static files, and keep API traffic behind explicit FastAPI routes.
- Added a Rez package scaffold, Nginx static-site config, and deployment runbook for the static hosted path.

## Backend and People persistence

- Added a FastAPI backend scaffold in `backend/app/main.py` with CORS for local Vite development and `GET /api/health`.
- Added SQLAlchemy models, Alembic dependency, and a default local SQLite database path at `backend/.data/relay-dev.sqlite3`.
- Added `/api/people` CRUD endpoints for listing, reading, creating, patching, permissions patching, and archiving People records.
- Integrated People UI loading with API-first behavior and frontend seed fallback when the API is unavailable.
- Added backend seed support through `python -m backend.scripts.seed_people`.
- Imported generated records from `C:/Users/user/Downloads/CM Freelance List 2026.xlsx` into `src/data/importedFreelancePeople.ts` and `backend/app/freelance_people.py`.
- Current import contributes 365 unique freelance/contact records, merged by normalized name, with spreadsheet details retained in notes.
- Current seeded SQLite total is 371 people including the core team.
- Added Python backend dependency setup through `backend/requirements.txt`.
- Fixed backend annotations for Python 3.9 compatibility by avoiding Python 3.10-only union syntax.

## Existing validated behavior

- Projects are grouped by studio and support local project and deliverable creation for Admin and Manager users.
- Deliverables support grouped rows, filters, multi-pane review, local review media, annotations, A/B preview, zoom, comments, follower notifications, and subdeliverables.
- Calendar supports Allocation, Time Off, and Milestones modes with day/week/month/year views and transient deliverable attachments.
- Archive supports restoreable project and deliverable flows.
- People and Settings support permission, theme, accent, user, timezone, and calendar preference testing.

## Hosting learnings

- Relay builds as a static Vite app with `npm ci` followed by `npm run build`; the resulting `dist/` directory can be served without a Node runtime.
- Rez support is currently scaffolded, not mandatory: the live deployment loop can use direct npm commands, while `package.py` prepares the same build commands for `rez-env relay`.
- A full studio-style `rez-build` and `rez-publish` workflow still needs local Rez repository conventions, Node package naming, and artifact policy.
- Use `relay-hypervisor` as the documentation alias for the target VM and `it.admin` as the SSH user. Keep private IP addresses, passwords, and other secrets out of the repository.
- API-backed People persistence should be routed under `/api/*` to the FastAPI service when hosted.
- `backend/annotations_service.py` already defines the future FastAPI `/annotations` service. It requires `DATABASE_URL` at startup.
- `backend/schema.sql` already defines the future PostgreSQL `annotations` table and lookup index.
- The frontend attempts `/annotations` first and falls back to browser local storage when the annotation API is unavailable.
- Vite development dynamically serves demo review media from `Demo_Versions/Elements` through `/demo-review/elements/manifest.json`. A static deployment needs generated static media/manifest files or a production route that serves the same paths.

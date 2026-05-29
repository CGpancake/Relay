# Decisions

## Frontend-first prototype with local People API

Decision: keep Relay frontend-first and deterministic for workflow iteration, while adding a local FastAPI boundary for durable People data.

Rationale: project, deliverable, allocation, archive, and review behavior still benefits from fast local iteration. People/contact data now needs persistence beyond page reloads and should not live as hidden browser state.

## FastAPI boundary for People

Decision: expose People persistence through `/api/people` from the FastAPI app in `backend/app/main.py`.

Rationale: a backend boundary lets the UI validate real API loading, creation, editing, permission updates, and archive behavior without locking the whole product into a final production schema.

## SQLite placeholder, PostgreSQL-ready path

Decision: use `backend/.data/relay-dev.sqlite3` as the default local development database and keep the code path compatible with a later PostgreSQL `DATABASE_URL` deployment.

Rationale: SQLite makes local setup copy-pasteable and keeps seed validation simple. PostgreSQL remains the intended production direction once durability, migrations, backups, and environment management are finalized.

## People source of truth behind API

Decision: People contacts, phone numbers, engagement status, and permission settings belong behind the People API when the backend is running. Browser localStorage is for preferences, drafts, and fallback annotations only.

Rationale: localStorage is useful for UI preference persistence but is not an appropriate canonical contact store.

## Excel contact list as seed data

Decision: import `CM Freelance List 2026.xlsx` as generated seed data in `src/data/importedFreelancePeople.ts` and `backend/app/freelance_people.py`.

Rationale: imported contacts should be visible, reviewable, and repeatably seeded instead of trapped in one browser profile. Duplicate spreadsheet names are merged by normalized name; retained details are carried in notes where no first-class field exists.

## Deliverables language with Task internals

Decision: use Deliverables/Subdeliverables in user-facing copy, routes, tests, and docs while preserving internal `Task`, `Subtask`, `tasks`, and `task/*` names.

Rationale: this delivers the product terminology change without a broad data-model refactor.

## `/deliverables` canonical route

Decision: make `/deliverables` the route written by the shell and keep `/tasks` as a compatibility alias.

Rationale: existing tests, links, and internal model names can continue to work while new navigation reflects the product language.

## Group deliverables by status

Decision: present deliverables in a dense table grouped by status.

Rationale: status grouping keeps the queue scannable and makes automatic completion visible.

## Review panes

Decision: keep deliverable details in slide-in panes and allow up to three panes.

Rationale: reviewers can compare work without losing list context.

## Restoreable archive

Decision: archive projects, deliverables, subdeliverables, and tied allocations instead of permanently deleting them.

Rationale: the prototype needs to validate deletion intent, reporting, and restore flows without destructive state.

## Archive relationship graph

Decision: implement the Archive graph with a native React-managed canvas and `requestAnimationFrame`, without adding a graph dependency.

Rationale: the graph is interaction-heavy but bounded enough for a local force layout, and avoiding a dependency keeps the prototype simpler.

Current behavior: Archive uses an even desktop split between grouped filters and the canvas graph. Wheel input over the canvas zooms the graph instead of scrolling the page, force sliders start at their minimums, and node fills are distributed across existing theme tokens while focus emphasis follows the selected accent.

## Calendar deliverable attachments

Decision: keep Calendar deliverable attachments transient and use them to update selected deliverable due dates on apply.

Rationale: this validates producer planning behavior without changing the allocation data contract.

## Hypervisor-hosted deployment target

Decision: plan Relay hosting around a Linux VM running under the available hypervisor.

Rationale: a VM keeps the prototype close to a normal production deployment shape while remaining simple to back up, rebuild, and isolate from local development machines.

Operational note: refer to the host by the alias `relay-hypervisor` in docs and scripts. The SSH user is `it.admin`. Do not commit private IP addresses or passwords; operators should retrieve credentials from an approved secret manager or provide SSH keys.

## Rez build and runtime environments

Decision: use Rez packages to define repeatable build and runtime environments.

Rationale: Rez can pin the Node/Vite frontend toolchain now and later add Python, FastAPI, Uvicorn, asyncpg, and PostgreSQL client tools without relying on ad hoc VM state.

Current build shape: the direct deployment loop uses `npm ci`, `npm run build`, and deploys the generated `dist/` directory. The root Rez package is a scaffold for running the same commands through `rez-env relay` once the studio Rez package repository provides the required Node package.

Future build shape: adapt the scaffold to the studio `rez-build` and `rez-publish` convention, including a decision about whether publishing stores only the environment package or also captures the built `dist/` artifact.

## Static frontend remains valid with API proxy path

Decision: deploy the hosted UI as a static Vite frontend served by Nginx or Caddy, and route API traffic under `/api/*` to a backend service when People persistence is enabled.

Rationale: Relay does not need a long-running Node process after `dist/` is built. API traffic should have a separate service boundary and reverse proxy path.

Future path: reserve `/annotations` for the existing FastAPI annotation service and PostgreSQL schema when durable annotation storage is required. Until then, the frontend can continue using its local annotation fallback when the API is unavailable.

# Testing and Debugging Guide

## Commands

Frontend:

```bat
cd /d D:\VoidMonolith\Relay
npm run build
npm run test:smoke
npm run dev
```

Backend:

```bat
cd /d D:\VoidMonolith\Relay
python -m pip install -r backend/requirements.txt
python -m py_compile backend/app/models.py backend/app/schemas.py backend/app/routers/people.py backend/app/seed.py backend/app/main.py
python -m backend.scripts.seed_people
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

API checks:

- `http://127.0.0.1:8000/api/health` should return `{"status":"ok"}`.
- `http://127.0.0.1:8000/api/people` should return the People list.
- Current seeded People count: 371.

## Smoke Coverage Targets

- `/deliverables` opens the Deliverables view.
- `/tasks` aliases to the same Deliverables view.
- Sidebar navigation says Deliverables.
- Deliverables are grouped by status and filters narrow the visible rows.
- Selecting a deliverable opens a pane; Ctrl/meta and Shift selection can open up to three panes.
- Review thumbnails, fullscreen review, annotation tools, zoom, comments, and A/B preview work.
- Subdeliverable toggles update progress and automatic completion.
- Projects can create and delete/archive deliverables with Deliverables copy.
- Calendar attachment UI says deliverables and still updates due dates.
- Archive copy says deliverables/subdeliverables and restore behavior still works.
- People opens with API-backed records when the backend is running and falls back to frontend seed data if it is not.
- Imported People records show contact details and notes preview where available.
- Documentation browser shows updated People, Permissions, Settings, Glossary, and Prototype Limits content.
- Archive workspace renders as grouped left-side filters and a right-side canvas graph on desktop, with the Archive numbers section collapsed below it.
- Archive graph controls expose Display and Forces, compact checkboxes and sliders, minimum default force values, wheel-to-zoom without page scroll, nonblank canvas rendering, token-colored node groups, and accent-colored focus emphasis.

## Debug Notes

Most core workflow state resets on reload. Check local storage only for theme, accent, current user, timezone, calendar overlay, Day-view padding, drafts, and fallback annotation issues. People contacts should come from `/api/people` when the backend is running.

If `npm run dev` or `npm run build` fails with ENOENT for `package.json`, run `cd /d D:\VoidMonolith\Relay` first.

If pip fails because `pip install ...` was typed in the wrong shell context, use `python -m pip install -r backend/requirements.txt` from the project root.

If backend syntax fails on Python 3.9, check for Python 3.10-only annotations such as `str | None`; use `Optional[str]` until the project upgrades Python.

If the People list is empty or missing imported contacts, rerun `python -m backend.scripts.seed_people` and confirm `GET /api/people` returns 371 records.

If a pane and table disagree, derive selected deliverables from canonical `tasks` state by id instead of copying objects.

If Archive restore looks wrong, verify whether the parent project is active. Standalone deliverables can only be restored when their project is active.

Vite's 500 kB chunk size message is currently a warning, not a failed build.

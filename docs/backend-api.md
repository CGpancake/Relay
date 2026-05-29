# Backend API

Relay has a local FastAPI backend for People persistence. It is optional for the frontend, but it is the current source-of-truth path for People/contact data when running.

## Local setup on Windows

Run from a Command Prompt or PowerShell session:

```bat
cd /d D:\VoidMonolith\Relay
python -m pip install -r backend/requirements.txt
python -m backend.scripts.seed_people
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend separately:

```bat
cd /d D:\VoidMonolith\Relay
npm run dev
```

## Endpoints

- `GET http://127.0.0.1:8000/api/health`: returns `{"status":"ok"}` when the backend is up.
- `GET http://127.0.0.1:8000/api/people`: lists active People records.
- `GET /api/people/{person_id}`: reads one Person.
- `POST /api/people`: creates a Person.
- `PATCH /api/people/{person_id}`: updates Person fields.
- `PATCH /api/people/{person_id}/permissions`: updates per-view permissions.
- `DELETE /api/people/{person_id}`: archives a Person.

## Data and database

The default dev database is `backend/.data/relay-dev.sqlite3`. Run `python -m backend.scripts.seed_people` to create/seed it.

Current seed expectation: 371 active people total, including 6 core team records and 365 imported freelance/contact records.

## Python compatibility

The backend currently supports Python 3.9. Avoid Python 3.10-only syntax such as `str | None` in backend code unless the project intentionally upgrades the Python requirement. Use `Optional[str]` and imports from `typing` instead.

## Frontend behavior

The People UI attempts to load from `/api/people`. If the API is unavailable, it falls back to frontend seed data so the prototype remains usable.

## Hosted routing note

Static frontend hosting should serve the Vite app normally and reverse proxy `/api/*` to the backend service when API-backed People persistence is enabled.

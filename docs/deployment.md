# Deployment

Relay is deployed first as a static Vite frontend. Local development can also run the optional FastAPI backend for People persistence.

## Local development runbook

Install backend dependencies, seed SQLite, and run the API:

```bat
cd /d D:\VoidMonolith\Relay
python -m pip install -r backend/requirements.txt
python -m backend.scripts.seed_people
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Run the frontend in another terminal:

```bat
cd /d D:\VoidMonolith\Relay
npm run dev
```

Validate:

- `http://127.0.0.1:8000/api/health`
- `http://127.0.0.1:8000/api/people`
- `http://127.0.0.1:5173/people`

Expected People seed count is 371 records after the current import.

## Target host

- Host alias: `relay-hypervisor`
- SSH user: `it.admin`
- Credentials: use SSH keys or an approved secret manager.

Do not commit private IP addresses, passwords, or one-off operator secrets.

## Build environment

The current direct frontend build commands are:

```sh
npm ci
npm run build
```

Expected frontend build runtime:

- Node 20 or newer
- npm 10 or newer

The backend currently supports Python 3.9; keep backend annotations compatible with that version unless the project upgrades Python.

The root Rez package defines frontend build command aliases:

- `relay_install`: runs `npm ci`
- `relay_build`: runs `npm run build`
- `relay_preview`: runs `npm run preview`
- `relay_smoke`: runs `npm run test:smoke`

Build from a Rez shell:

```sh
rez-build --install
rez-env relay -- relay_install
rez-env relay -- relay_build
```

If Rez is not available on the current workstation, use the direct commands:

```sh
npm ci
npm run build
```

Vite may warn that some chunks exceed 500 kB after minification. That is currently a warning, not a failed build.

## Rez publish path

The current `package.py` is a scaffold for a studio-style Rez workflow. It is not yet a complete `rez publish` pipeline.

A future Rez-native flow should define:

- Which Rez package repository receives Relay releases.
- Whether `rez-build` publishes only the environment package or also captures the built `dist/` artifact.
- The exact Node package name/version available in the studio Rez repository, currently expected as `node-20+`.
- A deploy command that runs inside `rez-env relay` and syncs `dist/` to the hypervisor release directory.

The intended studio flow is:

```sh
rez-build
rez-publish
rez-env relay -- relay_install
rez-env relay -- relay_build
```

Runtime static hosting does not use Rez. Nginx serves static files from `/opt/relay/current/dist`; Rez is only for repeatable build/deploy tooling.

## Static web server and API proxy

Use `deploy/nginx/relay.conf` as the baseline Nginx site config. It expects the built app at:

```txt
/opt/relay/current/dist
```

The config serves hashed Vite assets with long-lived cache headers and falls back all app routes to `index.html`.

When deploying API-backed People persistence, add a reverse proxy for `/api/*` to the Uvicorn backend service. Keep API credentials and database URLs in the VM secret store or process manager environment, not in git.

Install flow on the VM:

```sh
sudo mkdir -p /opt/relay/releases
sudo cp deploy/nginx/relay.conf /etc/nginx/sites-available/relay.conf
sudo ln -s /etc/nginx/sites-available/relay.conf /etc/nginx/sites-enabled/relay.conf
```

Release flow:

```sh
release_id=$(date +%Y%m%d%H%M%S)
ssh it.admin@relay-hypervisor "mkdir -p /opt/relay/releases/$release_id"
rsync -av --delete dist/ it.admin@relay-hypervisor:/opt/relay/releases/$release_id/dist/
ssh it.admin@relay-hypervisor "ln -sfnT /opt/relay/releases/$release_id /opt/relay/current"
ssh it.admin@relay-hypervisor "sudo nginx -t && sudo systemctl reload nginx"
```

Use an SSH alias for `relay-hypervisor` rather than embedding a private address in repository files.

## Demo review media

Vite development dynamically serves `Demo_Versions/Elements` through `/demo-review/elements/manifest.json`. Static hosting will only serve files that are present under the deployed web root.

Before relying on demo review media in a hosted static build, add a generated static manifest and copy the required PNG sequence into the deployed app, or serve `/demo-review/` from a future media/API route.

## Future annotation API

Durable annotations are a later phase. The frontend already tries `/annotations` and falls back to browser local storage when that API is unavailable.

When enabling the API:

1. Provision PostgreSQL.
2. Apply `backend/schema.sql`.
3. Run `backend/annotations_service.py` with `DATABASE_URL`.
4. Enable the commented `/annotations` reverse proxy block in the Nginx config and point it at the Uvicorn service.

## Verification

Run before deployment:

```sh
npm run build
npm run test:smoke
```

Run after deployment:

```sh
ssh it.admin@relay-hypervisor "test -f /opt/relay/current/dist/index.html"
ssh it.admin@relay-hypervisor "sudo nginx -t"
```

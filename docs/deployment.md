# Deployment

Relay is deployed first as a static Vite frontend. The VM only needs to serve the generated `dist/` directory.

Rez support is scaffolded but not yet required by the current deployment loop. Today the same build can be run either through npm directly or through the root Rez package once a studio Rez repository provides the required Node package.

## Target host

- Host alias: `relay-hypervisor`
- SSH user: `it.admin`
- Credentials: use SSH keys or an approved secret manager.

Do not commit private IP addresses, passwords, or one-off operator secrets.

## Build environment

The current direct build commands are:

```sh
npm ci
npm run build
```

The root Rez package also defines frontend build command aliases:

- `relay_install`: runs `npm ci`
- `relay_build`: runs `npm run build`
- `relay_preview`: runs `npm run preview`
- `relay_smoke`: runs `npm run test:smoke`

Expected build runtime:

- Node 20 or newer
- npm 10 or newer

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

Runtime hosting still does not use Rez. Nginx serves static files from `/opt/relay/current/dist`; Rez is only for repeatable build/deploy tooling.

## Static web server

Use `deploy/nginx/relay.conf` as the baseline Nginx site config. It expects the built app at:

```txt
/opt/relay/current/dist
```

The config serves hashed Vite assets with long-lived cache headers and falls back all app routes to `index.html`.

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

Keep `DATABASE_URL` and database credentials in the VM secret store or process manager environment, not in git.

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

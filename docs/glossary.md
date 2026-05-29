# Glossary

## Relay

The frontend-first prototype for production deliverable coordination, with an optional local FastAPI backend for People persistence.

## `/deliverables`

The canonical route for the deliverable workflow. `/tasks` remains a compatibility alias.

## Deliverable

A unit of work shown on the Deliverables board. The current TypeScript model remains named `Task` to avoid a broad internal refactor.

## Subdeliverable

A checklist item inside a deliverable. Completing all subdeliverables marks the parent deliverable Done.

## Deliverable Attachment

A transient Calendar planning link between an allocation edit and a deliverable due-date update. Allocation records do not yet store deliverable ids.

## Review Pane

The side pane opened from a deliverable row. It contains metadata, review media, annotation tools, comments, followers, and composer actions.

## Archive

The restoreable in-memory store for removed projects, deliverables, subdeliverables, and tied allocation bundles.

## Relationship Graph

The Archive canvas graph connecting studios, projects, deliverables, subdeliverables, tags, tools, users, status, phase, and priority.

## Person

A People record representing a team member, freelancer, client, bot, or contact. API-backed fields include name, role, discipline, email, phone, engagement status, notes, bot flag, permission level, and per-view permissions.

## Engagement Status

A Person availability/employment marker: `permanent`, `available_to_hire`, `unavailable`, or `unknown`. It is separate from role and permission level.

## Permission Level

A coarse prototype access category: Admin, Manager, Artist, or Client. It is not the same as company role, discipline, or engagement status.

## Permissions

Prototype view and action gates used to validate role-specific behavior before production authorization exists. Per-view People permissions are data fields, but they are not a secure authorization system.

## Local Preference

Browser-local UI setting such as theme, accent, current prototype user, timezone, calendar overlays, or Day-view padding.

## People API

The FastAPI `/api/people` boundary for People persistence and CRUD operations.

## SQLite Placeholder

The default local development database at `backend/.data/relay-dev.sqlite3`, used until a PostgreSQL production path is finalized.

## Seed Fallback

Frontend People seed/import data used when `/api/people` is unavailable.

## Annotation Fallback

Browser localStorage annotation persistence used when the future `/annotations` API is unavailable.

## Time Off Entry

A Calendar planning record for absence/leave. Time-off behavior is separate from allocation bookings.

## Booking

A Calendar allocation record that reserves a person or resource against planning time.

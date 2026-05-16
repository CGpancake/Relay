# Glossary

## Relay

The frontend prototype for production deliverable coordination.

## `/deliverables`

The canonical route for the deliverable workflow. `/tasks` remains a compatibility alias.

## Deliverable

A unit of work shown on the Deliverables board. The current TypeScript model remains named `Task` to avoid a broad internal refactor.

## Subdeliverable

A checklist item inside a deliverable. Completing all subdeliverables marks the parent deliverable Done.

## Review Pane

The side pane opened from a deliverable row. It contains metadata, review media, annotation tools, comments, followers, and composer actions.

## Archive

The restoreable in-memory store for removed projects, deliverables, subdeliverables, and tied allocation bundles.

## Relationship Graph

The Archive canvas graph connecting studios, projects, deliverables, subdeliverables, tags, tools, users, status, phase, and priority.

## Permissions

Frontend-only view and action gates used to validate role-specific behavior before backend authorization exists.

# Glossary

## Deliverable

A unit of production work displayed in `/deliverables`. The internal prototype model is still named `Task`, but user-facing copy says deliverable.

## Subdeliverable

A checklist item inside a deliverable. Completing every subdeliverable marks the parent deliverable Done.

## Review pane

The side detail surface opened from the deliverables board. It contains metadata, subdeliverables, review versions, annotations, comments, followers, and composer actions.

## Client visible

A deliverable flag that marks work as visible to Client permission users.

## Person

A People record for a team member, freelancer, client, bot, or contact.

## Engagement status

A Person availability label: permanent, available to hire, unavailable, or unknown.

## Permission level

A prototype access level such as Admin, Manager, Artist, or Client. It is separate from a person's job role, discipline, or engagement status.

## Local preference

A browser-saved setting such as theme, accent, current prototype user, timezone, or calendar display preference.

## People API

The local backend route Relay can use to load and save People records when the backend is running.

## Archive

The in-memory restoreable store for projects, deliverables, subdeliverables, and allocation bundles removed from active views.

## Relationship graph

An Archive panel that displays studios, projects, deliverables, subdeliverables, tags, tools, users, status, phase, and priority as an interactive canvas graph.

## Prototype state

Seeded local React state. Most core workflow data resets on reload; selected theme, current user, timezone, and display preferences persist in local storage. People can persist through the local API-backed SQLite path when enabled.

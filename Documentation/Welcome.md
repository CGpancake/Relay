# Welcome

Relay is a frontend-first prototype for production deliverable coordination, with optional local API-backed People persistence. It brings projects, deliverables, review notes, allocation planning, archived work, people, permissions, and themes into one workspace.

The current app is intentionally deterministic. Core workflow data such as projects, deliverables, allocation, archive, and notifications is still mostly local prototype state and may reset on page load. People contacts can persist through local SQLite when the FastAPI backend is running. Theme choice, current prototype user, planning timezone, calendar overlay defaults, and Day-view padding persist in browser local storage.

## Start here

- [[Core Workflow/Navigation|Navigation]] explains the app shell, routes, sidebar, and notification bell.
- [[Projects and Deliverables/Deliverables Board|Deliverables Board]] explains the grouped deliverable workflow and review panes.
- [[Projects and Deliverables/Projects|Projects]] explains project metadata and deliverable creation.
- [[Allocation Planning/Allocation Calendar|Allocation Calendar]] explains allocation, time off, milestones, and transient deliverable attachments.
- [[Projects and Deliverables/Archive and Restore|Archive and Restore]] explains restoreable archive behavior and the relationship graph.
- [[People Permissions and Settings/Permissions|People and Permissions]] explains People fields, engagement status, imported contacts, and prototype permission levels.

## Current scope

- A deliverable workflow with filters, grouped rows, multi-pane review, annotations, A/B preview, zoom, comments, followers, notifications, and subdeliverables.
- Project setup with studios, tags, tools, editable metadata, archive confirmation, and project-specific deliverable creation.
- Calendar planning with Allocation, Time Off, and Milestones modes.
- Restoreable archive behavior for projects, deliverables, subdeliverables, and allocations, plus an interactive relationship graph.
- People and Settings screens for API-backed People testing, local permission testing, theme switching, accent choices, and timezone preferences.

# Welcome to Relay

Relay is a frontend prototype for production task coordination. It is designed for teams that need to track projects, tasks, review notes, allocations, archived work, people, permissions, and themes in one focused workspace.

The current app is intentionally local and deterministic. It uses seeded data and resets task, project, allocation, archive, and notification state on every page load. Theme choice and the current prototype user are stored in the browser so permissions and visual settings can be tested across reloads.

## Start here

- [[Core Workflow/Navigation|Navigation]] explains the main app areas.
- [[Projects and Tasks/Task Board|Task Board]] explains the task workflow.
- [[Projects and Tasks/Projects|Projects]] explains project and task creation.
- [[Allocation Planning/Allocation Calendar|Allocation Calendar]] explains the producer planning view.
- [[People Permissions and Settings/Permissions|Permissions]] explains who can access what.
- [[Reference/Prototype Limits|Prototype Limits]] lists what is not implemented yet.

## What Relay validates today

- A task workflow centered on grouped work, filters, review panes, subtasks, comments, followers, and notifications.
- Project setup with editable tags, tools, and project-specific task creation.
- Allocation planning across day, week, month, and year views.
- Restoreable archive behavior for projects, tasks, subtasks, and allocations.
- Frontend-only permission gates for Admin, Manager, Artist, and Client users.
- A brutalist design system with concrete themes and community theme choices.

Relay is not connected to a backend yet. Treat this version as a working product slice for shaping behavior before production architecture is locked.

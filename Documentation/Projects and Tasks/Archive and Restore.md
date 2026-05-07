# Archive and Restore

Relay treats deletion as restoreable archive behavior in this prototype. This keeps destructive workflows testable without permanently losing seeded work during a session.

## What can be archived

- Projects.
- Tasks.
- Subtasks.
- Allocation bundles tied to archived projects.

## Archive view

Archive shows high-level counts and filtered lists of archived work. Filters help narrow archived records by project tags, tools, status, and phase.

## Restore rules

Restoring a project returns the project, its archived tasks, and its tied allocations to the active views. Restoring a standalone task is allowed when the task's project is active.

Subtask archive records are shown for visibility, but the prototype focuses restore behavior on projects and tasks.

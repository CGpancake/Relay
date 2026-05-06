# Relay Docs Wiki

This wiki records implementation memory for the first slice of Relay.

## Start Here

- [[project-overview]] - product intent, first-slice scope, and non-goals.
- [[decisions]] - decisions made so far, rationale, and rejected options.
- [[implementation-log]] - chronological notes about what was implemented and why.
- [[testing-debug-guide]] - how to verify behavior and debug common issues.
- [[glossary]] - shared terms used in the prototype.

## Current Slice

Relay is currently a frontend-only prototype built with Vite, React, and TypeScript. The active prototype covers `/projects`, `/allocation`, `/tasks`, `/archive`, `/people`, and `/settings`, with deterministic task, project, people, allocation, archive, and notification state that resets on every page load.

The prototype demonstrates a task workflow:

- Task table grouped by status.
- Filters for narrowing visible tasks.
- Up to three side-by-side task review panes for inspecting and comparing task details.
- Seeded review media versions, compact media-overlay version selector, fullscreen preview, and comment history.
- Editable task pane status, phase, priority, and assignee fields.
- Task following and in-app notification records for followed task updates.
- Highlightable task and subtask rows, Delete/Backspace archive behavior, visible delete/archive actions, and context menus.
- Subtask toggles, row highlighting, and subtask archive actions.
- Composer actions for sending comments and adding subtasks.
- Automatic task completion when every subtask is complete.
- Project creation, project metadata editing, and project task creation for Admin and Manager users.
- Project tags: `print`, `cg`, and `ai`.
- Project tools: `Houdini`, `Comfy`, `Nanobanana`, `Blender`, and `Unreal`.
- Archive view with aggregate counts, project/task/subtask filters, restore actions, and project bundle restore.
- Allocation planning with exact summary/project row selection.
- Persistent app header with `RELAY`, notification bell, and collapsible side navigation.
- Frontend-only permissions and theme switching.

There is no backend, persistence layer, DCC integration, authentication, or production deployment target in this slice.

## Known Next Questions

- What statuses and transitions should exist once the workflow is connected to real data?
- Which DCC packages need to be represented first, and what metadata do they provide?
- Should subtask completion be reversible after auto-completion?
- What should persist locally, if anything, before a backend exists?
- What shape should the eventual API contract take?
- Should review versions and comments become first-class backend records separate from tasks?
- Which archive records should eventually become durable backend records?
- Which notification events should become realtime or push notifications?

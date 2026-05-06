# Project Overview

## Intent

Relay is being implemented as a frontend-first prototype to validate the task workflow before backend, persistence, or DCC integration work begins.

The first slice focuses on making the task workflow tangible with deterministic local data and predictable UI behavior. The current prototype also validates the Relay design system, theme switching, frontend-only permissions, project creation and metadata, task review, in-app notifications, archive/restore flows, and a producer allocation planner.

## First-Slice Scope

Included:

- Vite React TypeScript application foundation.
- `/projects`, `/allocation`, `/tasks`, `/archive`, `/people`, and `/settings` prototype views in that navigation order.
- Persistent app header with `RELAY` on the left, notification bell on the right, and a collapsible side navigation rail.
- Deterministic seed data reset on page load.
- Task table grouped by status.
- Task filters, including a first `User` filter defaulted to the current prototype user.
- Multi-select task review panes for task details.
- Subtask toggles inside the task pane.
- Task row and subtask row highlighting, keyboard Delete/Backspace archive behavior, visible archive/delete buttons, and task row context menus.
- Auto-completion of a task when all of its subtasks are marked complete.
- Seeded review media versions and comment history on tasks.
- Version selector placed as a compact overlay inside the media thumbnail.
- Editable task pane metadata for status, phase, priority, and assignee.
- Task followers and in-app notifications for task status, phase, priority, assignee, comment, subtask, archive, and restore updates.
- Composer actions for sending comments and adding subtasks from review.
- Relay brutalist design tokens: JetBrains Mono, single surface, 0px radius, hairline borders, and 2px semantic status marks.
- Native Concrete Light, Concrete Dark, and Concrete Dim themes.
- Validated community theme catalogue from `docs/relay-community-themes.md` as predefined theme token sets.
- Settings theme selector grouped by Native and Community, plus a Light/Dark concrete toggle.
- Prototype people permissions with visible company roles separated from Admin, Manager, Artist, and Client permission levels.
- Projects view with in-memory project creation, project-specific task creation, project row highlighting, project archive confirmation, and project metadata editing for Admin and Manager users.
- Project tags: `print`, `cg`, and `ai`.
- Project tools: `Houdini`, `Comfy`, `Nanobanana`, `Blender`, and `Unreal`.
- Archive view with archived projects, tasks, subtasks, allocation bundles, aggregate counts, filters, and restore actions.
- Producer allocation planner with day/week/month/year views, collapsed person rows by default, exact row cell selection, range selection, toggle selection, mixed summary/project allocation editing, past-date hatching, and bulk allocation editing.

Excluded for now:

- Backend service.
- Database or durable persistence.
- DCC integration.
- Authentication and authorization.
- Production authorization. Current permission levels are frontend-only demo gates.
- Realtime collaboration.
- Production data import/export.

## Product Behavior

The app shell has a fixed top header and a left navigation rail. The header shows `RELAY` aligned to the content grid on the left and a notification bell aligned to the right content edge. The side navigation can be collapsed with the middle arrow; clicking `RELAY` or the narrow collapsed rail expands it again.

The `/tasks` screen should make the workflow understandable without external dependencies. A user starts with their own assigned work, can switch the `User` filter to all users or another seeded person, inspect grouped work, narrow the task list with filters, highlight rows, delete/archive highlighted tasks with Delete/Backspace or visible/context actions, and open up to three task review panes using single click, Ctrl/meta click, or Shift range selection. Each pane keeps list context, can be resized independently, shows seeded review media versions with an overlay version selector, supports fullscreen preview, shows comment history, allows sending comments, and allows adding a new incomplete subtask from the composer. Status, phase, priority, and assignee are editable in the pane for users who can edit the task. Assigned users follow their tasks by default; other visible non-client users can follow or unfollow. Follower notifications are frontend-only records surfaced from the header bell. Subtask row clicks highlight the row, while the checkbox only toggles completion. Subtask toggles update table progress, and a task moves to completed state when all subtasks are complete.

The `/allocation` screen lets producers and managers inspect deterministic team allocations, select one or more exact Allocation slots, and apply hour, status, and notes edits to the whole selection. Summary-row selections use the editor project picker; project-row selections retain their own project. Mixed summary/project selections are allowed. It starts with collapsed person summary rows for quieter scanning. Summary cells show readable daily hour totals, subtle stacked utilization strips, and over-allocation marks when a person has more than 8 assigned hours on a date. Dates before the browser's local today show subtle diagonal hatching. Expanded project rows use connected accent lines and readable text instead of translucent allocation pills. The day/week/month/year/date controls sit in the right column above the selected-cells editor and align to that editor width.

The `/projects` screen validates project and task creation without persistence. Admin and Manager users can create a project with `name`, `code`, tags, and tools; select a project; inspect and highlight that project's tasks; edit the selected project's tags and tools; archive the selected project with a warning dialog; and create a task with title, assignee, phase, priority, due date, and client-visible toggle. Project archive is intentionally restoreable rather than permanent deletion. Artist and Client users can inspect the view but creation controls are disabled.

The `/archive` screen validates restoreable deletion behavior. It shows archived projects and archived tasks/subtasks with filters for deliverable/project tag, task status, task phase, and tools. High-level numbers include archived project count, archived task count, completed task count, total/completed subtasks, and project counts by tag/tool. Restoring a project restores its project record, archived tasks, and tied allocations back into active views. Restoring a standalone task returns it to Tasks when its project is active.

The `/people` and `/settings` screens validate company role and permission concepts. Admins can add people, edit visible company roles, change permission levels, and toggle per-view access. Managers can view people but cannot change permissions. Artists can use Tasks and Allocation. Clients see only client-visible tasks. Permission levels are shown in People admin controls only; other app surfaces show company role labels.

Because task, project, people, allocation, archive, and notification state reset on load, every session starts from the same deterministic data. The selected theme and current prototype user are stored in `localStorage` so theme persistence and permission gates can be tested across reloads.

## Architecture Boundary

The current implementation should treat task, project, people, permission, allocation, archive, and notification data as in-memory prototype state. Any data model should be shaped carefully enough to resemble future backend records, but should not imply that backend contracts are final.

## Non-Goals

- Do not build backend APIs in this slice.
- Do not connect to DCC tools yet.
- Do not introduce persistence that makes reset behavior ambiguous.
- Do not optimize for multi-user or realtime behavior before the core workflow is validated.

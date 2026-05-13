# Implementation Log

## 2026-05-05

Initial documentation memory created for the first implementation slice.

Captured current intent:

- Build a frontend-only Relay prototype.
- Use Vite, React, and TypeScript.
- Focus the first usable route on `/tasks`.
- Load deterministic seed data and reset it on each page load.
- Render a task table grouped by status.
- Provide filters for narrowing tasks.
- Open a slide-in task pane for details.
- Allow subtask toggles.
- Automatically complete a task when all subtasks are complete.
- Defer backend, persistence, DCC integration, authentication, and production deployment concerns.

Expanded frontend prototype implementation:

- Refactored the single-file React app into typed modules for seed data, labels, permissions, dates, themes, task view, Allocation view, and people/settings views.
- Replaced the previous rounded multi-surface styling with Relay design tokens: JetBrains Mono, single surface, 0px radius, 0.5px structural borders, and 2px semantic status marks.
- Added native Concrete Light, Concrete Dark, and Concrete Dim themes.
- Added the full validated community theme catalogue from `relay-community-themes.md` as predefined token sets and exposed them in Settings.
- Persisted theme selection in `localStorage`; task, people, and Allocation seed data remain deterministic per load.
- Seeded the current user as Admin and added frontend-only Admin, Manager, Artist, and Client permission behavior.
- Added People controls for Admin role changes, per-view permission toggles, adding people, and removing non-current people.
- Added Allocation planner with team list, week/month/year/day modes, multi-cell selection, shift range selection, ctrl/meta toggle selection, bulk allocation editing, multiple chips, and over-8-hour warning marks.
- Fixed local date formatting to avoid timezone day shifts in the Allocation.

Verification:

- `npm run build` passed.
- `npm run test:smoke` passed with 11 Playwright smoke tests covering tasks, themes, permissions, and allocation editing.

## 2026-05-06

Updated the task, people, Allocation, styling, and smoke-test coverage for the latest prototype decisions.

Behavior changed:

- Added a first `User` filter to the task board, defaulted to the current prototype user, with `All users` plus seeded people options.
- Remapped seeded task assignees to seeded people so the default user-filtered board is non-empty.
- Split people data so `role` is the visible company position and `permissionLevel` is the Admin/Manager/Artist/Client access tier.
- Updated People admin controls to show separate `Role` and `Permission level` columns.
- Kept permission levels out of non-admin product surfaces; sidebar, settings, Allocation rows, and task headers show the company role.
- Replaced native checkbox presentation with Relay square line controls and removed duplicate subtask status icons.
- Changed Allocation to start with people collapsed, faint grid separators, readable summary hour totals, subtle utilization strips, and project rows drawn as connected accent lines with transparent interiors.

Verification:

- `npm run build` passed.
- `npm run test:smoke` was updated for the new behavior and rerun during this change.

Expanded allocation, projects, and task review behavior.

Areas touched:

- Shared types and seed data.
- App navigation and route state.
- Task board, task review pane, and task mutation flows.
- Allocation planner and selection model.
- New Projects view.
- Relay CSS for Allocation alignment, project management, media review, comments, multi-pane task review, and composer controls.

Behavior changed:

- Added `projects` as a routable view in navigation and per-person permissions.
- Moved projects into React state with deterministic seed construction so created projects remain in-memory for the current session and reset on reload.
- Added Projects view with project creation fields for `name` and `code`.
- Allowed Admin and Manager users to create projects and project tasks; Artist and Client users can view project data but cannot create projects or tasks.
- Added project detail task creation fields: title, assignee, phase, priority, due date, and client-visible toggle.
- Wired created projects into task filters, allocation project pickers, and project lists for the current session.
- Extended task seed data with two review versions and comment history per task.
- Reworked the task board selection model to support single click, Ctrl/meta toggle, and Shift range selection.
- Opened up to three task review panes at once, side-by-side from the right edge.
- Removed task pane scrim dimming behavior.
- Added independent left resize handles for task panes with per-pane widths.
- Added media review placeholder, previous/next version controls, version dropdown, and click-to-fullscreen preview in each task pane.
- Added comment history showing author, date, addressed version, and body.
- Added a message composer with visual toolbar controls for bold, list, add subtask, attach, and send.
- Implemented composer send to append a comment to the active task and active review version.
- Implemented composer add-subtask to append a new incomplete subtask and update task progress.
- Replaced Allocation Selection identity from person/date only to exact row identity: summary rows and project rows, including `projectId` for project-row cells.
- Made project-row allocation edits apply only to the selected project/date/person slot.
- Kept summary-row allocation edits using the editor project picker.
- Allowed mixed Allocation Selections: project-row selections keep their project, summary-row selections use the project picker.
- Disabled the project picker when all selected Allocation cells are project rows.
- Changed selected Allocation cells to use faint background instead of accent underline.
- Marked dates before the browser's local today with subtle diagonal hatching on date headers and cells.
- Adjusted the allocation time filter after review feedback so the compact day/week/month/year/date controls sit in the right column above the selected-cells editor and align to that editor's width, while the allocation grid stays on the left.

Verification:

- `npm run build` passed after the implementation.
- `npm run test:smoke` passed with 17 Playwright smoke tests after the implementation.
- Additional browser check verified two task panes can open at once and a new project can be created.
- `npm run build` passed after the final Allocation alignment adjustments.

Implemented archive, allocation rename completion, project metadata, task-pane edits, notifications, and shell layout updates.

Areas touched:

- Shared prototype types, labels, permissions, and seed data.
- App shell navigation, routing, header, notification bell, and collapsible side navigation.
- Projects, Tasks, Allocation, Archive, People, and Settings views.
- Relay CSS for app header alignment, sidebar collapse, Archive, project metadata, task context menus, and task-pane controls.
- Smoke tests and documentation.

Behavior changed:

- Reordered navigation to Projects, Allocation, Tasks, Archive, People, Settings.
- Replaced user-facing Calendar route/label with Allocation and added `/archive`.
- Extended projects with tags, tools, and archive metadata.
- Seeded project tags from `print`, `cg`, and `ai`.
- Seeded project tools from `Houdini`, `Comfy`, `Nanobanana`, `Blender`, and `Unreal`.
- Added tag/tool multi-select controls to project creation and project detail editing.
- Added Archive view with archived projects, archived tasks/subtasks, filters, aggregate counts, and restore actions.
- Made project archive restore the project, archived tasks, and tied allocations back into active views.
- Added task followers and frontend-only in-app notification records.
- Moved the notification bell into a persistent top header aligned with the content grid.
- Added a collapsible side navigation rail with a middle arrow; clicking `RELAY` or the collapsed rail expands it.
- Added highlighted item behavior for task rows, project rows, project task rows, subtasks, archive rows, and allocation cells where already practical.
- Added Delete/Backspace archive behavior for highlighted tasks and subtasks.
- Added visible delete/archive actions and task row context menu actions.
- Made project deletion an archive warning flow instead of permanent deletion.
- Moved the task review version dropdown into a compact overlay inside the media thumbnail.
- Made Status, Phase, Priority, and Assignee editable in the task pane for users with edit permission.
- Added Follow/Unfollow behavior, with assigned users following by default.
- Added notification events for task updates, comments, subtasks, archive, and restore actions.

Verification:

- `npm run build` passed.
- `npm run test:smoke` passed with 17 Playwright smoke tests after the feature implementation.
- `npm run build` passed again after app header/sidebar alignment fixes.

## 2026-05-13

Implemented allocation time planning, internal placeholders, timezone settings, and documentation updates.

Areas touched:

- Shared view, permission, and allocation types.
- App navigation and route handling.
- Settings, Allocation, People permissions, seed data, CSS, smoke tests, internal docs, and in-app Documentation pages.

Behavior changed:

- Added Milestones and Time Off placeholder routes and sidebar entries.
- Restricted Milestones and Time Off to Admin, Manager, and Artist permission levels; Clients cannot access them.
- Added a Settings timezone value, defaulted from the browser timezone and persisted in `localStorage`.
- Migrated seed allocations from stored `hours` to 15-minute snapped `startMinute` and `endMinute` timed segments while preserving total demo durations.
- Reworked Allocation Day view into a 24-hour timeline with current-time marker, partial today striping, drag-create, block move/resize, block selection, and right-click edit/delete actions.
- Kept Week, Month, and Year as compact panel-driven grids.
- Changed compact summary cells to hide numeric hour text and render project utilization fills against fixed 8-hour capacity, with overbook treatment.
- Changed the selected-cells panel into a selected-time segment editor that can append multiple timed segments to selected cells or update explicit selected blocks.
- Kept capacity fixed at 8 hours per person/day until Time Off behavior is specified.
- Promoted Time Off from placeholder to a leave-first calendar surface for holiday and sick leave.
- Added time off approval state: artist-created time off start pending, Admin/Manager-created time off start confirmed, and Managers/Admins can confirm or revert selected time off.
- Shared calendar semantics between Allocation and Time Off: date toolbar, compact rows, day timeline, past-time hatching, time off overlays, and allocation/project source context.
- Kept Time Off visual-only for capacity; Allocation utilization still uses fixed 8-hour person/day capacity.
- Allowed Artists to edit only their own allocation segments/statuses while Managers/Admins can edit all allocation plans.
- Fixed project add dropdown stacking so compact project pickers stay readable above calendar rows.

Verification:

- `npm run build` passed during implementation before documentation updates.
- `npm run build` passed after time off approval and shared calendar refinements.

Refined the final time off/calendar marking contract.

Behavior changed:

- New time off now start pending for Artists, Managers, and Admins.
- Manager/Admin approval actions are contextual: pending selections show Confirm, confirmed selections show Revert to pending, and mixed selections show both.
- Compact booked cells select the time off stripes in that cell so Managers/Admins can confirm from compact views.
- Time Off overlap validation now blocks holiday/sick-leave time off that overlap for the same person, date, and time range; adjacent non-overlapping ranges remain allowed.
- Compact time off stripes now fill the full cell in Time Off and Allocation; Day time off stripes fill the full row height across their timed range.
- Pending and confirmed time off share stripe geometry. Pending uses translucent bands, while confirmed uses full-strength bands.
- Time Off now uses the same past-time hatch behavior as Allocation in compact and Day views.
- Selection and hover use flat accent washes below time off/allocation context; hover is stronger than selection and does not use hatching.

Refined the unified Calendar polish pass.

- Moved Calendar overlay defaults to Settings under time planning and persisted them in local storage.
- Kept Calendar mode buttons in the Calendar header, with the active mode overlay forced visible.
- Simplified the Allocation editor summary area and made Calendar person sublabels show only position.
- Restyled Day view linework to better match compact calendar rows and moved overbooking hatches below project allocation identity.

Refined Calendar timing and layout behavior.

- Changed compact project rows to render one positioned allocation segment per timed record, labelled with segment duration only.
- Derived a clamped shared label column from visible person/project names, including folded project rows, so week/month/year grids fit without bottom horizontal drag scrolling.
- Anchored past-time, Time Off, and overbooking hatching to the same stripe phase while keeping overbooking below allocation visuals and preserving holiday blue/sick-leave green/overbooking red.
- Added persisted Day view past/upcoming padding settings under time planning. Defaults are 2 past hours and 10 upcoming hours; today uses a now-relative window and non-today dates default to 09:00-21:00.

Verification planned for this refinement:

- `npm run build`
- `npm run test:smoke`

## Notes For Future Updates

When implementation changes, update this log with:

- Date.
- Files or areas touched.
- Behavior changed.
- Test or manual verification performed.
- Any decision that belongs in [[decisions]].

Keep this file factual. Put rationale in [[decisions]] and shared vocabulary in [[glossary]].

# Testing Debug Guide

## Verification Goals

The first slice should be verified around deterministic UI behavior, not backend integration.

Check that:

- The app can run locally as a Vite React TypeScript project.
- `/tasks` loads as the primary task workflow screen.
- `/projects`, `/calendar?mode=allocation`, `/people`, and `/settings` routes load for users with access.
- `/archive` loads for users with access.
- Primary navigation order is Projects, Calendar, Tasks, Bidding, Archive, Documentation, People, Settings.
- The top header keeps `RELAY` on the left and the notification bell on the right without overlapping view headers.
- The side navigation collapses with the middle arrow and expands when clicking `RELAY` or the narrow rail.
- Seed data is the same after each page load.
- Tasks are grouped by status.
- Filters narrow the visible task table correctly.
- Selecting a task opens a slide-in pane.
- Ctrl/meta-click and Shift-click open up to three task panes for comparison.
- Task panes can be resized independently and do not dim the task table.
- Task review media version arrows, dropdown, and fullscreen preview work.
- The task review media version dropdown appears as a compact overlay in the thumbnail.
- Task pane status, phase, priority, and assignee controls edit the task for users with edit access.
- Assigned users show `Following`; unassigned visible users can follow and unfollow.
- Followed task updates appear in the in-app notification bell panel.
- Sending a comment appends it to the task comment history.
- Composer add-subtask appends an incomplete subtask and updates progress.
- Subtask toggles update the task detail state.
- Subtask row click highlights the subtask without toggling completion.
- Delete/Backspace archives highlighted tasks or subtasks.
- Visible task actions and context menus expose delete/archive behavior.
- Completing every subtask automatically marks the task complete.
- Admin and Manager users can create projects with tags/tools and project tasks from `/projects`.
- Project tags and tools can be edited in project detail.
- Project archive opens a warning and moves the project, its tasks, and tied allocations into Archive.
- Restoring a project from Archive restores its project, tasks, and allocations to active views.
- Artist and Client users cannot create projects or tasks from `/projects`.
- Created projects appear in task filters and allocation project pickers for the current session.
- Reloading the page resets the data to the original deterministic seed state.
- Concrete Light, Concrete Dark, and Concrete Dim apply their theme tokens.
- Every documented community theme can be selected and survives reload.
- The Settings Light/Dark toggle switches between `concrete-light` and `concrete-dark`.
- Admin can access People and Settings controls.
- Manager can view People but cannot edit permissions.
- Artist and Client restrictions match the prototype role model.
- Allocation team rows and timeline cells render.
- Shift-click selects a contiguous date range for the same exact row identity.
- Ctrl-click or meta-click toggles individual exact cells into or out of the selection.
- Project-row selections include their project identity and do not affect other project rows for the same person/date.
- Summary-row selections use the editor project picker.
- Mixed summary/project selections preserve project-row project identity while using the picker for summary rows.
- Bulk allocation edits apply hours, status, and notes to all selected cells.
- Allocation cells visually mark days over 8 allocated hours.
- Allocation headers and cells hatch dates before the browser's local today, but not today or future dates.
- Allocation day/week/month/year/date controls sit above the selected-cells editor and align to that editor width.
- Time Off uses the same date toolbar and past-time conventions as Allocation.
- Time Off types are Holiday and Sick leave.
- New time off from every role start pending.
- Pending time off stripes use the same geometry as confirmed stripes, but with translucent stripe bands; confirming strengthens the same stripe pattern to full colour.
- Admins and Managers can confirm selected pending time off and revert selected confirmed time off.
- Compact time off stripes cover the full cell; Day time off stripes cover the full row height across the booked time range.
- Overlapping holiday/sick-leave time off for the same person/date/time range are blocked with inline validation; adjacent non-overlapping ranges are allowed.
- Selected calendar cells use a flat accent wash and hovered cells use a stronger flat accent wash; neither wash uses hatching, and time off/allocation context remains visible above both.
- Time Off overlays appear in Allocation without reducing the fixed 8-hour allocation capacity.
- Calendar overlay defaults are controlled from Settings, persist across reloads, and the active mode overlay remains visible even when its saved default is off.
- Artists can edit only their own allocation segments/statuses; Managers/Admins can edit all allocation plans.
- Project add dropdown menus render above calendar rows without clipping.
- Archive filters by deliverable/project tag, tool, task status, and task phase.
- Archive aggregate numbers update after archive and restore actions.

## Manual Debug Checklist

1. Start the frontend dev server.
2. Open `/tasks`.
3. Record the visible task groups and counts.
4. Apply each filter and confirm hidden tasks match the filter criteria.
5. Open a task from each status group.
6. Ctrl/meta-click and Shift-click task rows and confirm no more than three panes are open.
7. Resize one pane and confirm the other pane widths do not change.
8. Switch review versions with arrows and dropdown, then open and close fullscreen preview.
9. Confirm the version dropdown is inside the media thumbnail.
10. Edit status, phase, priority, and assignee from the pane and confirm the task table updates.
11. Follow an unassigned visible task, mutate it, and confirm the notification bell receives an update.
12. Send a comment and confirm it appears with the current user, date, and active version.
13. Use composer add-subtask and confirm pane and table progress update.
14. Click a subtask row and confirm it highlights without changing the checkbox.
15. Toggle one subtask checkbox and confirm the pane and table stay in sync.
16. Toggle all subtasks on a task and confirm it moves to the completed state.
17. Delete or archive a highlighted task and confirm it leaves Tasks and appears in Archive.
18. Open Projects as Admin or Manager, create a project with tags/tools, create a task inside it, and confirm the project appears in task filters.
19. Edit selected project tags/tools and confirm Archive filters can use those fields after archival.
20. Archive a project, confirm the warning dialog, and verify the project leaves active task filters and allocation pickers.
21. Restore that project from Archive and confirm project, tasks, and allocations return.
22. Switch to Artist or Client and confirm Projects creation controls are disabled.
23. Collapse the side navigation and confirm the narrow rail remains clickable; click `RELAY` and confirm it expands.
24. Refresh the page and confirm the original seed state returns.
25. Open Settings and select several Native and Community themes.
26. Reload and confirm the selected theme persists.
27. Switch the prototype current user to Manager and confirm People is read-only.
28. Switch the prototype current user to Client and confirm Allocation, Archive, People, and Settings are inaccessible.
29. Open Allocation, select a summary cell, shift-click a later summary cell for the same person, and confirm the selected count spans the range.
30. Expand a person, Ctrl-click a project-row cell, and confirm only that exact project row is selected.
31. Apply an allocation to mixed summary/project selections and confirm project rows keep their own project while summary rows use the picker.
32. Confirm past dates before local today show hatching and today/future dates do not.
33. Confirm the allocation time controls align with the selected-cells editor in the right column.
34. Open Time Off as any internal user, create a time off, and confirm it is pending.
35. Open Time Off as a Manager or Admin, click a compact booked cell, and confirm the selected time off can be approved without switching to Day view.
36. Select a confirmed time off and confirm only the revert action is shown; select a pending time off and confirm only the confirm action is shown.
37. Create an overlapping time off for the same person/date/time range and confirm inline validation blocks the second time off.
38. Create adjacent non-overlapping ranges for the same person/date and confirm both can coexist.
39. Create a time off, return to Allocation, and confirm utilization still uses fixed 8-hour capacity.

## Common Failure Modes

### Seed data does not reset

Likely cause: state was persisted to local storage, session storage, IndexedDB, or a module-level mutable singleton that survives hot reload in an unexpected way.

Debug approach:

- Search for browser storage usage.
- Confirm seed construction creates fresh task and subtask objects.
- Hard-refresh the page to distinguish app behavior from Vite hot module replacement behavior.

### Auto-complete does not trigger

Likely cause: completion logic checks stale state or updates only the selected task pane without updating the canonical task list.

Debug approach:

- Verify subtask toggle updates the same task collection used by the table.
- Check whether every subtask is complete after the state update, not before.
- Confirm status grouping recalculates after task status changes.

### Task pane and table disagree

Likely cause: selected task state was copied instead of derived from the task list.

Debug approach:

- Prefer storing selected task ids.
- Derive selected tasks from canonical task state.
- Avoid maintaining separate mutable copies of the same task.

### More than three task panes open

Likely cause: multi-select logic appended new ids without trimming the open pane list.

Debug approach:

- Confirm single click replaces the pane list.
- Confirm Ctrl/meta-click toggles membership and then limits the list to the newest three ids.
- Confirm Shift range selection also runs through the same open-pane limit.

### Comment or add-subtask composer does not mutate state

Likely cause: composer action updates local pane state but not the canonical task list.

Debug approach:

- Confirm comment send maps over `tasks` and updates the target task's `comments`.
- Confirm add-subtask maps over `tasks` and appends to the target task's `subtasks`.
- Confirm progress derives from the canonical task object after mutation.

### Filters hide completed task unexpectedly

Likely cause: filter state remains active after auto-completion changes the task status.

Debug approach:

- Check the active filters before and after auto-completion.
- Confirm the table is correct for the active filter.
- Consider whether the UI should disclose active filters more clearly.

### Theme does not persist

Likely cause: the selected theme id was not written to `localStorage`, or a test/setup script cleared storage before reload.

Debug approach:

- Check `relay:theme` in browser storage.
- Confirm the theme id exists in the predefined theme catalogue.
- Verify only theme and prototype current user are persisted; seed data should still reset.

### Role access appears wrong

Likely cause: the current prototype user or a per-person permission override changed.

Debug approach:

- Open Settings as Admin and check the current user selector.
- Open People and inspect the target person's role and per-view permissions.
- Confirm restricted views are disabled in the sidebar rather than treated as production security.

### Notification bell overlaps content

Likely cause: the notification control was placed inside `.content` instead of the persistent `.app-header`, or the header/content padding tokens diverged.

Debug approach:

- Confirm `.app-header` spans the full shell top row.
- Confirm `.app-notifications` is positioned relative within `.app-header`.
- Confirm `.app-header` and `.content` use the same horizontal inset token.
- Confirm `.notification-panel` opens below the bell rather than over the view title.

### Sidebar collapsed state feels misaligned

Likely cause: navigation item padding differs from the header brand/content grid, or collapsed rail styles are hiding the wrong elements.

Debug approach:

- Confirm the expanded navigation icon column aligns with the `RELAY` header text.
- Confirm the collapsed rail uses a fixed narrow column and keeps icons centered.
- Confirm clicking the middle arrow toggles collapse.
- Confirm clicking `RELAY` or the collapsed rail expands navigation.

### Allocation dates are shifted by one day

Likely cause: date formatting used UTC conversion for local Allocation dates.

Debug approach:

- Avoid `toISOString()` for local date labels or date keys.
- Format date keys from local `getFullYear`, `getMonth`, and `getDate` values.
- Check the selected date, week header, and cell `data-testid` values together.

### Bulk allocation misses a selected cell

Likely cause: selection state changed before applying, or a shift-click range was anchored to a different exact row identity.

Debug approach:

- Confirm the selected count before applying.
- Confirm shift-click ranges only apply when the anchor and clicked cell share the same person, row type, and project id.
- Confirm ctrl/meta-click toggles only the clicked cell.
- Confirm selected project-row cells carry `projectId`.
- Confirm summary-row cells use the editor project id during apply.

### Allocation controls or editor drift out of alignment

Likely cause: the toolbar was placed in the header or left timeline column instead of the right Allocation column.

Debug approach:

- Confirm `.calendar-layout` has a left timeline column and a right editor column.
- Confirm `.calendar-toolbar` and `.allocation-editor` both occupy the right column.
- Confirm `.calendar-timeline` occupies the left column.

## Test Coverage To Add

- Seed reset behavior.
- Status grouping.
- Filter combinations.
- Subtask toggle state updates.
- Auto-completion when all subtasks complete.
- Regression test for pane/table consistency.
- Multi-pane selection, trimming to three panes, and resizing.
- Task review version switching and fullscreen preview.
- Comment send and composer add-subtask mutation.
- Theme token application and persistence.
- Permission-gated view access and read-only controls.
- Project creation and project task creation permissions.
- Project tag/tool creation and editing.
- Project archive warning and restore bundle behavior.
- Task/subtask archive and restore behavior.
- Task follow/unfollow and notification creation.
- Header notification alignment and sidebar collapse/expand behavior.
- Created project visibility in task filters and allocation pickers.
- Allocation Selection and bulk allocation editing.
- Exact allocation project-row selection identity.
- Mixed summary/project allocation editing.
- Past-date hatching and Allocation control/editor alignment.
- Time Off pending/confirmed approval and visual styles.
- Time Off compact full-cell overlays, Day timed full-height overlays, compact-cell time off selection, and overlap validation.
- Selection and hover wash layering with time off/allocation context above both washes.
- Time Off overlays shared between Time Off and Allocation.
- Artist own-allocation editing and denial of editing other users' allocations.
- Project picker dropdown clipping/stacking regression coverage.
- Archive filters and aggregate counts.

## Out Of Scope For This Slice

- Backend API tests.
- Database tests.
- DCC integration tests.
- Authentication tests.
- Realtime synchronization tests.

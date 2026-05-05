# Testing Debug Guide

## Verification Goals

The first slice should be verified around deterministic UI behavior, not backend integration.

Check that:

- The app can run locally as a Vite React TypeScript project.
- `/tasks` loads as the primary task workflow screen.
- Seed data is the same after each page load.
- Tasks are grouped by status.
- Filters narrow the visible task table correctly.
- Selecting a task opens a slide-in pane.
- Subtask toggles update the task detail state.
- Completing every subtask automatically marks the task complete.
- Reloading the page resets the data to the original deterministic seed state.

## Manual Debug Checklist

1. Start the frontend dev server.
2. Open `/tasks`.
3. Record the visible task groups and counts.
4. Apply each filter and confirm hidden tasks match the filter criteria.
5. Open a task from each status group.
6. Toggle one subtask and confirm the pane and table stay in sync.
7. Toggle all subtasks on a task and confirm it moves to the completed state.
8. Refresh the page and confirm the original seed state returns.

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

- Prefer storing a selected task id.
- Derive the selected task from canonical task state.
- Avoid maintaining separate mutable copies of the same task.

### Filters hide completed task unexpectedly

Likely cause: filter state remains active after auto-completion changes the task status.

Debug approach:

- Check the active filters before and after auto-completion.
- Confirm the table is correct for the active filter.
- Consider whether the UI should disclose active filters more clearly.

## Test Coverage To Add

- Seed reset behavior.
- Status grouping.
- Filter combinations.
- Subtask toggle state updates.
- Auto-completion when all subtasks complete.
- Regression test for pane/table consistency.

## Out Of Scope For This Slice

- Backend API tests.
- Database tests.
- DCC integration tests.
- Authentication tests.
- Realtime synchronization tests.

# Decisions

## Decision Log

### Frontend-only first slice

Decision: Build the first Relay slice as a frontend-only prototype.

Rationale: The immediate goal is to validate task workflow and interaction shape. Avoiding backend and DCC dependencies keeps the feedback loop short and makes the prototype easy to run.

Rejected options:

- Build backend APIs first. Rejected because endpoint design is still premature until the workflow is clearer.
- Mock a full production system. Rejected because it would add surface area without validating the core task experience.

### Vite, React, and TypeScript

Decision: Use Vite React TypeScript as the app foundation.

Rationale: This gives fast local iteration, typed UI state, and a familiar React component model for the prototype.

Rejected options:

- Plain JavaScript. Rejected because TypeScript helps keep task, status, and subtask state explicit.
- Server-rendered framework. Rejected because the slice has no server-side requirements yet.

### `/tasks` as the primary screen

Decision: Make `/tasks` the first concrete route.

Rationale: Relay's first validated workflow is task review and completion. A dedicated route keeps the prototype focused and gives future implementation notes a stable reference point.

Rejected options:

- Start with a dashboard. Rejected because dashboard metrics are undefined until task behavior is known.
- Start with settings or integration screens. Rejected because backend and DCC integration are out of scope.

### Deterministic seed reset on load

Decision: Reset seed data deterministically on each page load.

Rationale: The prototype should be reproducible. Resetting local seed state avoids hidden persistence, stale demos, and test order dependence.

Rejected options:

- Persist edits to local storage. Rejected for this slice because it makes demos and debugging less predictable.
- Fetch mock data from a local server. Rejected because it introduces backend-like setup before it is needed.

### Group tasks by status

Decision: Present tasks in a table grouped by status.

Rationale: Status grouping makes the work queue scannable and makes auto-completion visible when a task changes state.

Rejected options:

- Flat list only. Rejected because it hides workflow state.
- Kanban board first. Rejected because table density is better for inspecting task metadata in this early slice.

### Slide-in task pane

Decision: Use a slide-in pane for task details instead of navigating away from the table.

Rationale: Users should keep list context while inspecting details and toggling subtasks.

Rejected options:

- Full page task detail route. Rejected because it interrupts the list review workflow.
- Modal dialog. Rejected because the pane can support denser details while preserving spatial context.

### Auto-complete when all subtasks complete

Decision: Mark a task complete automatically when all of its subtasks are complete.

Rationale: This demonstrates Relay's workflow automation intent without requiring backend rules or integrations.

Rejected options:

- Require a separate complete button. Rejected because it adds an extra manual step to a deterministic subtask workflow.
- Leave task status unchanged. Rejected because it would make subtask completion feel disconnected from task progress.

## Open Decisions

- Exact status taxonomy and allowed transitions.
- Whether incomplete subtask toggles should reopen an auto-completed task.
- Whether filters should be URL-addressable.
- What fields are required for a future backend task record.
- How DCC-originated tasks should be identified and reconciled.

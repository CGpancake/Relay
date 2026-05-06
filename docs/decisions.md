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

### Task review panes

Decision: Use slide-in panes for task details instead of navigating away from the table.

Rationale: Users should keep list context while inspecting details, comparing review states, reading comments, and toggling subtasks. Multi-selection supports side-by-side comparison without leaving the task table.

Rejected options:

- Full page task detail route. Rejected because it interrupts the list review workflow.
- Modal dialog. Rejected because the pane can support denser details while preserving spatial context.

### Auto-complete when all subtasks complete

Decision: Mark a task complete automatically when all of its subtasks are complete.

Rationale: This demonstrates Relay's workflow automation intent without requiring backend rules or integrations.

Rejected options:

- Require a separate complete button. Rejected because it adds an extra manual step to a deterministic subtask workflow.
- Leave task status unchanged. Rejected because it would make subtask completion feel disconnected from task progress.

### Relay design system implementation

Decision: Apply the documented Relay brutalist design system to the frontend prototype.

Rationale: The app should validate the intended production visual language early: JetBrains Mono, single surface, 0px radius, 0.5px structure, and colour used as semantic status marks.

Rejected options:

- Keep the previous rounded multi-surface styling. Rejected because it conflicted with the design system.
- Treat community themes as arbitrary user-entered colours. Rejected because the design system requires pre-validated theme units.

### Theme catalogue support

Decision: Ship Concrete Light, Concrete Dark, Concrete Dim, and every validated community theme from `docs/relay-community-themes.md` as predefined token sets.

Rationale: This validates theme persistence, light/dark switching, and terminal-theme compatibility without introducing an unsafe colour picker.

### Frontend-only roles and permissions

Decision: Model Admin, Manager, Artist, and Client permission levels in local frontend state only, separate from each person's visible company role.

Rationale: The prototype needs to demonstrate view access and permission-specific controls before backend authentication exists, while still letting the app show human-readable company positions in navigation, settings, Allocation rows, and task context. Current behavior is intentionally not production security.

Rejected options:

- Hide permissions until backend work begins. Rejected because view access affects product shape.
- Implement real authorization now. Rejected because authentication, backend APIs, and durable users are still out of scope.
- Use `role` for both company position and access tier. Rejected because it made permission labels leak into non-admin product surfaces.

### Local Allocation model

Decision: Add deterministic local `Person`, `Project`, and `Allocation` data for producer planning.

Rationale: Allocation planning is a core workflow to validate alongside tasks. A local model supports selection, bulk edits, and over-allocation warnings without committing to final backend contracts.

### In-memory Projects view

Decision: Add `/projects` as a frontend-only project management surface backed by React state, with project tag/tool metadata and restoreable archive behavior.

Rationale: Project creation affects task filters, allocation project pickers, and task creation workflows. Keeping projects in local state lets the prototype validate these flows without introducing durable persistence or backend contracts.

Rejected options:

- Keep projects as a fixed imported constant. Rejected because created projects and metadata edits need to appear across prototype views during the session.
- Add localStorage persistence for projects or archive state. Rejected because deterministic reset remains a prototype goal.
- Build backend project APIs now. Rejected because the current goal is interaction validation, not contract finalization.

### Restoreable Archive

Decision: Treat project deletion as archive-only, and move deleted/archived tasks and subtasks into an in-memory Archive view.

Rationale: The prototype needs to validate deletion intent without destructive data loss. Archiving keeps task and allocation relationships inspectable, enables restore flows, and lets filters/counts be tested before durable backend records exist.

Rejected options:

- Permanently delete projects. Rejected because the requested behavior is warning plus restore.
- Hide deleted records without an Archive view. Rejected because users need an explicit place to inspect and restore removed work.
- Persist archive records in browser storage. Rejected because reload reset remains a prototype invariant.

### Project metadata

Decision: Add multi-select project tags and tools to seed data, project creation, project detail editing, and Archive filtering.

Rationale: Deliverable and tooling metadata affect project triage and archived work retrieval. Modeling them now validates the UI and filter shape without finalizing backend schemas.

Rejected options:

- Freeform tags and tools. Rejected because this prototype needs predictable deterministic options.
- Keep metadata out of project creation. Rejected because created projects should behave like seeded projects across filters and Archive.

### Exact allocation slot selection

Decision: Allocation Selection identity includes `personId`, `date`, `rowType`, and `projectId` for project rows.

Rationale: A person/date pair is not specific enough after project rows are expanded. Selecting a project allocation cell should edit only that project/date/person slot, while selecting a summary cell should still create or update the chosen editor project.

Rejected options:

- Keep person/date selection only. Rejected because project-row selections could accidentally affect other project rows for the same person and date.
- Disallow mixed summary and project selections. Rejected because producers may need to apply a single hours/status edit across exact project slots and new summary allocations in one action.

### Allocation control placement

Decision: Keep the day/week/month/year/date controls in the right Allocation column above the selected-cells editor, aligned to the editor width.

Rationale: The controls are part of the allocation editing side panel rather than the main allocation grid. Aligning them with the selected-cells editor preserves the original right-side layout while avoiding full-width controls that compete with the allocation timeline.

### User-default task filtering

Decision: Add a first `User` filter to the task board and default it to the current browsing person.

Rationale: Relay should open on the work most relevant to the signed-in or impersonated user while still allowing producers and admins to switch to all users or another seeded person.

Rejected options:

- Default to all users. Rejected because the board became less personal and made individual task ownership harder to validate.
- Hide other users entirely. Rejected because manager and admin workflows need cross-person inspection.

### Quieter collapsed Allocation

Decision: Start Allocation with all people collapsed and make project allocations read as accent linework over faint grid structure rather than translucent bands.

Rationale: The default Allocation view should support scanning people and daily hour totals first. Project detail remains available on expansion, with selected cells, over-allocation, and expand controls carrying the strongest visual weight.

Rejected options:

- Expand every person by default. Rejected because it made the Allocation dense before the user asked for project detail.
- Use tinted allocation interiors. Rejected because they competed with grid lines and made text less readable.

### Relay checkbox styling

Decision: Render task, subtask, permission, and attachment checkboxes as custom square line controls with filled checked states.

Rationale: Native checkbox styling varied by browser and visually fought the Relay line-based UI. A shared square control keeps task rows, subtask lists, and admin controls consistent.

### Seeded review data in tasks

Decision: Store seeded review versions and comments directly on each task in prototype state.

Rationale: Review media controls, version addressing, comment history, composer send, and add-subtask behavior need real state transitions to validate the task review workflow. Styled placeholders are enough for this slice because uploaded media storage and playback are out of scope.

Rejected options:

- Use real uploaded media files. Rejected because media storage and asset pipeline concerns are not part of this frontend prototype.
- Keep comments as static pane-only text. Rejected because send behavior should mutate task state to validate the interaction.

### In-app task notifications and following

Decision: Store task followers and frontend-only notification records in React state.

Rationale: Follow/unfollow behavior and update notifications are part of the task collaboration workflow, but browser push, realtime delivery, read models, and backend persistence are out of scope. A local notification bell validates placement and event semantics while preserving deterministic reload behavior.

Rejected options:

- Browser push notifications. Rejected because backend delivery and permissions are not part of this slice.
- Always notify everyone. Rejected because following behavior needs to be validated.
- Persist notifications. Rejected because task/archive/project state resets on reload.

### Persistent app header and collapsible navigation

Decision: Move the notification bell into a dedicated top app header and make the side view menu collapsible.

Rationale: The bell should be always visible without overlapping view content. The header gives `RELAY` a stable app-level home, aligns global controls with the content grid, and the collapsible rail preserves screen width while keeping view icons available.

Rejected options:

- Keep the bell absolutely positioned inside content. Rejected because it overlapped page headers and controls.
- Hide navigation entirely when collapsed. Rejected because the narrow rail should remain a visible affordance and expansion target.

## Open Decisions

- Exact status taxonomy and allowed transitions.
- Whether incomplete subtask toggles should reopen an auto-completed task.
- Whether filters should be URL-addressable.
- What fields are required for a future backend task record.
- How DCC-originated tasks should be identified and reconciled.
- How frontend prototype permissions map to eventual backend authorization policies.
- Whether Allocations should become hourly records or remain daily records with hour totals.
- Whether project creation should require more metadata than `name` and `code`.
- Whether task review versions should become first-class records separate from tasks.
- How multi-pane task review should behave on narrow screens beyond the current prototype behavior.
- Which notification events should be user-configurable.
- Whether archive restore should support partial project bundles.

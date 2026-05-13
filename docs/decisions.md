# Decisions

### Unified Calendar route and Time Off terminology

Decision: Replace the separate Allocation, Bookings, and Goals and Milestones sidebar entries with one Calendar entry at `/calendar`. Calendar mode is deep-linked with `mode=allocation`, `mode=time-off`, or `mode=milestones`; legacy `/allocation`, `/bookings`, and `/goals` paths resolve to the matching Calendar mode.

Rationale: Producers need one planning surface where allocation, time off, and future milestone layers can be compared without navigating between separate views. The active mode controls the right-side editor, while Settings controls default visible calendar layers. The active mode overlay is always on. Milestones is intentionally placeholder-only until milestone data is defined.

Consequences:
- Bookings is now named Time Off in product language, labels, tests, and user-facing documentation.
- Calendar access is granted when a user can access at least one calendar mode. Mode permissions remain distinct in behavior.
- Time Off remains visual-only for allocation capacity. Allocation still uses the fixed 8-hour person/day capacity.
- Time Off and overbooking use the same hatch geometry. Holiday is blue, sick leave is green, and overbooking is red.

### Calendar polish and overlay settings

Decision: Keep Calendar mode switching in the Calendar header, but move overlay visibility defaults to Settings under time planning.

Rationale: Mode switching is an in-context editing choice, while overlay visibility is a display preference that should persist with other planning settings. Moving overlay defaults out of the Calendar reduces clutter and keeps the top of the planning surface focused on mode and date navigation.

Consequences:
- Settings owns default visibility for Allocation and Time Off overlays. Milestones remains a disabled placeholder overlay.
- Calendar still forces the active mode overlay on at render time, even when the saved default for that overlay is off.
- Calendar rows size to visible content, person sublabels show only position, overbooking hatches sit below project allocation identity, and the Allocation editor starts directly with the Project control.

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

### Timed Allocation segments

Decision: Store Allocation records as 15-minute snapped timed segments with `startMinute` and `endMinute`, deriving duration from the range instead of storing daily hour totals.

Rationale: The original allocation request only needed daily totals, but producer planning feedback added day-level time placement, multiple same-day project segments, move/resize editing, and current-time awareness. Timed segments preserve the existing compact week/month/year summaries while making the Day view a real timeline editor.

Rejected options:

- Keep hour-only daily records. Rejected because it could not represent multiple blocks, drag placement, or partial-day past striping.
- Make Time Off define capacity immediately. Rejected because time off rules are still undefined; capacity stays fixed at 8 hours per person/day for this demo.
- Disallow overlaps. Rejected because the prototype needs to expose overbooking rather than silently prevent it.

### Goals and Time Off routes

Decision: Add Milestones plus Time Off as internal-only routes for Admin, Manager, and Artist users.

Rationale: The requested prototype scope expanded beyond Tasks, Projects, and Allocation. Time Off now validates leave/time off marking and approval without making time off reduce Allocation capacity.

Rejected options:

- Build full Time Off capacity behavior now. Rejected until producer feedback defines real capacity, leave, and time off constraints.
- Expose placeholders to Clients. Rejected because both views are internal planning surfaces.

### Shared allocation and time off calendar structure

Decision: Allocation and Time Off share the same date toolbar, compact row structure, day timeline conventions, past-time layer, time off overlay source, and project/allocation source data.

Rationale: Producers need consistent date navigation and temporal context across planning and leave review. Allocation remains project/utilization-first. Time Off remains leave-first and shows project allocation only as quiet context.

### Calendar refinement

Decision: Compact project rows render one timed allocation segment per record, positioned by its minute range within the day and labelled with only that segment duration. Person/project label width is derived from visible person names and project names, including folded project rows, then clamped so the calendar fits the available timeline field without bottom horizontal scrolling.

Decision: Calendar hatch patterns share one timeline-level stripe geometry and viewport-anchored phase across past-time, Time Off, and overbooking layers. Overbooking remains red and below allocation identity; holiday remains blue; sick leave remains green.

Decision: Day view uses persisted Settings padding with defaults of 2 past hours and 10 upcoming hours. Today's Day view shows `now - past padding` through `now + upcoming padding`, clamped to the day. Non-today Day view uses the same span from a stable 09:00 start, defaulting to 09:00-21:00.

Rationale: Producers need compact rows to communicate when same-day work happens without repeating project names in every cell. The focused Day window keeps current work editable without forcing a full 24-hour horizontal timeline, while settings preserve studio-specific planning preferences.

### Time Off approval and visual contract

Decision: Time Off records carry `type` (`holiday` or `sick-leave`) and `status` (`pending` or `confirmed`). New time off from every role default to pending. Admins and Managers can confirm selected pending time off or revert selected confirmed time off.

Rationale: Approval state is part of the time off workflow, but creation and approval should be explicit and consistent. Capacity impact remains intentionally deferred.

Final marking contract:

- Compact time off stripes are full-cell overlays in both Time Off and Allocation.
- Day time off stripes are timed-range overlays that fill the full row height across the booked range.
- Pending and confirmed time off use the same stripe geometry; pending uses translucent stripe bands, and confirmation strengthens those bands to full colour.
- Time Off stripes sit above past-time hatching and above selection/hover washes.
- Selected cells use a flat accent wash; hover uses a stronger flat accent wash and never uses hatching.
- Allocation and Time Off use the same past-time rules: compact past dates hatch the whole cell, while Day view hatches only elapsed time on the current day.
- Overlapping holiday/sick-leave time off for the same person, date, and time range are disallowed; adjacent non-overlapping ranges on the same date can coexist.

### Allocation capacity remains fixed

Decision: Time Off are visual-only in this slice and do not reduce allocation capacity. Allocation utilization and overbooking remain calculated against fixed 8-hour person/day capacity.

Rationale: Leave policy, working calendars, partial capacity, and conflict rules are not final. Keeping capacity fixed makes the prototype deterministic while still exposing time off in both views.

### Allocation planning and actualization permissions

Decision: Admins and Managers can edit all allocation plans. Artists can edit only their own allocation segments/statuses so a future actualization flow can let them review and update their work after manager planning.

Rationale: The prototype needs to distinguish manager planning authority from artist self-reporting without introducing backend authorization in this slice.

### App-level planning timezone

Decision: Add a Settings timezone value persisted to localStorage and use it for Day view current-time marker and past-time striping.

Rationale: Planning views need one consistent app timezone rather than relying only on the browser clock. The default remains the browser timezone for low-friction demos.

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
- How Time Off should eventually define real working capacity, leave, holds, and conflicts.
- Whether project creation should require more metadata than `name` and `code`.
- Whether task review versions should become first-class records separate from tasks.
- How multi-pane task review should behave on narrow screens beyond the current prototype behavior.
- Which notification events should be user-configurable.
- Whether archive restore should support partial project bundles.

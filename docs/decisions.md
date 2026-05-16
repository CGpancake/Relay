# Decisions

## Frontend-only prototype

Decision: keep Relay as a deterministic frontend prototype while workflow shape is still changing.

Rationale: local state keeps iteration fast and avoids implying final backend contracts too early.

## Deliverables language with Task internals

Decision: use Deliverables/Subdeliverables in user-facing copy, routes, tests, and docs while preserving internal `Task`, `Subtask`, `tasks`, and `task/*` names.

Rationale: this delivers the product terminology change without a broad data-model refactor.

## `/deliverables` canonical route

Decision: make `/deliverables` the route written by the shell and keep `/tasks` as a compatibility alias.

Rationale: existing tests, links, and internal model names can continue to work while new navigation reflects the product language.

## Group deliverables by status

Decision: present deliverables in a dense table grouped by status.

Rationale: status grouping keeps the queue scannable and makes automatic completion visible.

## Review panes

Decision: keep deliverable details in slide-in panes and allow up to three panes.

Rationale: reviewers can compare work without losing list context.

## Restoreable archive

Decision: archive projects, deliverables, subdeliverables, and tied allocations instead of permanently deleting them.

Rationale: the prototype needs to validate deletion intent, reporting, and restore flows without destructive state.

## Archive relationship graph

Decision: implement the Archive graph with a native React-managed canvas and `requestAnimationFrame`, without adding a graph dependency.

Rationale: the graph is interaction-heavy but bounded enough for a local force layout, and avoiding a dependency keeps the prototype simpler.

Current behavior: Archive uses an even desktop split between grouped filters and the canvas graph. Wheel input over the canvas zooms the graph instead of scrolling the page, force sliders start at their minimums, and node fills are distributed across existing theme tokens while focus emphasis follows the selected accent.

## Calendar deliverable attachments

Decision: keep Calendar deliverable attachments transient and use them to update selected deliverable due dates on apply.

Rationale: this validates producer planning behavior without changing the allocation data contract.

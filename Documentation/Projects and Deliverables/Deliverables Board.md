# Deliverables Board

The deliverables board is the main place to inspect and update production work. Deliverables are grouped by status and can be filtered by user, status, phase, priority, project, and search text.

## Workflow

1. Start on Deliverables.
2. Use filters to narrow the visible queue.
3. Open a deliverable row to inspect details in the review pane.
4. Edit status, phase, priority, or assignee when your prototype role allows it.
5. Toggle subdeliverables as work is completed.
6. Add comments or subdeliverables from the composer.

## Review panes

Rows open side panes for deliverable details. Each pane shows description, metadata, subdeliverables, review version thumbnails, comments, followers, and composer actions. Up to three deliverables can be inspected side by side through multi-select behavior.

The Novartis `3D pass SH_09` deliverable is wired to local prototype media in `Demo_Versions/Elements`. During Vite development, `/demo-review/elements/manifest.json` scans version folders such as `V01` through `V05` and exposes PNG frames in place.

Each opened pane starts on the latest review version. The thumbnail opens fullscreen review with frame stepping, version selection, zoom controls, Select/Box/Pen annotation modes, locked annotation colours, selected annotation deletion, version-addressed comments, and A/B preview.

## Subdeliverables

Subdeliverables track the practical pieces of a deliverable. When every subdeliverable is complete, the parent deliverable moves to Done. Undo to WIP lets the behavior be tested without losing state.

Deliverables and subdeliverables are archived instead of permanently deleted. Archive actions are available through visible buttons, context menus, and keyboard Delete or Backspace behavior for selected rows.

See [[Archive and Restore]] for restore rules, archive metrics, and the relationship graph.

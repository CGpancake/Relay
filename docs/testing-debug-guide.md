# Testing and Debugging Guide

## Commands

- `npm run build`
- `npm run test:smoke`

## Smoke Coverage Targets

- `/deliverables` opens the Deliverables view.
- `/tasks` aliases to the same Deliverables view.
- Sidebar navigation says Deliverables.
- Deliverables are grouped by status and filters narrow the visible rows.
- Selecting a deliverable opens a pane; Ctrl/meta and Shift selection can open up to three panes.
- Review thumbnails, fullscreen review, annotation tools, zoom, comments, and A/B preview work.
- Subdeliverable toggles update progress and automatic completion.
- Projects can create and delete/archive deliverables with Deliverables copy.
- Calendar attachment UI says deliverables and still updates due dates.
- Archive copy says deliverables/subdeliverables and restore behavior still works.
- Documentation browser shows Projects and Deliverables and Deliverables Board.
- Archive workspace renders as grouped left-side filters and a right-side canvas graph on desktop, with the Archive numbers section collapsed below it.
- Archive graph controls expose Display and Forces, compact checkboxes and sliders, minimum default force values, wheel-to-zoom without page scroll, nonblank canvas rendering, token-colored node groups, and accent-colored focus emphasis.

## Debug Notes

Most state resets on reload. Check local storage only for theme, accent, current user, timezone, calendar overlay, and Day-view padding issues.

If a pane and table disagree, derive selected deliverables from canonical `tasks` state by id instead of copying objects.

If Archive restore looks wrong, verify whether the parent project is active. Standalone deliverables can only be restored when their project is active.

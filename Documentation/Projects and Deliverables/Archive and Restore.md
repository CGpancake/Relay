# Archive and Restore

Archive is a restoreable holding area for work removed from active views. It shows active and archived projects together, archived deliverables, archived subdeliverables, related allocation bundles, unified filters, collapsed aggregate counts, and restore actions.

## What moves into Archive

- Projects.
- Deliverables.
- Subdeliverables.
- Allocation bundles tied to archived projects.

Restoring a project returns the project, its archived deliverables, and its tied allocations to the active views. Restoring a standalone deliverable is allowed when the deliverable's project is active. Subdeliverable archive records are shown for visibility; the current prototype focuses restore behavior on projects and deliverables.

## Metrics and filters

Archive reports active projects, archived projects, archived deliverables, completed deliverables, subdeliverable completion, tag counts, tool counts, and studio counts in the collapsed Archive numbers section below the main workspace.

The main Archive workspace is split evenly on desktop: the left half is a grouped filter panel and the right half is the relationship graph. The filter panel contains archive search, project tag/tool filters, deliverable status/phase filters, active/archived toggles, and graph entity toggles. On smaller screens the filters and graph stack vertically.

## Relationship graph

The relationship graph visualizes the same archive report universe: active and archived projects, archived deliverables and visible subdeliverables, studios, tags, tools, users, status, phase, and priority. It uses a native canvas force layout with pan, zoom, drag, hover focus, selected-node neighbor emphasis, and reset view.

Wheel or trackpad scrolling over the graph zooms the graph and does not scroll the page. The default forces start at their minimum values so the graph opens in a calm clustered layout. Node groups use existing theme tokens: work entities draw from active, success, and pending colors, metadata entities draw from special, danger, and secondary ink colors, and focused rings and emphasized links continue to follow the selected main accent.

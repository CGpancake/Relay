# Relay Docs Wiki

This wiki records implementation memory for the first slice of Relay.

## Start Here

- [[project-overview]] - product intent, first-slice scope, and non-goals.
- [[decisions]] - decisions made so far, rationale, and rejected options.
- [[implementation-log]] - chronological notes about what was implemented and why.
- [[testing-debug-guide]] - how to verify behavior and debug common issues.
- [[glossary]] - shared terms used in the prototype.

## Current Slice

Relay is currently a frontend-only prototype built with Vite, React, and TypeScript. The first useful screen is `/tasks`, showing deterministic task seed data that resets on every page load.

The prototype demonstrates a task workflow:

- Task table grouped by status.
- Filters for narrowing visible tasks.
- Slide-in task pane for inspecting task details.
- Subtask toggles.
- Automatic task completion when every subtask is complete.

There is no backend, persistence layer, DCC integration, authentication, or production deployment target in this slice.

## Known Next Questions

- What statuses and transitions should exist once the workflow is connected to real data?
- Which DCC packages need to be represented first, and what metadata do they provide?
- Should subtask completion be reversible after auto-completion?
- What should persist locally, if anything, before a backend exists?
- What shape should the eventual API contract take?

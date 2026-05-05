# Project Overview

## Intent

Relay is being implemented as a frontend-first prototype to validate the task workflow before backend, persistence, or DCC integration work begins.

The first slice focuses on making the `/tasks` experience tangible with deterministic local data and predictable UI behavior.

## First-Slice Scope

Included:

- Vite React TypeScript application foundation.
- `/tasks` screen as the primary prototype surface.
- Deterministic seed data reset on page load.
- Task table grouped by status.
- Task filters.
- Slide-in task pane for task details.
- Subtask toggles inside the task pane.
- Auto-completion of a task when all of its subtasks are marked complete.

Excluded for now:

- Backend service.
- Database or durable persistence.
- DCC integration.
- Authentication and authorization.
- Realtime collaboration.
- Production data import/export.

## Product Behavior

The `/tasks` screen should make the workflow understandable without external dependencies. A user can inspect grouped work, narrow the task list with filters, open a task, toggle subtasks, and see the task move to completed state when all subtasks are complete.

Because seed data resets on load, every session starts from the same state. This keeps demos, debugging, and tests reproducible.

## Architecture Boundary

The current implementation should treat task data as in-memory prototype state. Any data model should be shaped carefully enough to resemble future backend records, but should not imply that backend contracts are final.

## Non-Goals

- Do not build backend APIs in this slice.
- Do not connect to DCC tools yet.
- Do not introduce persistence that makes reset behavior ambiguous.
- Do not optimize for multi-user or realtime behavior before the core workflow is validated.

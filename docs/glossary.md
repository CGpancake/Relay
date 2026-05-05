# Glossary

## Relay

The prototype application being built. In this first slice, Relay is a frontend-only task workflow prototype.

## First Slice

The initial implementation target: a Vite React TypeScript frontend with a `/tasks` screen, deterministic seed data, task grouping, filters, a slide-in task pane, subtask toggles, and automatic completion.

## `/tasks`

The primary route for the first prototype workflow. It contains the task table and task detail pane interactions.

## Task

A unit of work displayed in the `/tasks` table. A task has a status and may contain subtasks.

## Status

The workflow state used to group tasks in the table. Exact production statuses are not final.

## Task Group

A table section containing tasks with the same status.

## Filter

A UI control that narrows which tasks are visible in the table. Filters should affect visibility only, not mutate task data.

## Slide-in Task Pane

The detail surface that opens from the side when a task is selected. It allows users to inspect task details without leaving the task table.

## Subtask

A smaller checklist item inside a task. Completing all subtasks triggers automatic completion of the parent task in this slice.

## Auto-complete

The prototype behavior that marks a task complete when every subtask is complete.

## Deterministic Seed Data

Local prototype data that is generated the same way every time the app loads. It should reset on page load.

## Backend

A future service layer for persistence, APIs, permissions, and integration. It is not part of the first slice.

## DCC

Digital content creation tooling or pipeline integration. DCC integration is deferred until after the frontend workflow is validated.

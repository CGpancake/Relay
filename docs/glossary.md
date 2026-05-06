# Glossary

## Relay

The prototype application being built. In this first slice, Relay is a frontend-only task workflow prototype.

## First Slice

The initial implementation target: a Vite React TypeScript frontend with deterministic task, project, people, allocation, archive, and notification data; task grouping and filters; task review panes; project creation; allocation planning; archive/restore flows; subtask toggles; and automatic completion.

## `/tasks`

The primary route for the task workflow. It contains the task table and task review pane interactions.

## `/projects`

The prototype route for inspecting projects, creating frontend-only projects, and creating project tasks.

## `/allocation`

The prototype route for producer allocation planning across people, projects, and dates.

## `/archive`

The prototype route for archived projects, tasks, subtasks, aggregate archive metrics, archive filters, and restore actions.

## App Header

The persistent top row containing `RELAY` on the left and the in-app notification bell on the right.

## Side Navigation

The left view menu for Projects, Allocation, Tasks, Archive, People, and Settings. It can collapse into a narrow icon rail and expand again from the header brand or rail.

## Task

A unit of work displayed in the `/tasks` table. A task has a status and may contain subtasks.

## Status

The workflow state used to group tasks in the table. Exact production statuses are not final.

## Task Group

A table section containing tasks with the same status.

## Filter

A UI control that narrows which tasks are visible in the table. Filters should affect visibility only, not mutate task data.

## Task Review Pane

The detail surface that opens from the side when a task is selected. Up to three panes can be open at once for comparison. Panes include editable task metadata, seeded review versions, comments, subtasks, follow controls, and a message composer.

## Review Version

A seeded media placeholder attached to a task. The prototype uses versions to validate previous/next controls, a version dropdown, fullscreen preview, and version-addressed comments.

## Comment

A task review message with author, date, addressed review version, and body.

## Subtask

A smaller checklist item inside a task. Clicking a subtask row highlights it; clicking the checkbox toggles completion. Completing all subtasks triggers automatic completion of the parent task in this slice.

## Highlighted Item

The currently selected row-like item on a list surface. Highlighted tasks and subtasks can be archived with Delete/Backspace or visible actions.

## Follower

A person listed on a task's `followers` array. The assigned user follows by default. Other visible permitted users can follow or unfollow non-client-visible tasks.

## In-App Notification

A frontend-only record surfaced through the header bell when followed tasks are updated. Notifications reset on reload.

## Auto-complete

The prototype behavior that marks a task complete when every subtask is complete.

## Deterministic Seed Data

Local prototype data that is generated the same way every time the app loads. It should reset on page load.

## Theme

A predefined Relay token set for surface, ink, line, and semantic status colours.

## Community Theme

A validated terminal/editor palette mapped into Relay's theme token schema. Community themes are selected from a predefined catalogue, not entered as raw user colours.

## Person

A local prototype user record with a name, role, discipline, and per-view permissions.

## Role

A visible company position or label shown in non-admin product surfaces.

## Permission Level

A prototype access preset. Current permission levels are Admin, Manager, Artist, and Client.

## Permission

A frontend-only view access flag for Tasks, Allocation, Projects, People, or Settings. These permissions demonstrate product behavior and are not production authorization.

## Project

A local prototype work container with `id`, `name`, `code`, tags, tools, and optional archive metadata. Projects can be seeded or created in-memory during the current session.

## Project Tag

A deliverable-style project metadata value. Current prototype tags are `print`, `cg`, and `ai`.

## Project Tool

A project metadata value for planned production tooling. Current prototype tools are `Houdini`, `Comfy`, `Nanobanana`, `Blender`, and `Unreal`.

## Archive

The in-memory restoreable store for projects, tasks, subtasks, and allocation bundles removed from active views. Archive state resets on reload.

## Restore

The action that moves an archived record back into active prototype state. Restoring a project restores the project, its archived tasks, and its tied allocations.

## Allocation

A local planning record that assigns a person to a project on a date for a number of hours, with status and notes.

## Allocation Selection

The current set of selected exact cells in the allocation planner. Selection identity includes person, date, row type, and project id for project rows. Click selects one cell, shift-click selects a contiguous date range for the same exact row identity, and ctrl/meta-click toggles individual cells.

## Summary Row

A Allocation person/date row that summarizes all project allocations for one person on a date.

## Project Row

An expanded Allocation row for one person's allocation to one project. Project-row selections keep their project identity during allocation edits.

## Backend

A future service layer for persistence, APIs, permissions, and integration. It is not part of the first slice.

## DCC

Digital content creation tooling or pipeline integration. DCC integration is deferred until after the frontend workflow is validated.

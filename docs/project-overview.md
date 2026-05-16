# Project Overview

Relay is being implemented as a frontend-first prototype to validate deliverable coordination before backend, persistence, or DCC integration work begins.

## Current App

The shell exposes Projects, Calendar, Deliverables, Bidding, Archive, Documentation, People, and Settings. The canonical deliverables path is `/deliverables`; `/tasks` is retained as an alias because early tests and links used it.

Projects are grouped by studio and carry tags and tools. Admin and Manager users can create projects and project deliverables. Deliverables use the existing internal `Task` model, but UI copy, navigation, routes, and documentation use deliverable/subdeliverable language.

The Deliverables view includes grouped rows, filters, multi-select panes, review thumbnails, fullscreen frame review, annotation tools, A/B preview, zoom, comments, follower notifications, editable status/phase/priority/assignee fields, and subdeliverable completion.

Calendar supports Allocation, Time Off, and Milestones modes. Allocation has day/week/month/year views, horizontal timeline panning, overbooking indicators, selected-date overlays, editor modes, transient deliverable attachments, and due-date updates on apply.

Archive shows active and archived projects together, archived deliverables and subdeliverables, restore actions, collapsed aggregate counts, and a desktop workspace split between grouped left-side filters and a right-side canvas relationship graph. Filters cover search, project tag/tool, deliverable status/phase, archive state, and visible graph entities. The graph includes studios, projects, deliverables, subdeliverables, tags, tools, users, status, phase, and priority, supports pan/drag/zoom, captures wheel input for graph zoom, and colors node groups from theme tokens.

People and Settings validate local permission and preference behavior. Permission controls are frontend affordances only.

## State Model

Project, deliverable, allocation, archive, comment, annotation, and notification state is local prototype state and resets on reload unless explicitly stored in browser local storage. Theme, accent, current user, timezone, calendar overlays, and Day-view padding persist locally.

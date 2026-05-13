# Navigation

Relay uses a persistent header and a left navigation rail. The header contains the Relay brand button and notification bell. The sidebar contains each app view and can collapse into a narrow icon rail.

## Views

- Projects: create projects, edit project metadata, archive projects, and create tasks for a selected project.
- Allocation: plan timed work segments across people, projects, dates, statuses, and notes.
- Milestones: internal placeholder for future goal and milestone planning.
- Time Off: mark pending holiday and sick leave, approve or revert selected time off stripes, and block overlapping time off; time off are visual-only and do not reduce Allocation capacity yet.
- Tasks: inspect grouped work, filter tasks, open review panes, edit task metadata, manage subtasks, and send comments.
- Archive: review archived projects, tasks, subtasks, and allocation bundles, then restore eligible work.
- Documentation: browse and read the human wiki from the `Documentation/` folder.
- People: manage people, roles, permission levels, and per-view access.
- Settings: switch theme and current prototype user.

## Prototype routing

Each app view maps to a simple browser path such as `/tasks`, `/projects`, or `/documentation`. Reloading one of these paths opens that view again, as long as the current prototype user has permission to access it.

Milestones and Time Off are available to Admin, Manager, and Artist users only. Client users cannot access those internal planning views.

## Notifications

The notification bell stores frontend-only task update records for the current session. It is useful for testing follower behavior, but it is not a realtime or persistent notification system.

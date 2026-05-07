# Allocation Calendar

The Allocation view is a producer planning surface. It shows people, project rows, dates, hours, utilization, and task due dates in one calendar-like grid.

## Views

Allocation supports day, week, month, and year views. Person rows start collapsed for scanning. Expanding a person reveals project rows for more detailed planning.

## Selection

Cells can be selected directly, with range selection and toggle selection supported. Summary-row selections use the editor project picker. Project-row selections keep their own project context. Mixed summary and project selections are allowed.

## Editing allocations

The editor can apply hours, status, notes, and task attachments to the selected cells. Summary totals update immediately after changes. Over-allocation is marked when a person exceeds 8 assigned hours on a date.

## Past dates

Dates before the browser's local current day use subtle hatching. This helps separate planning work from historical schedule context without adding another panel or mode.

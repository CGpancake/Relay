# Allocation Calendar

The Calendar view is a producer planning surface with Allocation, Time Off, and Milestones modes. It shows people, project rows, dates, timed segments, utilization, holidays, selected dates, and deliverable due dates.

## Allocation mode

Allocation supports day, week, month, and year views. Week and month use a buffered previous/current/next timeline for horizontal panning. Day view supports snapped block creation, selected date markers, context delete, current-time behavior, and configurable past/upcoming hour padding.

The editor applies timed segments, status, notes, and transient deliverable attachments. Depending on the current selection it shows Create mode, Replace cell mode, or Edit selected segment mode.

Deliverable attachments use a compact multi-select dropdown. They remain editor-only choices: applying an allocation updates selected deliverable due dates to the latest selected date, but allocation records do not persist deliverable ids.

## Time Off and Milestones

Time Off validates holiday and sick-leave marking, pending/confirmed states, hourly or full-day entries, and manager approval controls. Milestones is a reserved mode with overlay settings ready for future milestone data.

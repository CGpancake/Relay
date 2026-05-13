# Allocation Calendar

The Allocation view is a producer planning surface. It shows people, project rows, dates, timed segments, utilization, and task due dates in one calendar-like planner.

Allocation and Time Off share the same calendar structure: date toolbar, compact rows, day timeline conventions, past-time hatching, time off overlays, and the same project/allocation source context. Allocation emphasizes project timing and utilization. Time Off emphasizes leave and approval.

Calendar mode buttons stay in the Calendar header. Overlay defaults for Allocation and Time Off live in Settings under time planning; Milestones is reserved as a disabled placeholder overlay. The active mode overlay is forced visible even if its saved default is off.

## Views

Allocation supports day, week, month, and year views. Person rows start collapsed for scanning. Expanding a person reveals project rows for more detailed planning.

Day view is a 24-hour timeline per person. Blocks snap to 15-minute increments and can be drag-created, moved, resized, selected, and opened by right-click for edit/delete actions. Overlaps are allowed and all overlapped duration counts toward utilization.

Week, month, and year views stay compact. They do not support direct timeline dragging; edits come from selecting cells and applying the selected-time segment pattern from the side pane.

## Selection

Cells and Day blocks can be selected directly, with range selection and toggle selection supported. Summary-row selections use the editor project picker. Project-row selections keep their own project context. Mixed summary and project selections are allowed.

## Editing allocations

The editor applies timed segments, status, notes, and task attachments. If explicit Day blocks are selected, Apply allocation updates those selected blocks. If plain cells are selected, Apply allocation appends the editor's segment list to every selected person/date target.

Delete or Backspace removes explicit selected allocation targets. A selected summary day clears that whole person/day. A selected project row or block removes only the selected project allocation segments.

Summary cells do not show numeric hour text. They visualize project segments in start-time order against fixed 8-hour capacity. Empty space remains visible when under-booked, overbooked cells are capped visually at full width, and overbooked days receive a danger treatment.

Time Off are visual-only in this slice. Holiday and sick leave overlays do not reduce capacity; utilization remains fixed against 8 hours per person/day.

Managers and Admins plan project timing for all people. Artists can edit only their own allocation segments/statuses so they can later actualize reviewed work.

## Time Off approval

Time Off can be Holiday or Sick leave. New time off start Pending for every role. Managers and Admins can confirm selected pending time off or revert selected confirmed time off to pending. In compact views, clicking a booked cell selects the time off stripes in that cell so approval does not require switching to Day view.

Time Off always render as stripes. Pending and Confirmed use the same stripe geometry: Pending uses translucent stripe bands, while Confirmed uses full-strength stripe bands. Compact time off stripes fill the whole cell in Allocation and Time Off. Day time off stripes fill the full row height across their booked time range. Time Off overlays sit above past-time hatching and selected/hover accent washes, and allocation context remains visible where those layers overlap. Overbooking stripes sit below project allocation fills and blocks so project identity remains readable.

Overlapping holiday/sick-leave time off for the same person, date, and time range are blocked with inline validation. Adjacent non-overlapping ranges on the same date are allowed.

## Past dates

The Settings timezone controls the Day view current-time marker and past-time striping. Allocation and Time Off use the same past-time rules: compact views hatch dates before today in that timezone, and Day view hatches only 15-minute increments before the current time, so today is partially striped. Selection uses a flat accent wash below time off/allocation context; hover uses a stronger flat wash and never uses hatching.

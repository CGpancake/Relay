# Settings and Themes

Settings contains prototype controls for visual theme, current user, and allocation planning timezone.

## Theme selection

Relay ships native concrete themes and a catalogue of community terminal-inspired themes. The interface keeps the same brutalist structure across themes: single surface, hairline borders, monospace text, and color used as status signal.

## Light and dark toggle

The Light and Dark buttons switch within the selected theme family when a matching variant exists. Some community themes do not have both modes, so one of the toggle buttons may be disabled.

## Persistence

Theme, current prototype user, and timezone are saved in browser local storage. Task, project, allocation, archive, and notification state still resets on page load.

## Timezone

The timezone setting defaults to the browser's local timezone. Allocation Day view uses it for the current-time marker and partial past-time striping. Compact Allocation views use it to decide which dates are in the past.

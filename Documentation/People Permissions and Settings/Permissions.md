# People and Permissions

Relay permissions are prototype UI affordances. They demonstrate role-specific behavior before production authentication or authorization exists.

## People fields

The People section can show and edit:

- Name
- Role label
- Discipline
- Email
- Phone
- Engagement status
- Notes
- Bot flag
- Permission level
- Per-view permissions

When the local FastAPI backend is running, People records can persist in the local SQLite database. If the backend is unavailable, the app can fall back to seeded frontend People data.

## Engagement status

- `permanent`: core team or long-term person.
- `available_to_hire`: freelance/contact person currently treated as available.
- `unavailable`: person known but not currently available.
- `unknown`: availability has not been classified yet.

Engagement status is not the same as permission level. A freelancer can still have the Artist permission level.

## Imported freelance contacts

Relay currently includes 365 imported freelance/contact records from the CM Freelance List 2026 spreadsheet. Duplicate names were merged by normalized name.

Imported contacts default to:

- Permission level: `Artist`
- Engagement status: `available_to_hire`

Contact details, rate/reel/comment fields, source sheet details, and other spreadsheet values are carried in notes where Relay does not yet have a first-class field.

## Permission levels

- Admin: full access, people administration, settings, project and deliverable creation, allocation editing, time-off approval, and archive restore.
- Manager: project and deliverable creation, allocation editing, time-off approval, archive restore, and read-only people access.
- Artist: project, calendar allocation, deliverables, archive, documentation, and people access by default. Artists can edit deliverables assigned to them and their own allocation.
- Client: limited project and documentation access, plus client-visible deliverables where the view is available.

Company role labels are shown in most app surfaces. Permission level appears in People administration controls because it is a prototype access concept.

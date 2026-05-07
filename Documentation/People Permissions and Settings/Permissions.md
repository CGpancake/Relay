# Permissions

Relay has frontend-only permission gates for the prototype. These gates are useful for validating product behavior, but they are not production authorization.

## Permission levels

- Admin: full access to all views and people management.
- Manager: access to production workflow views, but not Settings by default.
- Artist: access to project, allocation, task, archive, and documentation views by default.
- Client: limited workflow access, with documentation available by default.

People also have visible company roles. The role is what most UI surfaces show. The permission level controls what a prototype user can access.

## Per-view access

Admin users can toggle access to individual views from People. This allows the prototype to test how the interface behaves when views are locked for a person.

## Current user

Settings includes a Current user selector. Switching users is a prototype convenience for testing permissions. It is not authentication.

See also [[Settings and Themes]].

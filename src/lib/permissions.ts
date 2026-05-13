// UI affordances only. All permission enforcement moves to FastAPI middleware.
// canX() function names map 1:1 to planned API endpoint guards.
import type { PermissionLevel, Permissions, Person, ViewId } from '../types';

export const permissionsForPermissionLevel = (permissionLevel: PermissionLevel): Permissions => {
  switch (permissionLevel) {
    case 'Admin':
      return { projects: true, calendar: true, tasks: true, bidding: true, archive: true, documentation: true, people: true, settings: true };
    case 'Manager':
      return { projects: true, calendar: true, tasks: true, bidding: true, archive: true, documentation: true, people: true, settings: false };
    case 'Artist':
      return { projects: true, calendar: true, tasks: true, bidding: false, archive: true, documentation: true, people: false, settings: false };
    case 'Client':
      return { projects: true, calendar: false, tasks: true, bidding: false, archive: false, documentation: true, people: false, settings: false };
  }
};

export const canAccess = (person: Person, view: ViewId) => person.permissions[view];
export const canAccessCalendarMode = (person: Person, mode: 'allocation' | 'time-off' | 'milestones') => {
  if (!person.permissions.calendar) return false;
  if (mode === 'milestones') return person.permissionLevel !== 'Client';
  return person.permissionLevel !== 'Client';
};
export const canAdminPeople = (person: Person) => person.permissionLevel === 'Admin';
export const canManageAllocation = (person: Person) => person.permissionLevel === 'Admin' || person.permissionLevel === 'Manager';
export const canEditAllocation = (person: Person) => canManageAllocation(person) || person.permissionLevel === 'Artist';
export const canEditPersonAllocation = (person: Person, personId: string) => canManageAllocation(person) || (person.permissionLevel === 'Artist' && person.id === personId);
export const canApproveTimeOff = (person: Person) => canManageAllocation(person);
export const canApproveBookings = canApproveTimeOff;
export const canCreateProject = (person: Person) => person.permissionLevel === 'Admin' || person.permissionLevel === 'Manager';
export const canEditTask = (person: Person, assignee: string) =>
  person.permissionLevel === 'Admin' ||
  person.permissionLevel === 'Manager' ||
  (person.permissionLevel === 'Artist' && person.name === assignee);

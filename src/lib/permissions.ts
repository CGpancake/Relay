import type { PermissionLevel, Permissions, Person, ViewId } from '../types';

export const permissionsForPermissionLevel = (permissionLevel: PermissionLevel): Permissions => {
  switch (permissionLevel) {
    case 'Admin':
      return { projects: true, allocation: true, tasks: true, bidding: true, archive: true, documentation: true, people: true, settings: true };
    case 'Manager':
      return { projects: true, allocation: true, tasks: true, bidding: true, archive: true, documentation: true, people: true, settings: false };
    case 'Artist':
      return { projects: true, allocation: true, tasks: true, bidding: false, archive: true, documentation: true, people: false, settings: false };
    case 'Client':
      return { projects: true, allocation: false, tasks: true, bidding: false, archive: false, documentation: true, people: false, settings: false };
  }
};

export const canAccess = (person: Person, view: ViewId) => person.permissions[view];
export const canAdminPeople = (person: Person) => person.permissionLevel === 'Admin';
export const canEditAllocation = (person: Person) => person.permissionLevel === 'Admin' || person.permissionLevel === 'Manager';
export const canCreateProject = (person: Person) => person.permissionLevel === 'Admin' || person.permissionLevel === 'Manager';
export const canEditTask = (person: Person, assignee: string) =>
  person.permissionLevel === 'Admin' ||
  person.permissionLevel === 'Manager' ||
  (person.permissionLevel === 'Artist' && person.name === assignee);

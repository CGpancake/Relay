import {
  Archive,
  BookOpenText,
  CalendarDays,
  FolderKanban,
  Handshake,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type React from 'react';
import { ArchiveFeatureView } from '../features/archive';
import { BiddingFeatureView } from '../features/bidding';
import { CalendarFeatureView } from '../features/calendar';
import { DocumentationFeatureView } from '../features/documentation';
import { PeopleFeatureView } from '../features/people';
import { ProjectsFeatureView } from '../features/projects';
import { SettingsFeatureView } from '../features/settings';
import { TasksFeatureView } from '../features/tasks';
import { canAccess } from '../lib/permissions';
import type { Person, ViewId } from '../types';

export type ViewModule = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  canAccess: (person: Person) => boolean;
  Component: React.ComponentType;
};

export const views: ViewModule[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban, canAccess: (person) => canAccess(person, 'projects'), Component: ProjectsFeatureView },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, canAccess: (person) => canAccess(person, 'calendar'), Component: CalendarFeatureView },
  { id: 'tasks', label: 'Deliverables', icon: ListChecks, canAccess: (person) => canAccess(person, 'tasks'), Component: TasksFeatureView },
  { id: 'bidding', label: 'Bidding', icon: Handshake, canAccess: (person) => canAccess(person, 'bidding'), Component: BiddingFeatureView },
  { id: 'archive', label: 'Archive', icon: Archive, canAccess: (person) => canAccess(person, 'archive'), Component: ArchiveFeatureView },
  { id: 'documentation', label: 'Documentation', icon: BookOpenText, canAccess: (person) => canAccess(person, 'documentation'), Component: DocumentationFeatureView },
  { id: 'people', label: 'People', icon: Users, canAccess: (person) => canAccess(person, 'people'), Component: PeopleFeatureView },
  { id: 'settings', label: 'Settings', icon: Settings, canAccess: (person) => canAccess(person, 'settings'), Component: SettingsFeatureView },
];

export function viewFromPath(pathname: string): ViewId {
  if (pathname === '/allocation' || pathname === '/bookings' || pathname === '/goals') return 'calendar';
  if (pathname === '/deliverables' || pathname === '/tasks') return 'tasks';
  const candidate = pathname.replace('/', '') as ViewId;
  return views.some((view) => view.id === candidate) ? candidate : 'tasks';
}

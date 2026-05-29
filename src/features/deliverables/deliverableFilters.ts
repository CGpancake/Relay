import type { Person, Task, TaskPhase, TaskPriority, TaskStatus } from '../../types';

export type DeliverableFilters = {
  user: string;
  project: string;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
  priority: 'all' | TaskPriority;
  search: string;
};

export const matchesDeliverableFilters = (task: Task, filters: DeliverableFilters, currentUser: Person) => {
  const query = filters.search.trim().toLowerCase();
  const userMatches = filters.user === 'all' || task.assignee === filters.user;
  const projectMatches = filters.project === 'all' || task.projectId === filters.project;
  const statusMatches = filters.status === 'all' || task.status === filters.status;
  const phaseMatches = filters.phase === 'all' || task.phase === filters.phase;
  const priorityMatches = filters.priority === 'all' || task.priority === filters.priority;
  const clientMatches = currentUser.permissionLevel !== 'Client' || task.clientVisible;
  const searchMatches =
    query.length === 0 ||
    task.title.toLowerCase().includes(query) ||
    task.assignee.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query);

  return userMatches && projectMatches && statusMatches && phaseMatches && priorityMatches && clientMatches && searchMatches;
};

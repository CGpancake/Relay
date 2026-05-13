import type { AllocationStatus, PermissionLevel, ProjectTag, ProjectTool, TaskPhase, TaskPriority, TaskStatus, ViewId } from '../types';

export const statuses: TaskStatus[] = ['todo', 'wip', 'review', 'blocked', 'done'];
export const phases: TaskPhase[] = ['brief', 'layout', 'animation', 'lighting', 'delivery'];
export const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
export const permissionLevels: PermissionLevel[] = ['Admin', 'Manager', 'Artist', 'Client'];
export const viewIds: ViewId[] = ['projects', 'calendar', 'tasks', 'bidding', 'archive', 'documentation', 'people', 'settings'];
export const allocationStatuses: AllocationStatus[] = ['planned', 'queued', 'active', 'blocked', 'done'];
export const projectTags: ProjectTag[] = ['print', 'cg', 'ai', 'retouch'];
export const projectTools: ProjectTool[] = ['Houdini', 'Comfy', 'Nanobanana', 'Blender', 'Unreal', 'Photoshop'];

export const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  wip: 'WIP',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
};

export const phaseLabels: Record<TaskPhase, string> = {
  brief: 'Brief',
  layout: 'Layout',
  animation: 'Animation',
  lighting: 'Lighting',
  delivery: 'Delivery',
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const allocationStatusLabels: Record<AllocationStatus, string> = {
  planned: 'Planned',
  queued: 'Queued',
  active: 'Active',
  blocked: 'Blocked',
  done: 'Done',
};

export const viewLabels: Record<ViewId, string> = {
  projects: 'Projects',
  calendar: 'Calendar',
  tasks: 'Tasks',
  bidding: 'Bidding',
  archive: 'Archive',
  documentation: 'Documentation',
  people: 'People',
  settings: 'Settings',
};

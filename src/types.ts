export type TaskStatus = 'todo' | 'wip' | 'review' | 'blocked' | 'done';
export type TaskPhase = 'brief' | 'layout' | 'animation' | 'lighting' | 'delivery';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
  archivedAt?: string;
};

export type TaskReviewVersion = {
  id: string;
  label: string;
  date: string;
  kind: 'image' | 'video';
  summary: string;
};

export type TaskComment = {
  id: string;
  author: string;
  date: string;
  versionId: string;
  body: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  phase: TaskPhase;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  description: string;
  clientVisible: boolean;
  followers: string[];
  archivedAt?: string;
  subtasks: Subtask[];
  reviewVersions: TaskReviewVersion[];
  comments: TaskComment[];
};

export type ProjectTag = 'print' | 'cg' | 'ai' | 'retouch';
export type ProjectTool = 'Houdini' | 'Comfy' | 'Nanobanana' | 'Blender' | 'Unreal' | 'Photoshop';
export type StudioId = 'bonfire' | 'saddington-baynes' | 'sombra-labs' | 'hero-next-door' | 'organs';

export type Studio = {
  id: StudioId;
  name: string;
  shortName: string;
  logo: string;
};

export type Project = {
  id: string;
  studioId: StudioId;
  name: string;
  code: string;
  tags: ProjectTag[];
  tools: ProjectTool[];
  archivedAt?: string;
};

export type PermissionLevel = 'Admin' | 'Manager' | 'Artist' | 'Client';
export type ViewId = 'projects' | 'allocation' | 'tasks' | 'bidding' | 'archive' | 'documentation' | 'people' | 'settings';

export type Permissions = Record<ViewId, boolean>;

export type Person = {
  id: string;
  name: string;
  role: string;
  permissionLevel: PermissionLevel;
  discipline: string;
  permissions: Permissions;
};

export type AllocationStatus = 'planned' | 'queued' | 'active' | 'blocked' | 'done';

export type Allocation = {
  id: string;
  personId: string;
  projectId: string;
  date: string;
  hours: number;
  status: AllocationStatus;
  notes: string;
};

export type AllocationView = 'day' | 'week' | 'month' | 'year';

export type AllocationSelectionCell = {
  personId: string;
  date: string;
  rowType: 'summary' | 'project';
  projectId?: string;
};

export type ArchivedSubtask = Subtask & {
  taskId: string;
  taskTitle: string;
  projectId: string;
  archivedAt: string;
};

export type ArchiveState = {
  projects: Project[];
  tasks: Task[];
  subtasks: ArchivedSubtask[];
  allocations: Allocation[];
};

export type TaskNotification = {
  id: string;
  taskId: string;
  actor: string;
  date: string;
  message: string;
  read: boolean;
};

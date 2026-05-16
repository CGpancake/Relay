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
  projectId: string;
  shotId: string;
  frameStart: number;
  frameEnd: number;
  defaultFrame: number;
  thumbnailUrl?: string;
  proxyFrameUrlTemplate: string;
};

export type TaskComment = {
  id: string;
  author: string;
  date: string;
  versionId: string;
  body: string;
  frameNumber?: number;
  annotationIds?: string[];
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
export type ViewId =
  | 'projects'
  | 'calendar'
  | 'tasks'
  | 'bidding'
  | 'archive'
  | 'documentation'
  | 'people'
  | 'settings';

export type CalendarMode = 'allocation' | 'time-off' | 'milestones';
export type CalendarOverlaySettings = Record<CalendarMode, boolean>;
export type CalendarDayWindowSettings = { pastHours: number; upcomingHours: number };

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
  startMinute: number;
  endMinute: number;
  status: AllocationStatus;
  notes: string;
};

export type TimeOffType = 'holiday' | 'sick-leave';
export type TimeOffStatus = 'pending' | 'confirmed';

export type TimeOffEntry = {
  id: string;
  personId: string;
  date: string;
  startMinute: number;
  endMinute: number;
  type: TimeOffType;
  status: TimeOffStatus;
  notes?: string;
};

export type BookingType = TimeOffType;
export type BookingStatus = TimeOffStatus;
export type Booking = TimeOffEntry;

export type AllocationView = 'day' | 'week' | 'month' | 'year';

export type AllocationSelectionCell = {
  personId: string;
  date: string;
  rowType: 'summary' | 'project';
  projectId?: string;
  allocationId?: string;
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

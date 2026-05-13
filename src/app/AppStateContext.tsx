import React from 'react';
import { createSeedAllocations, createSeedPeople, createSeedProjects, createSeedTasks } from '../data/seed';
import { DEFAULT_DAY_WINDOW_SETTINGS } from '../shared/calendar';
import { defaultAccentKey, defaultThemeId, isAccentKey, isThemeId, type ThemeAccentKey } from '../themes';
import type { Allocation, ArchiveState, Booking, CalendarDayWindowSettings, CalendarOverlaySettings, Person, Project, Task, TaskNotification } from '../types';

const RELAY_STORAGE_KEY = 'relay:first-slice:ephemeral';
const THEME_STORAGE_KEY = 'relay:theme';
const ACCENT_STORAGE_KEY = 'relay:accent-key';
const CURRENT_PERSON_STORAGE_KEY = 'relay:current-person';
const TIMEZONE_STORAGE_KEY = 'relay:timezone';
const CALENDAR_OVERLAYS_STORAGE_KEY = 'relay:calendar-overlays';
const CALENDAR_DAY_WINDOW_STORAGE_KEY = 'relay:calendar-day-window';

const defaultCalendarOverlays: CalendarOverlaySettings = { allocation: true, 'time-off': true, milestones: false };

export type AppState = {
  people: Person[];
  projects: Project[];
  tasks: Task[];
  allocations: Allocation[];
  bookings: Booking[];
  archive: ArchiveState;
  notifications: TaskNotification[];
  themeId: string;
  accentKey: ThemeAccentKey;
  currentPersonId: string;
  timezone: string;
  calendarOverlays: CalendarOverlaySettings;
  calendarDayWindow: CalendarDayWindowSettings;
};

type CollectionUpdater<T> = T[] | ((current: T[]) => T[]);

export type AppAction =
  | { type: 'people/set'; updater: CollectionUpdater<Person> }
  | { type: 'projects/set'; updater: CollectionUpdater<Project> }
  | { type: 'tasks/set'; updater: CollectionUpdater<Task> }
  | { type: 'allocations/set'; updater: CollectionUpdater<Allocation> }
  | { type: 'bookings/set'; updater: CollectionUpdater<Booking> }
  | { type: 'archive/set'; updater: ArchiveState | ((current: ArchiveState) => ArchiveState) }
  | { type: 'notifications/set'; updater: CollectionUpdater<TaskNotification> }
  | { type: 'task/archived'; taskId: string; archivedAt: string; actor: string; message: string }
  | { type: 'subtask/archived'; taskId: string; subtaskId: string; archivedAt: string; actor: string }
  | { type: 'project/archived'; projectId: string; archivedAt: string; actor: string }
  | { type: 'project/restored'; projectId: string; actor: string }
  | { type: 'task/restored'; taskId: string; actor: string }
  | { type: 'theme/changed'; themeId: string }
  | { type: 'accent/changed'; accentKey: string }
  | { type: 'current-user/changed'; personId: string }
  | { type: 'timezone/changed'; timezone: string }
  | { type: 'calendar-overlays/changed'; overlays: CalendarOverlaySettings }
  | { type: 'calendar-day-window/changed'; settings: CalendarDayWindowSettings };

const AppStateContext = React.createContext<AppState | null>(null);
const AppDispatchContext = React.createContext<React.Dispatch<AppAction> | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(appReducer, undefined, createInitialState);

  React.useEffect(() => {
    if (!state.people.some((person) => person.id === state.currentPersonId) && state.people[0]) {
      dispatch({ type: 'current-user/changed', personId: state.people[0].id });
    }
  }, [state.currentPersonId, state.people]);

  React.useEffect(() => localStorage.setItem(THEME_STORAGE_KEY, state.themeId), [state.themeId]);
  React.useEffect(() => localStorage.setItem(ACCENT_STORAGE_KEY, state.accentKey), [state.accentKey]);
  React.useEffect(() => localStorage.setItem(CURRENT_PERSON_STORAGE_KEY, state.currentPersonId), [state.currentPersonId]);
  React.useEffect(() => localStorage.setItem(TIMEZONE_STORAGE_KEY, state.timezone), [state.timezone]);
  React.useEffect(() => localStorage.setItem(CALENDAR_OVERLAYS_STORAGE_KEY, JSON.stringify(state.calendarOverlays)), [state.calendarOverlays]);
  React.useEffect(() => localStorage.setItem(CALENDAR_DAY_WINDOW_STORAGE_KEY, JSON.stringify(state.calendarDayWindow)), [state.calendarDayWindow]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const state = React.useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return state;
}

export function useAppDispatch() {
  const dispatch = React.useContext(AppDispatchContext);
  if (!dispatch) {
    throw new Error('useAppDispatch must be used inside AppStateProvider');
  }
  return dispatch;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'people/set':
      return { ...state, people: applyCollectionUpdater(state.people, action.updater) };
    case 'projects/set':
      return { ...state, projects: applyCollectionUpdater(state.projects, action.updater) };
    case 'tasks/set':
      return { ...state, tasks: applyCollectionUpdater(state.tasks, action.updater) };
    case 'allocations/set':
      return { ...state, allocations: applyCollectionUpdater(state.allocations, action.updater) };
    case 'bookings/set':
      return { ...state, bookings: applyCollectionUpdater(state.bookings, action.updater) };
    case 'archive/set':
      return { ...state, archive: typeof action.updater === 'function' ? action.updater(state.archive) : action.updater };
    case 'notifications/set':
      return { ...state, notifications: applyCollectionUpdater(state.notifications, action.updater) };
    case 'task/archived':
      return archiveTask(state, action.taskId, action.archivedAt, action.actor, action.message);
    case 'subtask/archived':
      return archiveSubtask(state, action.taskId, action.subtaskId, action.archivedAt, action.actor);
    case 'project/archived':
      return archiveProject(state, action.projectId, action.archivedAt, action.actor);
    case 'project/restored':
      return restoreProject(state, action.projectId, action.actor);
    case 'task/restored':
      return restoreTask(state, action.taskId, action.actor);
    case 'theme/changed':
      return isThemeId(action.themeId) ? { ...state, themeId: action.themeId } : state;
    case 'accent/changed':
      return isAccentKey(action.accentKey) ? { ...state, accentKey: action.accentKey } : state;
    case 'current-user/changed':
      return { ...state, currentPersonId: action.personId };
    case 'timezone/changed':
      return { ...state, timezone: action.timezone };
    case 'calendar-overlays/changed':
      return { ...state, calendarOverlays: action.overlays };
    case 'calendar-day-window/changed':
      return { ...state, calendarDayWindow: normalizeDayWindowSettings(action.settings) };
  }
}

function createInitialState(): AppState {
  localStorage.setItem(RELAY_STORAGE_KEY, 'seed-reset-on-load');
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const savedAccentKey = localStorage.getItem(ACCENT_STORAGE_KEY);
  return {
    people: createSeedPeople(),
    projects: createSeedProjects(),
    tasks: createSeedTasks(),
    allocations: createSeedAllocations(),
    bookings: [],
    archive: { projects: [], tasks: [], subtasks: [], allocations: [] },
    notifications: [],
    themeId: isThemeId(savedTheme) ? savedTheme : defaultThemeId,
    accentKey: isAccentKey(savedAccentKey) ? savedAccentKey : defaultAccentKey,
    currentPersonId: localStorage.getItem(CURRENT_PERSON_STORAGE_KEY) ?? 'person-admin',
    timezone: localStorage.getItem(TIMEZONE_STORAGE_KEY) ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarOverlays: readCalendarOverlays(),
    calendarDayWindow: readCalendarDayWindow(),
  };
}

function readCalendarOverlays(): CalendarOverlaySettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(CALENDAR_OVERLAYS_STORAGE_KEY) ?? 'null') as Partial<CalendarOverlaySettings> | null;
    return {
      allocation: typeof parsed?.allocation === 'boolean' ? parsed.allocation : defaultCalendarOverlays.allocation,
      'time-off': typeof parsed?.['time-off'] === 'boolean' ? parsed['time-off'] : defaultCalendarOverlays['time-off'],
      milestones: false,
    };
  } catch {
    return defaultCalendarOverlays;
  }
}

function readCalendarDayWindow(): CalendarDayWindowSettings {
  try {
    return normalizeDayWindowSettings(JSON.parse(localStorage.getItem(CALENDAR_DAY_WINDOW_STORAGE_KEY) ?? 'null') as Partial<CalendarDayWindowSettings> | null);
  } catch {
    return DEFAULT_DAY_WINDOW_SETTINGS;
  }
}

function normalizeDayWindowSettings(settings: Partial<CalendarDayWindowSettings> | null): CalendarDayWindowSettings {
  const pastHours = Number(settings?.pastHours);
  const upcomingHours = Number(settings?.upcomingHours);
  return {
    pastHours: Number.isFinite(pastHours) ? Math.max(0, Math.min(24, pastHours)) : DEFAULT_DAY_WINDOW_SETTINGS.pastHours,
    upcomingHours: Number.isFinite(upcomingHours) ? Math.max(1, Math.min(24, upcomingHours)) : DEFAULT_DAY_WINDOW_SETTINGS.upcomingHours,
  };
}

function applyCollectionUpdater<T>(current: T[], updater: CollectionUpdater<T>) {
  return typeof updater === 'function' ? updater(current) : updater;
}

function notification(message: string, task: Task, actor: string, count: number): TaskNotification {
  return {
    id: `notification-${count + 1}`,
    taskId: task.id,
    actor,
    date: new Date().toISOString().slice(0, 10),
    message,
    read: false,
  };
}

function archiveTask(state: AppState, taskId: string, archivedAt: string, actor: string, message: string): AppState {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    return state;
  }
  const archivedTask = { ...task, archivedAt };
  return {
    ...state,
    tasks: state.tasks.filter((candidate) => candidate.id !== taskId),
    archive: { ...state.archive, tasks: [archivedTask, ...state.archive.tasks] },
    notifications: [notification(`${message}: ${task.title}`, task, actor, state.notifications.length), ...state.notifications],
  };
}

function archiveSubtask(state: AppState, taskId: string, subtaskId: string, archivedAt: string, actor: string): AppState {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  const subtask = task?.subtasks.find((candidate) => candidate.id === subtaskId);
  if (!task || !subtask) {
    return state;
  }
  return {
    ...state,
    tasks: state.tasks.map((candidate) =>
      candidate.id === taskId ? { ...candidate, subtasks: candidate.subtasks.filter((item) => item.id !== subtaskId) } : candidate,
    ),
    archive: {
      ...state.archive,
      subtasks: [{ ...subtask, taskId: task.id, taskTitle: task.title, projectId: task.projectId, archivedAt }, ...state.archive.subtasks],
    },
    notifications: [notification(`Subtask archived: ${subtask.title}`, task, actor, state.notifications.length), ...state.notifications],
  };
}

function archiveProject(state: AppState, projectId: string, archivedAt: string, actor: string): AppState {
  const project = state.projects.find((candidate) => candidate.id === projectId);
  if (!project) {
    return state;
  }
  const projectTasks = state.tasks.filter((task) => task.projectId === projectId).map((task) => ({ ...task, archivedAt }));
  const projectAllocations = state.allocations.filter((allocation) => allocation.projectId === projectId);
  const notifications = projectTasks.reduce(
    (current, task, index) => [notification(`Project archived: ${project.name}`, task, actor, state.notifications.length + index), ...current],
    state.notifications,
  );
  return {
    ...state,
    projects: state.projects.filter((candidate) => candidate.id !== projectId),
    tasks: state.tasks.filter((task) => task.projectId !== projectId),
    allocations: state.allocations.filter((allocation) => allocation.projectId !== projectId),
    archive: {
      projects: [{ ...project, archivedAt }, ...state.archive.projects],
      tasks: [...projectTasks, ...state.archive.tasks],
      subtasks: state.archive.subtasks,
      allocations: [...projectAllocations, ...state.archive.allocations],
    },
    notifications,
  };
}

function restoreProject(state: AppState, projectId: string, actor: string): AppState {
  const project = state.archive.projects.find((candidate) => candidate.id === projectId);
  if (!project) {
    return state;
  }
  const { archivedAt: _projectArchivedAt, ...restoredProject } = project;
  const restoredTasks = state.archive.tasks
    .filter((task) => task.projectId === projectId)
    .map((task) => {
      const { archivedAt: _taskArchivedAt, ...restoredTask } = task;
      return restoredTask;
    });
  const restoredAllocations = state.archive.allocations.filter((allocation) => allocation.projectId === projectId);
  const notifications = restoredTasks.reduce(
    (current, task, index) => [notification(`Project restored: ${project.name}`, task, actor, state.notifications.length + index), ...current],
    state.notifications,
  );
  return {
    ...state,
    projects: [...state.projects, restoredProject],
    tasks: [...state.tasks, ...restoredTasks],
    allocations: [...state.allocations, ...restoredAllocations],
    archive: {
      projects: state.archive.projects.filter((candidate) => candidate.id !== projectId),
      tasks: state.archive.tasks.filter((task) => task.projectId !== projectId),
      subtasks: state.archive.subtasks,
      allocations: state.archive.allocations.filter((allocation) => allocation.projectId !== projectId),
    },
    notifications,
  };
}

function restoreTask(state: AppState, taskId: string, actor: string): AppState {
  const task = state.archive.tasks.find((candidate) => candidate.id === taskId);
  if (!task || state.archive.projects.some((project) => project.id === task.projectId)) {
    return state;
  }
  const { archivedAt: _archivedAt, ...restoredTask } = task;
  return {
    ...state,
    tasks: [...state.tasks, restoredTask],
    archive: { ...state.archive, tasks: state.archive.tasks.filter((candidate) => candidate.id !== taskId) },
    notifications: [notification(`Task restored: ${restoredTask.title}`, restoredTask, actor, state.notifications.length), ...state.notifications],
  };
}

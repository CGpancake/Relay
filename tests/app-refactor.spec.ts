import { expect, test } from '@playwright/test';
import { appReducer, type AppState } from '../src/app/AppStateContext';
import { compactAllocationSegmentStyle } from '../src/components/calendar/calendarUtils';
import { createSeedAllocations, createSeedPeople, createSeedProjects, createSeedTasks } from '../src/data/seed';
import {
  absoluteMinuteToDateMinute,
  blockStyle,
  clipDateMinuteRangeToVisibleWindow,
  computeVisibleDayWindow,
  dateMatchesView,
  dateMinuteToAbsoluteMinute,
  DEFAULT_DAY_WINDOW_SETTINGS,
  minuteToWindowPercent,
  shiftDateByView,
  visibleBlockStyle,
  datesForView,
} from '../src/shared/calendar';

const baseState = (): AppState => ({
  people: createSeedPeople(),
  projects: createSeedProjects(),
  tasks: createSeedTasks(),
  allocations: createSeedAllocations(),
  bookings: [],
  archive: { projects: [], tasks: [], subtasks: [], allocations: [] },
  notifications: [],
  themeId: 'concrete-dim',
  accentKey: 'active',
  currentPersonId: 'person-admin',
  timezone: 'UTC',
  calendarOverlays: { allocation: true, 'time-off': true, milestones: false },
  calendarDayWindow: DEFAULT_DAY_WINDOW_SETTINGS,
});

test('app reducer archives and restores a task without touching unrelated collections', () => {
  const state = baseState();
  const task = state.tasks[0];

  const archived = appReducer(state, {
    type: 'task/archived',
    actor: 'James Green',
    archivedAt: '2026-05-13',
    message: 'Task archived',
    taskId: task.id,
  });

  expect(archived.tasks.some((candidate) => candidate.id === task.id)).toBe(false);
  expect(archived.archive.tasks).toEqual([expect.objectContaining({ id: task.id, archivedAt: '2026-05-13' })]);
  expect(archived.projects).toHaveLength(state.projects.length);
  expect(archived.notifications[0].message).toContain(task.title);

  const restored = appReducer(archived, { type: 'task/restored', actor: 'James Green', taskId: task.id });
  expect(restored.tasks.some((candidate) => candidate.id === task.id && !candidate.archivedAt)).toBe(true);
  expect(restored.archive.tasks).toHaveLength(0);
});

test('app reducer archives and restores project tasks and allocations together', () => {
  const state = baseState();
  const project = state.projects.find((candidate) => state.tasks.some((task) => task.projectId === candidate.id))!;

  const archived = appReducer(state, {
    type: 'project/archived',
    actor: 'James Green',
    archivedAt: '2026-05-13',
    projectId: project.id,
  });

  expect(archived.projects.some((candidate) => candidate.id === project.id)).toBe(false);
  expect(archived.tasks.some((task) => task.projectId === project.id)).toBe(false);
  expect(archived.archive.projects[0]).toEqual(expect.objectContaining({ id: project.id, archivedAt: '2026-05-13' }));
  expect(archived.archive.tasks.some((task) => task.projectId === project.id)).toBe(true);

  const restored = appReducer(archived, { type: 'project/restored', actor: 'James Green', projectId: project.id });
  expect(restored.projects.some((candidate) => candidate.id === project.id && !candidate.archivedAt)).toBe(true);
  expect(restored.tasks.some((task) => task.projectId === project.id && !task.archivedAt)).toBe(true);
  expect(restored.archive.projects.some((candidate) => candidate.id === project.id)).toBe(false);
});

test('shared calendar helpers cover date shifts, year matching, and block geometry', () => {
  expect(datesForView('week', '2026-05-13')).toEqual(['2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17']);
  expect(datesForView('month', '2026-02-13')).toHaveLength(28);
  expect(datesForView('year', '2026-05-13')).toHaveLength(12);
  expect(shiftDateByView('2026-05-13', 'day', -1)).toBe('2026-05-12');
  expect(shiftDateByView('2026-05-13', 'week', 1)).toBe('2026-05-20');
  expect(shiftDateByView('2026-05-13', 'month', 1)).toBe('2026-06-13');
  expect(shiftDateByView('2026-05-13', 'year', -1)).toBe('2025-05-13');
  expect(dateMatchesView('2026-05-22', '2026-05-01', 'year')).toBe(true);
  expect(dateMatchesView('2026-06-01', '2026-05-01', 'year')).toBe(false);
  expect(blockStyle(9 * 60, 12 * 60)).toEqual({ left: '37.5%', width: '12.5%' });
});

test('visible day window helpers cover focused ranges and clipped geometry', () => {
  const todayWindow = computeVisibleDayWindow('2026-05-13', '2026-05-13', 12 * 60, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(todayWindow).toEqual({ startMinute: 10 * 60, endMinute: 22 * 60 });
  expect(minuteToWindowPercent(16 * 60, todayWindow)).toBe(50);
  expect(visibleBlockStyle(9 * 60, 11 * 60, todayWindow)).toEqual({ left: '0%', right: 'auto', width: '8.333333333333332%' });

  const nonTodayWindow = computeVisibleDayWindow('2026-05-14', '2026-05-13', 12 * 60, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(nonTodayWindow).toEqual({ startMinute: 9 * 60, endMinute: 21 * 60 });
  expect(visibleBlockStyle(22 * 60, 23 * 60, nonTodayWindow)).toEqual({ display: 'none' });

  const edgeWindow = computeVisibleDayWindow('2026-05-13', '2026-05-13', 30, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(edgeWindow).toEqual({ startMinute: -90, endMinute: 630 });
});

test('cross-midnight day helpers preserve adjacent-date minutes', () => {
  const eveningWindow = computeVisibleDayWindow('2026-05-13', '2026-05-13', 20 * 60, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(eveningWindow).toEqual({ startMinute: 18 * 60, endMinute: 30 * 60 });
  expect(absoluteMinuteToDateMinute('2026-05-13', -60)).toEqual({ date: '2026-05-12', minuteOfDay: 23 * 60 });
  expect(absoluteMinuteToDateMinute('2026-05-13', 26 * 60)).toEqual({ date: '2026-05-14', minuteOfDay: 2 * 60 });
  expect(dateMinuteToAbsoluteMinute('2026-05-13', '2026-05-12', 23 * 60)).toBe(-60);
  expect(dateMinuteToAbsoluteMinute('2026-05-13', '2026-05-14', 2 * 60)).toBe(26 * 60);
  expect(clipDateMinuteRangeToVisibleWindow('2026-05-13', '2026-05-14', 60, 3 * 60, eveningWindow)).toEqual({ startMinute: 25 * 60, endMinute: 27 * 60 });
});

test('compact project segment geometry mirrors summary stacking', () => {
  const allocations = [
    { id: 'a', personId: 'person-manager', projectId: 'novartis-novartis', date: '2026-05-13', startMinute: 9 * 60, endMinute: 12 * 60, status: 'planned' as const, notes: '' },
    { id: 'b', personId: 'person-manager', projectId: 'bexsero-retouch-project', date: '2026-05-13', startMinute: 14 * 60, endMinute: 15 * 60 + 30, status: 'planned' as const, notes: '' },
  ];
  expect(compactAllocationSegmentStyle(allocations[0], allocations)).toEqual({ left: '0%', width: '37.5%' });
  expect(compactAllocationSegmentStyle(allocations[1], allocations)).toEqual({ left: '37.5%', width: '18.75%' });
});

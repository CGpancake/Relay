import { expect, test } from '@playwright/test';
import { appReducer, type AppState } from '../src/app/AppStateContext';
import { DEFAULT_SEGMENT, connectedTimeOffEntries, compactAllocationSegmentStyle, dayHourTicks, dayOverbookSegments, mergeAdjacentAllocations, monthlyOverbookedMinutesByProject, monthlyProjectStats, ukBankHolidaysForDate } from '../src/components/calendar/calendarUtils';
import { createSeedAllocations, createSeedPeople, createSeedProjects, createSeedTasks } from '../src/data/seed';
import { applyTimeOffOperation, deleteTimeOffEntries, setTimeOffStatus } from '../src/features/calendar/timeOffModel';
import { scanElementsManifest } from '../vite.config';
import {
  absoluteMinuteToDateMinute,
  blockStyle,
  clipDateMinuteRangeToVisibleWindow,
  computeVisibleDayWindow,
  dateMatchesView,
  dateMinuteToAbsoluteMinute,
  DEFAULT_DAY_WINDOW_SETTINGS,
  MONTH_DAY_COLUMN_WIDTH,
  WEEK_DAY_COLUMN_WIDTH,
  bufferedDatesForView,
  centeredDateFromTimeline,
  centeredTimelineCoordinate,
  compactColumnWidthForView,
  minuteToWindowPercent,
  scrollLeftForTimelineCoordinate,
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

test('elements demo manifest scans frame ranges and sorts numeric versions', () => {
  const manifest = scanElementsManifest();

  expect(manifest.versions.map((version) => version.label)).toEqual(['V01', 'V02', 'V03', 'V04', 'V05']);
  expect(manifest.versions[0]).toEqual(expect.objectContaining({ frameStart: 1001, frameEnd: 1060 }));
  expect(manifest.versions[1]).toEqual(expect.objectContaining({ frameStart: 1001, frameEnd: 1047 }));
  expect(manifest.versions[2]).toEqual(expect.objectContaining({ defaultFrame: 1060 }));
  expect(manifest.versions[2].thumbnailUrl).toContain('/demo-review/elements/V03/Elements_v03.1060.png');
  expect(manifest.versions[4].proxyFrameUrlTemplate).toContain('/demo-review/elements/V05/Elements_v05.{frame}.png');
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
  expect(bufferedDatesForView('week', '2026-05-13')).toEqual({
    currentEnd: 14,
    currentStart: 7,
    dates: [
      '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10',
      '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14', '2026-05-15', '2026-05-16', '2026-05-17',
      '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24',
    ],
  });
  expect(bufferedDatesForView('day', '2026-05-13').dates).toEqual(['2026-05-12', '2026-05-13', '2026-05-14']);
  expect(bufferedDatesForView('month', '2026-05-13').dates).toHaveLength(91);
  expect(bufferedDatesForView('year', '2026-05-13').dates).toHaveLength(36);
  expect(centeredDateFromTimeline('month', bufferedDatesForView('month', '2026-05-13').dates, 30 * MONTH_DAY_COLUMN_WIDTH, 0, 0, MONTH_DAY_COLUMN_WIDTH)).toBe('2026-05-01');
  expect(centeredDateFromTimeline('year', bufferedDatesForView('year', '2026-05-13').dates, 17 * WEEK_DAY_COLUMN_WIDTH, 0, 0, WEEK_DAY_COLUMN_WIDTH)).toBe('2026-06-01');
  expect(compactColumnWidthForView('month')).toBe(WEEK_DAY_COLUMN_WIDTH / 4);
  expect(compactColumnWidthForView('month')).toBe(MONTH_DAY_COLUMN_WIDTH);
  expect(compactColumnWidthForView('week')).toBe(112);
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
  expect(minuteToWindowPercent(12 * 60, todayWindow)).toBe(16.666666666666664);
  expect(visibleBlockStyle(9 * 60, 11 * 60, todayWindow)).toEqual({ left: '0%', right: 'auto', width: '8.333333333333332%' });

  const nonTodayWindow = computeVisibleDayWindow('2026-05-14', '2026-05-13', 12 * 60, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(nonTodayWindow).toEqual({ startMinute: 0, endMinute: 24 * 60 });
  expect(visibleBlockStyle(22 * 60, 23 * 60, nonTodayWindow)).toEqual({ left: '91.66666666666666%', right: 'auto', width: '4.166666666666666%' });

  const edgeWindow = computeVisibleDayWindow('2026-05-13', '2026-05-13', 30, DEFAULT_DAY_WINDOW_SETTINGS);
  expect(edgeWindow).toEqual({ startMinute: -90, endMinute: 630 });
});

test('canonical time off model applies create, edit, status, delete, and overlap rules', () => {
  const selection = [{ personId: 'person-1', date: '2026-05-13', rowType: 'summary' as const }];
  const created = applyTimeOffOperation({ entries: [], selection, type: 'holiday', startMinute: 0, endMinute: 24 * 60, now: 42 });
  expect(created).toEqual({
    ok: true,
    entries: [{ id: 'time-off-local-42-0', personId: 'person-1', date: '2026-05-13', startMinute: 0, endMinute: 24 * 60, type: 'holiday', status: 'pending' }],
    changedEntryIds: ['time-off-local-42-0'],
  });
  if (!created.ok) throw new Error('expected create success');

  const edited = applyTimeOffOperation({
    entries: created.entries,
    selection: [{ ...selection[0], allocationId: 'time-off-local-42-0' }],
    type: 'sick-leave',
    startMinute: 9 * 60,
    endMinute: 13 * 60,
  });
  expect(edited.ok).toBe(true);
  if (!edited.ok) throw new Error('expected edit success');
  expect(edited.entries[0]).toMatchObject({ type: 'sick-leave', startMinute: 9 * 60, endMinute: 13 * 60 });
  expect(applyTimeOffOperation({ entries: edited.entries, selection, type: 'holiday', startMinute: 10 * 60, endMinute: 12 * 60 }).ok).toBe(false);
  expect(setTimeOffStatus(edited.entries, edited.entries, 'confirmed')[0].status).toBe('confirmed');
  expect(deleteTimeOffEntries(edited.entries, edited.entries)).toEqual([]);
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

test('day hour ticks cover the three-day buffer and cycle labels', () => {
  const ticks = dayHourTicks(-24 * 60, 48 * 60);
  expect(ticks).toHaveLength(73);
  expect(ticks.slice(0, 3).map((tick) => tick.label)).toEqual(['00:00', '01:00', '02:00']);
  expect(ticks.find((tick) => tick.minute === 0)?.label).toBe('24:00');
  expect(ticks.find((tick) => tick.minute === 60)?.label).toBe('01:00');
  expect(ticks.at(-1)).toEqual({ minute: 48 * 60, label: '24:00' });
});

test('day overbooking returns only overbooked portions for the actual person date', () => {
  const allocations = [
    { id: 'a', personId: 'person-manager', projectId: 'alpha', date: '2026-05-13', startMinute: 8 * 60, endMinute: 13 * 60, status: 'planned' as const, notes: '' },
    { id: 'b', personId: 'person-manager', projectId: 'beta', date: '2026-05-13', startMinute: 13 * 60, endMinute: 18 * 60, status: 'planned' as const, notes: '' },
    { id: 'c', personId: 'person-artist-a', projectId: 'beta', date: '2026-05-13', startMinute: 9 * 60, endMinute: 20 * 60, status: 'planned' as const, notes: '' },
    { id: 'd', personId: 'person-manager', projectId: 'beta', date: '2026-05-14', startMinute: 9 * 60, endMinute: 20 * 60, status: 'planned' as const, notes: '' },
  ];
  expect(dayOverbookSegments(allocations, 'person-manager', '2026-05-13')).toEqual([
    { id: 'b', date: '2026-05-13', startMinute: 16 * 60, endMinute: 18 * 60 },
  ]);
});

test('connected time off groups adjacent same-kind entries only', () => {
  const entries = [
    { id: 'a', personId: 'person-manager', date: '2026-05-04', startMinute: 0, endMinute: 24 * 60, type: 'holiday' as const, status: 'pending' as const },
    { id: 'b', personId: 'person-manager', date: '2026-05-05', startMinute: 0, endMinute: 24 * 60, type: 'holiday' as const, status: 'pending' as const },
    { id: 'c', personId: 'person-manager', date: '2026-05-06', startMinute: 0, endMinute: 24 * 60, type: 'holiday' as const, status: 'confirmed' as const },
    { id: 'd', personId: 'person-manager', date: '2026-05-05', startMinute: 9 * 60, endMinute: 11 * 60, type: 'sick-leave' as const, status: 'pending' as const },
    { id: 'e', personId: 'person-manager', date: '2026-05-05', startMinute: 11 * 60, endMinute: 12 * 60, type: 'sick-leave' as const, status: 'pending' as const },
  ];
  expect(connectedTimeOffEntries(entries, entries[0]).map((entry) => entry.id)).toEqual(['a', 'b']);
  expect(connectedTimeOffEntries(entries, entries[3]).map((entry) => entry.id)).toEqual(['d', 'e']);
});

test('uk holiday helper returns England and Wales bank holidays without editable bookings', () => {
  expect(ukBankHolidaysForDate('2026-05-04', 'day')).toEqual([
    expect.objectContaining({ title: 'Early May bank holiday', date: '2026-05-04' }),
  ]);
  expect(ukBankHolidaysForDate('2026-05-01', 'year').map((holiday) => holiday.date)).toEqual(['2026-05-04', '2026-05-25']);
});

test('timeline center helpers preserve fractional position across buffer regeneration', () => {
  const oldDates = bufferedDatesForView('month', '2026-05-13').dates;
  const coordinate = centeredTimelineCoordinate('month', oldDates, 35.4 * MONTH_DAY_COLUMN_WIDTH, 0, 0, MONTH_DAY_COLUMN_WIDTH);
  expect(coordinate).toEqual({ date: '2026-05-06', fraction: expect.closeTo(0.4, 5) });
  const newDates = bufferedDatesForView('month', '2026-05-06').dates;
  expect(scrollLeftForTimelineCoordinate('month', newDates, coordinate!, 0, 0, MONTH_DAY_COLUMN_WIDTH)).toBeCloseTo(35.4 * MONTH_DAY_COLUMN_WIDTH);
});

test('year monthly project stats sort totals and attribute daily overbooking', () => {
  const allocations = [
    { id: 'a', personId: 'person-manager', projectId: 'alpha', date: '2026-05-02', startMinute: 8 * 60, endMinute: 13 * 60, status: 'planned' as const, notes: '' },
    { id: 'b', personId: 'person-manager', projectId: 'beta', date: '2026-05-02', startMinute: 13 * 60, endMinute: 18 * 60, status: 'planned' as const, notes: '' },
    { id: 'c', personId: 'person-manager', projectId: 'beta', date: '2026-05-03', startMinute: 9 * 60, endMinute: 11 * 60, status: 'planned' as const, notes: '' },
  ];
  expect(monthlyOverbookedMinutesByProject(allocations).get('beta')).toBe(2 * 60);
  expect(monthlyOverbookedMinutesByProject(allocations).get('alpha')).toBeUndefined();
  expect(monthlyProjectStats(allocations, 'person-manager', '2026-05-01')).toEqual([
    expect.objectContaining({ projectId: 'beta', totalMinutes: 7 * 60, overbookedMinutes: 2 * 60, relativeWidth: 1 }),
    expect.objectContaining({ projectId: 'alpha', totalMinutes: 5 * 60, overbookedMinutes: 0, relativeWidth: 5 / 7 }),
  ]);
});

test('compact project segment geometry mirrors summary stacking', () => {
  const allocations = [
    { id: 'a', personId: 'person-manager', projectId: 'novartis-novartis', date: '2026-05-13', startMinute: 9 * 60, endMinute: 12 * 60, status: 'planned' as const, notes: '' },
    { id: 'b', personId: 'person-manager', projectId: 'bexsero-retouch-project', date: '2026-05-13', startMinute: 14 * 60, endMinute: 15 * 60 + 30, status: 'planned' as const, notes: '' },
  ];
  expect(compactAllocationSegmentStyle(allocations[0], allocations)).toEqual({ left: '0%', width: '37.5%' });
  expect(compactAllocationSegmentStyle(allocations[1], allocations)).toEqual({ left: '37.5%', width: '18.75%' });
});

test('allocation defaults and merge helper match calendar editor behavior', () => {
  expect(DEFAULT_SEGMENT).toEqual({ startMinute: 10 * 60, endMinute: 18 * 60 });

  const allocations = [
    { id: 'a', personId: 'person-manager', projectId: 'novartis-novartis', date: '2026-05-13', startMinute: 10 * 60, endMinute: 12 * 60, status: 'planned' as const, notes: 'first' },
    { id: 'b', personId: 'person-manager', projectId: 'novartis-novartis', date: '2026-05-13', startMinute: 12 * 60, endMinute: 15 * 60, status: 'active' as const, notes: 'second' },
    { id: 'c', personId: 'person-manager', projectId: 'bexsero-retouch-project', date: '2026-05-13', startMinute: 12 * 60, endMinute: 13 * 60, status: 'planned' as const, notes: '' },
  ];

  expect(mergeAdjacentAllocations(allocations)).toEqual([
    expect.objectContaining({ id: 'a', projectId: 'novartis-novartis', startMinute: 10 * 60, endMinute: 15 * 60, status: 'planned', notes: 'first' }),
    expect.objectContaining({ id: 'c', projectId: 'bexsero-retouch-project', startMinute: 12 * 60, endMinute: 13 * 60 }),
  ]);
});

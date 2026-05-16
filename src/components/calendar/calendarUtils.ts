import React from 'react';
import { addDays, formatDate } from '../../lib/date';
import { englandAndWalesBankHolidays, type UkBankHoliday } from '../../data/ukBankHolidays';
import type { Allocation, AllocationSelectionCell, AllocationStatus, AllocationView, Booking, Project, TimeOffEntry } from '../../types';
import { blockStyle, clampMinute as clampCalendarMinute, dateMatchesView } from '../../shared/calendar';

export const CAPACITY_MINUTES = 8 * 60;
export const SNAP_MINUTES = 15;
export const DAY_MINUTES = 24 * 60;
export const DEFAULT_SEGMENT = { startMinute: 10 * 60, endMinute: 18 * 60 };

export type SegmentDraft = {
  id: string;
  projectId: string;
  startMinute: number;
  endMinute: number;
  status: AllocationStatus;
  notes: string;
  taskIds: string[];
};

export type AllocationDragState =
  | { kind: 'create'; personId: string; projectId: string; date: string; startMinute: number; endMinute: number }
  | { kind: 'move'; allocationId: string; originMinute: number; originalDate: string; originalStart: number; originalEnd: number }
  | { kind: 'resize-start' | 'resize-end'; allocationId: string; originalDate: string; originalStart: number; originalEnd: number };

export type DayHourTick = { minute: number; label: string };
export type DayOverbookSegment = { id: string; date: string; startMinute: number; endMinute: number };

export function sameCell(a: AllocationSelectionCell, b: AllocationSelectionCell) {
  return (
    a.personId === b.personId &&
    a.date === b.date &&
    a.rowType === b.rowType &&
    a.projectId === b.projectId &&
    a.allocationId === b.allocationId
  );
}

export function allocationsFor(allocations: Allocation[], personId: string, date: string, view: AllocationView) {
  return allocations.filter((a) => a.personId === personId && dateMatchesView(a.date, date, view));
}

export function bookingsFor(bookings: Booking[], personId: string, date: string, view: AllocationView) {
  return bookings.filter((b) => b.personId === personId && dateMatchesView(b.date, date, view));
}

export function ukBankHolidaysForDate(date: string, view: AllocationView): UkBankHoliday[] {
  if (view === 'year') {
    return englandAndWalesBankHolidays.filter((holiday) => holiday.date.startsWith(date.slice(0, 7)));
  }
  return englandAndWalesBankHolidays.filter((holiday) => holiday.date === date);
}

export function durationMinutes(allocation: Allocation) {
  return allocation.endMinute - allocation.startMinute;
}

export function dominantStatus(allocations: Allocation[]) {
  return allocations[0]?.status ?? 'planned';
}

export function formatDuration(minutes: number) {
  const rounded = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  return `${Number((rounded / 60).toFixed(2)).toString()}h`;
}

export function timeLabel(minutes: number) {
  const clamped = Math.max(0, Math.min(DAY_MINUTES, Math.round(minutes)));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function dayHourTicks(startMinute: number, endMinute: number): DayHourTick[] {
  const firstHour = Math.ceil(startMinute / 60);
  const lastHour = Math.floor(endMinute / 60);
  return Array.from({ length: Math.max(0, lastHour - firstHour + 1) }, (_, index) => {
    const minute = (firstHour + index) * 60;
    const minuteOfDay = ((minute % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
    const labelMinute = minute !== startMinute && minuteOfDay === 0 ? DAY_MINUTES : minuteOfDay;
    return { minute, label: timeLabel(labelMinute) };
  });
}

export function minuteFromTime(value: string) {
  const [hours = '0', minutes = '0'] = value.split(':');
  return clampMinute(Number(hours) * 60 + Number(minutes));
}

export function clampMinute(value: number) {
  return clampCalendarMinute(value, SNAP_MINUTES, DAY_MINUTES);
}

export function normalizeDraft(draft: SegmentDraft): SegmentDraft {
  const startMinute = clampMinute(draft.startMinute);
  const endMinute = Math.max(startMinute + SNAP_MINUTES, clampMinute(draft.endMinute));
  return { ...draft, startMinute, endMinute: Math.min(DAY_MINUTES, endMinute) };
}

export function draftFromAllocation(allocation: Allocation): SegmentDraft {
  return {
    id: `draft-${allocation.id}`,
    projectId: allocation.projectId,
    startMinute: allocation.startMinute,
    endMinute: allocation.endMinute,
    status: allocation.status,
    notes: allocation.notes,
    taskIds: [],
  };
}

export function hasAllocationsForCell(allocations: Allocation[], cell: AllocationSelectionCell, view: AllocationView) {
  return allocations.some(
    (a) =>
      cell.rowType === 'project' &&
      cell.projectId === a.projectId &&
      cell.personId === a.personId &&
      dateMatchesView(a.date, cell.date, view),
  );
}

export function selectionMode(
  selection: AllocationSelectionCell[],
  allocations: Allocation[],
  view: AllocationView,
): 'create' | 'replace-cell' | 'edit-blocks' {
  if (selection.some((cell) => cell.allocationId)) return 'edit-blocks';
  if (selection.some((cell) => hasAllocationsForCell(allocations, cell, view))) return 'replace-cell';
  return 'create';
}

export function projectRowIds(projects: Project[], allocationProjectIds: string[], manualProjectIds: string[]) {
  const allowed = new Set(projects.map((p) => p.id));
  return [...new Set([...allocationProjectIds, ...manualProjectIds])].filter((id) => allowed.has(id));
}

export function bookingOverlayStyle(startMinute: number, endMinute: number) {
  const start = Math.min(startMinute, endMinute);
  const end = Math.max(startMinute, endMinute);
  const leftPct = (start / DAY_MINUTES) * 100;
  const rightPct = 100 - (end / DAY_MINUTES) * 100;
  return { clipPath: `inset(0 ${rightPct}% 0 ${leftPct}%)` } as React.CSSProperties;
}

export function compactAllocationSegmentStyle(allocation: Allocation, dayAllocations: Allocation[]) {
  const sorted = [...dayAllocations].sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute || a.id.localeCompare(b.id));
  const denominator = Math.max(sorted.reduce((sum, item) => sum + durationMinutes(item), 0), CAPACITY_MINUTES, 1);
  const start = sorted.slice(0, Math.max(0, sorted.findIndex((item) => item.id === allocation.id))).reduce((sum, item) => sum + durationMinutes(item), 0);
  const width = durationMinutes(allocation);
  return {
    left: `${(start / denominator) * 100}%`,
    width: `${Math.max(1, (width / denominator) * 100)}%`,
  } as React.CSSProperties;
}

export function dayOverbookSegments(allocations: Allocation[], personId: string, date: string): DayOverbookSegment[] {
  let used = 0;
  return allocations
    .filter((allocation) => allocation.personId === personId && allocation.date === date)
    .sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id))
    .flatMap((allocation) => {
      const startUsed = used;
      const endUsed = used + durationMinutes(allocation);
      used = endUsed;
      const extra = Math.max(0, endUsed - CAPACITY_MINUTES) - Math.max(0, startUsed - CAPACITY_MINUTES);
      if (extra <= 0) return [];
      return [{
        id: allocation.id,
        date: allocation.date,
        startMinute: Math.max(allocation.startMinute, allocation.endMinute - extra),
        endMinute: allocation.endMinute,
      }];
    });
}

export function connectedTimeOffEntries(entries: TimeOffEntry[], target: TimeOffEntry): TimeOffEntry[] {
  const related = entries.filter(
    (entry) =>
      entry.personId === target.personId &&
      entry.type === target.type &&
      entry.status === target.status &&
      (isFullDay(entry) ? isFullDay(target) : !isFullDay(target) && entry.date === target.date),
  );
  const connectedIds = new Set([target.id]);
  let changed = true;
  while (changed) {
    changed = false;
    related.forEach((entry) => {
      if (connectedIds.has(entry.id)) return;
      const connects = related.some((candidate) => connectedIds.has(candidate.id) && timeOffEntriesTouch(candidate, entry));
      if (connects) {
        connectedIds.add(entry.id);
        changed = true;
      }
    });
  }
  return related
    .filter((entry) => connectedIds.has(entry.id))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute || a.id.localeCompare(b.id));
}

export type YearProjectStat = {
  projectId: string;
  totalMinutes: number;
  overbookedMinutes: number;
  relativeWidth: number;
};

export function monthlyProjectStats(allocations: Allocation[], personId: string, monthDate: string): YearProjectStat[] {
  const monthKey = monthDate.slice(0, 7);
  const monthAllocations = allocations.filter((allocation) => allocation.personId === personId && allocation.date.startsWith(monthKey));
  const totals = new Map<string, number>();
  monthAllocations.forEach((allocation) => {
    totals.set(allocation.projectId, (totals.get(allocation.projectId) ?? 0) + durationMinutes(allocation));
  });
  const overbooked = monthlyOverbookedMinutesByProject(monthAllocations);
  const longest = Math.max(...totals.values(), 0);
  return [...totals.entries()]
    .map(([projectId, totalMinutes]) => ({
      projectId,
      totalMinutes,
      overbookedMinutes: overbooked.get(projectId) ?? 0,
      relativeWidth: longest > 0 ? totalMinutes / longest : 0,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes || a.projectId.localeCompare(b.projectId));
}

export function monthlyOverbookedMinutesByProject(allocations: Allocation[]) {
  const byDate = new Map<string, Allocation[]>();
  allocations.forEach((allocation) => {
    byDate.set(allocation.date, [...(byDate.get(allocation.date) ?? []), allocation]);
  });
  const overbooked = new Map<string, number>();
  byDate.forEach((dayAllocations) => {
    let used = 0;
    [...dayAllocations]
      .sort((a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id))
      .forEach((allocation) => {
        const start = used;
        const end = used + durationMinutes(allocation);
        const extra = Math.max(0, end - CAPACITY_MINUTES) - Math.max(0, start - CAPACITY_MINUTES);
        if (extra > 0) overbooked.set(allocation.projectId, (overbooked.get(allocation.projectId) ?? 0) + extra);
        used = end;
      });
  });
  return overbooked;
}

export function mergeAdjacentAllocations(allocations: Allocation[]) {
  const groups = new Map<string, Allocation[]>();
  allocations.forEach((allocation) => {
    const key = [allocation.personId, allocation.date, allocation.projectId].join('|');
    groups.set(key, [...(groups.get(key) ?? []), allocation]);
  });

  return [...groups.values()]
    .flatMap((group) => {
      const sorted = [...group].sort((a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute || a.id.localeCompare(b.id));
      return sorted.reduce<Allocation[]>((merged, allocation) => {
        const previous = merged.at(-1);
        if (previous && allocation.startMinute <= previous.endMinute) {
          previous.endMinute = Math.max(previous.endMinute, allocation.endMinute);
          return merged;
        }
        merged.push({ ...allocation });
        return merged;
      }, []);
    })
    .sort((a, b) => a.personId.localeCompare(b.personId) || a.date.localeCompare(b.date) || a.startMinute - b.startMinute || a.id.localeCompare(b.id));
}

const projectColorPalette = ['#E6B450', '#6CB6FF', '#7FD88F', '#F37C9B', '#B493FF', '#4CC7C7', '#F59E5C', '#8BD450'];

export function colorForProject(projectId: string, projects: Project[]) {
  const index = projects.findIndex((p) => p.id === projectId);
  return projectColorPalette[Math.max(0, index) % projectColorPalette.length];
}

export function projectColorsFor(projectIds: string[]) {
  return projectIds.reduce<Record<string, string>>((colors, projectId, index) => {
    colors[projectId] = projectColorPalette[index % projectColorPalette.length];
    return colors;
  }, {});
}

export { blockStyle, dateMatchesView };

function isFullDay(entry: TimeOffEntry) {
  return entry.startMinute === 0 && entry.endMinute === DAY_MINUTES;
}

function timeOffEntriesTouch(a: TimeOffEntry, b: TimeOffEntry) {
  if (isFullDay(a) && isFullDay(b)) {
    const aDate = new Date(`${a.date}T00:00:00`);
    return formatDate(addDays(aDate, 1)) === b.date || formatDate(addDays(aDate, -1)) === b.date;
  }
  return a.date === b.date && (a.endMinute === b.startMinute || b.endMinute === a.startMinute);
}

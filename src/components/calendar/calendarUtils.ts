import React from 'react';
import type { Allocation, AllocationSelectionCell, AllocationStatus, AllocationView, Booking, Project } from '../../types';
import { blockStyle, clampMinute as clampCalendarMinute, dateMatchesView } from '../../shared/calendar';

export const CAPACITY_MINUTES = 8 * 60;
export const SNAP_MINUTES = 15;
export const DAY_MINUTES = 24 * 60;
export const DEFAULT_SEGMENT = { startMinute: 9 * 60, endMinute: 13 * 60 };

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

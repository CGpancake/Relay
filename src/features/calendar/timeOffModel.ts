import { DEFAULT_DAY_MINUTES, DEFAULT_SNAP_MINUTES, clampMinute } from '../../shared/calendar';
import type { AllocationSelectionCell, TimeOffEntry, TimeOffStatus, TimeOffType } from '../../types';

export type TimeOffApplyInput = {
  entries: TimeOffEntry[];
  selection: AllocationSelectionCell[];
  type: TimeOffType;
  startMinute: number;
  endMinute: number;
  defaultStatus?: TimeOffStatus;
  idPrefix?: string;
  now?: number;
  summaryOnly?: boolean;
};

export type TimeOffApplyResult =
  | { ok: true; entries: TimeOffEntry[]; changedEntryIds: string[] }
  | { ok: false; reason: 'empty-selection' | 'invalid-range' | 'overlap' };

export function normalizeTimeOffEntry(entry: TimeOffEntry): TimeOffEntry {
  const startMinute = clampMinute(entry.startMinute, DEFAULT_SNAP_MINUTES, DEFAULT_DAY_MINUTES);
  const endMinute = Math.max(startMinute + DEFAULT_SNAP_MINUTES, clampMinute(entry.endMinute, DEFAULT_SNAP_MINUTES, DEFAULT_DAY_MINUTES));
  return {
    ...entry,
    startMinute,
    endMinute: Math.min(DEFAULT_DAY_MINUTES, endMinute),
    status: entry.status ?? 'pending',
    notes: entry.notes?.trim() || undefined,
  };
}

export function hasTimeOffOverlap(entries: TimeOffEntry[], candidate: TimeOffEntry, excludedIds: string[] = []) {
  return entries.some(
    (entry) =>
      !excludedIds.includes(entry.id) &&
      entry.personId === candidate.personId &&
      entry.date === candidate.date &&
      candidate.startMinute < entry.endMinute &&
      candidate.endMinute > entry.startMinute,
  );
}

export function applyTimeOffOperation({
  entries,
  selection,
  type,
  startMinute,
  endMinute,
  defaultStatus = 'pending',
  idPrefix = 'time-off-local',
  now = Date.now(),
  summaryOnly = true,
}: TimeOffApplyInput): TimeOffApplyResult {
  const selectedEntryIds = selection.map((cell) => cell.allocationId).filter(Boolean) as string[];

  if (selectedEntryIds.length > 0) {
    const editedEntries = selectedEntryIds
      .map((id) => entries.find((entry) => entry.id === id))
      .filter(Boolean)
      .map((entry) => normalizeTimeOffEntry({ ...(entry as TimeOffEntry), type, startMinute, endMinute }));
    if (editedEntries.some((entry) => hasTimeOffOverlap(entries, entry, selectedEntryIds))) {
      return { ok: false, reason: 'overlap' };
    }
    return {
      ok: true,
      entries: entries.map((entry) => editedEntries.find((edited) => edited.id === entry.id) ?? entry),
      changedEntryIds: editedEntries.map((entry) => entry.id),
    };
  }

  const selectedCells = selection.filter((cell) => !cell.allocationId && (!summaryOnly || cell.rowType === 'summary'));
  if (selectedCells.length === 0) return { ok: false, reason: 'empty-selection' };
  if (endMinute <= startMinute) return { ok: false, reason: 'invalid-range' };

  const additions = selectedCells.map((cell, index) =>
    normalizeTimeOffEntry({
      id: `${idPrefix}-${now}-${index}`,
      personId: cell.personId,
      date: cell.date,
      startMinute,
      endMinute,
      type,
      status: defaultStatus,
    }),
  );
  if (additions.some((entry) => hasTimeOffOverlap(entries, entry))) {
    return { ok: false, reason: 'overlap' };
  }
  return { ok: true, entries: [...entries, ...additions], changedEntryIds: additions.map((entry) => entry.id) };
}

export function setTimeOffStatus(entries: TimeOffEntry[], selectedEntries: TimeOffEntry[], status: TimeOffStatus) {
  const ids = selectedEntries.map((entry) => entry.id);
  return entries.map((entry) => (ids.includes(entry.id) ? { ...entry, status } : entry));
}

export function deleteTimeOffEntries(entries: TimeOffEntry[], selectedEntries: TimeOffEntry[]) {
  const ids = selectedEntries.map((entry) => entry.id);
  return entries.filter((entry) => !ids.includes(entry.id));
}

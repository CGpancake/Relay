import React from 'react';
import type { AllocationSelectionCell, AllocationView, Person } from '../../types';
import { datesBetween } from '../../lib/date';
import { datesForView, shiftDateByView, zonedNow } from './index';

export type CalendarState = {
  view: AllocationView;
  setView: (view: AllocationView) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  shiftSelectedDate: (direction: -1 | 1) => void;
  dates: string[];
  today: string;
  now: { date: string; minute: number };

  selection: AllocationSelectionCell[];
  setSelection: React.Dispatch<React.SetStateAction<AllocationSelectionCell[]>>;
  anchor: AllocationSelectionCell | null;
  setAnchor: React.Dispatch<React.SetStateAction<AllocationSelectionCell | null>>;
  selectCell: (cell: AllocationSelectionCell, event: React.MouseEvent) => void;
  clearSelection: () => void;

  expandedPeople: Set<string>;
  toggleExpanded: (personId: string) => void;
  manualProjectRows: Record<string, string[]>;
  addManualProjectRow: (personId: string, projectId: string) => void;
  projectPickerPersonId: string | null;
  setProjectPickerPersonId: React.Dispatch<React.SetStateAction<string | null>>;
};

type Config = {
  timezone: string;
  people: Person[];
  initialView?: AllocationView;
  onCellSelect?: (cells: AllocationSelectionCell[]) => void;
};

export function useCalendarState({ timezone, people, initialView = 'week', onCellSelect }: Config): CalendarState {
  const [view, setView] = React.useState<AllocationView>(initialView);
  const [selectedDate, setSelectedDate] = React.useState(() => zonedNow(timezone).date);
  const [selection, setSelection] = React.useState<AllocationSelectionCell[]>([]);
  const [anchor, setAnchor] = React.useState<AllocationSelectionCell | null>(null);
  const [expandedPeople, setExpandedPeople] = React.useState<Set<string>>(() => new Set());
  const [manualProjectRows, setManualProjectRows] = React.useState<Record<string, string[]>>({});
  const [projectPickerPersonId, setProjectPickerPersonId] = React.useState<string | null>(null);

  const dates = React.useMemo(() => datesForView(view, selectedDate), [view, selectedDate]);
  const now = React.useMemo(() => zonedNow(timezone), [timezone]);
  const today = now.date;

  React.useEffect(() => {
    const personIds = new Set(people.map((p) => p.id));
    setExpandedPeople((current) => new Set([...current].filter((id) => personIds.has(id))));
  }, [people]);

  const shiftSelectedDate = (direction: -1 | 1) =>
    setSelectedDate((current) => shiftDateByView(current, view, direction));

  const selectCell = (cell: AllocationSelectionCell, event: React.MouseEvent) => {
    if (event.shiftKey && anchor && anchor.personId === cell.personId && anchor.rowType === cell.rowType && anchor.projectId === cell.projectId) {
      const range = datesBetween(anchor.date, cell.date).map((date) => ({ ...cell, date }));
      setSelection(range);
      onCellSelect?.(range);
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      setSelection((current) => {
        const next = current.some((s) => sameCell(s, cell)) ? current.filter((s) => !sameCell(s, cell)) : [...current, cell];
        onCellSelect?.(next);
        return next;
      });
      setAnchor(cell);
      return;
    }
    setSelection([cell]);
    setAnchor(cell);
    onCellSelect?.([cell]);
  };

  const clearSelection = () => setSelection([]);

  const toggleExpanded = (personId: string) =>
    setExpandedPeople((current) => {
      const next = new Set(current);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });

  const addManualProjectRow = (personId: string, projectId: string) => {
    setManualProjectRows((current) => ({
      ...current,
      [personId]: [...new Set([...(current[personId] ?? []), projectId])],
    }));
    setExpandedPeople((current) => new Set(current).add(personId));
    setProjectPickerPersonId(null);
  };

  return {
    view, setView, selectedDate, setSelectedDate, shiftSelectedDate,
    dates, today, now,
    selection, setSelection, anchor, setAnchor, selectCell, clearSelection,
    expandedPeople, toggleExpanded,
    manualProjectRows, addManualProjectRow, projectPickerPersonId, setProjectPickerPersonId,
  };
}

function sameCell(a: AllocationSelectionCell, b: AllocationSelectionCell) {
  return (
    a.personId === b.personId &&
    a.date === b.date &&
    a.rowType === b.rowType &&
    a.projectId === b.projectId &&
    a.allocationId === b.allocationId
  );
}

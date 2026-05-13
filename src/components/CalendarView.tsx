import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CalendarToolbar } from '../shared/calendar/CalendarToolbar';
import { allocationStatusLabels, allocationStatuses } from '../data/labels';
import { canAccessCalendarMode, canApproveTimeOff, canEditAllocation, canEditPersonAllocation } from '../lib/permissions';
import { absoluteMinuteToDateMinute, computeVisibleDayWindow, dateMinuteToAbsoluteMinute, minuteFromPointerInWindow } from '../shared/calendar';
import { useCalendarState } from '../shared/calendar/useCalendarState';
import type { Allocation, AllocationSelectionCell, CalendarDayWindowSettings, CalendarMode, CalendarOverlaySettings, Person, Project, Task, TimeOffEntry, TimeOffStatus, TimeOffType } from '../types';
import { CalendarDayView } from './calendar/CalendarDayView';
import { CalendarCompactView } from './calendar/CalendarCompactView';
import {
  AllocationDragState, SegmentDraft,
  CAPACITY_MINUTES, DAY_MINUTES, SNAP_MINUTES, DEFAULT_SEGMENT,
  allocationsFor, clampMinute, dateMatchesView, draftFromAllocation,
  durationMinutes, hasAllocationsForCell,
  minuteFromTime, normalizeDraft, selectionMode, timeLabel,
} from './calendar/calendarUtils';

export function CalendarView({
  allocations,
  calendarDayWindow,
  calendarOverlays,
  currentUser,
  initialMode = 'allocation',
  people,
  projects,
  setAllocations,
  setTasks,
  setTimeOff,
  tasks,
  timeOff,
  timezone,
}: {
  allocations: Allocation[];
  calendarDayWindow: CalendarDayWindowSettings;
  calendarOverlays: CalendarOverlaySettings;
  currentUser: Person;
  initialMode?: CalendarMode;
  people: Person[];
  projects: Project[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setTimeOff: React.Dispatch<React.SetStateAction<TimeOffEntry[]>>;
  tasks: Task[];
  timeOff: TimeOffEntry[];
  timezone: string;
}) {
  const availableModes = (['allocation', 'time-off', 'milestones'] as CalendarMode[]).filter((mode) => canAccessCalendarMode(currentUser, mode));
  const [activeMode, setActiveModeState] = React.useState<CalendarMode>(availableModes.includes(initialMode) ? initialMode : availableModes[0] ?? 'allocation');
  const [segmentDrafts, setSegmentDrafts] = React.useState<SegmentDraft[]>(() => [
    { id: 'draft-1', projectId: projects[0]?.id ?? '', ...DEFAULT_SEGMENT, status: 'planned', notes: '', taskIds: [] },
  ]);
  const [timeOffType, setTimeOffType] = React.useState<TimeOffType>('holiday');
  const [timeOffMode, setTimeOffMode] = React.useState<'full-day' | 'hourly'>('full-day');
  const [timeOffStartMinute, setTimeOffStartMinute] = React.useState(9 * 60);
  const [timeOffEndMinute, setTimeOffEndMinute] = React.useState(13 * 60);
  const [timeOffValidation, setTimeOffValidation] = React.useState('');
  const [dragState, setDragState] = React.useState<AllocationDragState | null>(null);
  const [contextAllocationId, setContextAllocationId] = React.useState<string | null>(null);

  const editable = canEditAllocation(currentUser);
  const canApprove = canApproveTimeOff(currentUser);
  const visiblePeople = currentUser.permissionLevel === 'Artist' ? people.filter((person) => person.id === currentUser.id) : people;
  const forcedOverlays = { ...calendarOverlays, milestones: false, [activeMode]: true };

  const cal = useCalendarState({
    timezone,
    people,
    initialView: 'week',
    onCellSelect: (cells) => {
      if (activeMode === 'allocation') loadProjectCellDrafts(cells);
      if (activeMode === 'time-off') setTimeOffValidation('');
    },
  });

  const { view, selectedDate, setSelectedDate, setView, shiftSelectedDate, dates, today, now, selection, setSelection } = cal;

  const activeProjectId = segmentDrafts[0]?.projectId ?? projects[0]?.id ?? '';
  const dayWindow = computeVisibleDayWindow(selectedDate, today, now.minute, calendarDayWindow);
  const allSelectionProjectRows = selection.length > 0 && selection.every((cell) => cell.rowType === 'project' && cell.projectId);
  const selectedTaskCount = segmentDrafts.reduce((sum, d) => sum + d.taskIds.length, 0);
  const editorMode = selectionMode(selection, allocations, view);
  const selectedTimeOff = selection
    .map((cell) => cell.allocationId)
    .filter(Boolean)
    .map((id) => timeOff.find((entry) => entry.id === id))
    .filter(Boolean) as TimeOffEntry[];

  const setActiveMode = (mode: CalendarMode) => {
    if (!availableModes.includes(mode)) return;
    setActiveModeState(mode);
    setSelection([]);
    setContextAllocationId(null);
    window.history.replaceState(null, '', `/calendar?mode=${mode}`);
  };

  React.useEffect(() => {
    setSegmentDrafts((current) =>
      current.map((draft) =>
        projects.some((p) => p.id === draft.projectId) ? draft : { ...draft, projectId: projects[0]?.id ?? '', taskIds: [] },
      ),
    );
  }, [projects]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!editable || (event.key !== 'Delete' && event.key !== 'Backspace') || selection.length === 0) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      event.preventDefault();
      deleteSelection();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editable, selection]);

  const loadProjectCellDrafts = (cells: AllocationSelectionCell[]) => {
    if (cells.length !== 1 || cells[0].allocationId || cells[0].rowType !== 'project' || !cells[0].projectId) return;
    const cell = cells[0];
    const existing = allocations
      .filter((a) => a.personId === cell.personId && a.projectId === cell.projectId && dateMatchesView(a.date, cell.date, view))
      .sort((a, b) => a.startMinute - b.startMinute);
    if (existing.length > 0) {
      setSegmentDrafts(existing.map(draftFromAllocation));
    } else {
      setSegmentDrafts((current) => current.map((d) => ({ ...d, projectId: cell.projectId ?? d.projectId, taskIds: [] })));
    }
  };

  const selectAllocation = (allocation: Allocation, event: React.MouseEvent) => {
    event.stopPropagation();
    cal.selectCell(
      { personId: allocation.personId, date: allocation.date, rowType: 'project', projectId: allocation.projectId, allocationId: allocation.id },
      event,
    );
    setSegmentDrafts([draftFromAllocation(allocation)]);
  };

  const updateDraft = (draftId: string, updater: (draft: SegmentDraft) => SegmentDraft) => {
    setSegmentDrafts((current) => current.map((d) => (d.id === draftId ? normalizeDraft(updater(d)) : d)));
  };

  const applyAllocation = () => {
    if (!editable || selection.length === 0 || segmentDrafts.length === 0) return;
    const selectedCells = selection.filter((cell) => canEditPersonAllocation(currentUser, cell.personId));
    const drafts = segmentDrafts.map(normalizeDraft);
    setAllocations((current) => {
      const explicitIds = selectedCells.map((cell) => cell.allocationId).filter(Boolean) as string[];
      if (explicitIds.length > 0) {
        return current.map((a) => {
          const index = explicitIds.indexOf(a.id);
          if (index === -1) return a;
          const draft = drafts[Math.min(index, drafts.length - 1)];
          return { ...a, projectId: draft.projectId, startMinute: draft.startMinute, endMinute: draft.endMinute, status: draft.status, notes: draft.notes };
        });
      }
      const replaceCells = selectedCells.filter((cell) => !cell.allocationId && cell.rowType === 'project' && cell.projectId);
      if (replaceCells.length > 0 && replaceCells.some((cell) => hasAllocationsForCell(current, cell, view))) {
        const remaining = current.filter(
          (a) => !replaceCells.some((cell) => cell.personId === a.personId && cell.projectId === a.projectId && dateMatchesView(a.date, cell.date, view)),
        );
        const replacements = replaceCells.flatMap((cell, ci) =>
          drafts.map((draft, di) => ({
            id: `alloc-local-${Date.now()}-${ci}-${di}`,
            personId: cell.personId,
            projectId: cell.projectId ?? draft.projectId,
            date: cell.date,
            startMinute: draft.startMinute,
            endMinute: draft.endMinute,
            status: draft.status,
            notes: draft.notes,
          })),
        );
        return [...remaining, ...replacements];
      }
      const additions = selectedCells.flatMap((cell, ci) =>
        drafts.map((draft, di) => ({
          id: `alloc-local-${Date.now()}-${ci}-${di}`,
          personId: cell.personId,
          projectId: cell.projectId ?? draft.projectId,
          date: cell.date,
          startMinute: draft.startMinute,
          endMinute: draft.endMinute,
          status: draft.status,
          notes: draft.notes,
        })),
      );
      return [...current, ...additions];
    });
    const attachedTasks = drafts.flatMap((d) => d.taskIds.map((taskId) => ({ projectId: d.projectId, taskId })));
    if (attachedTasks.length > 0) {
      const latestDate = selectedCells.map((cell) => cell.date).sort().at(-1);
      if (latestDate) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            attachedTasks.some((a) => a.taskId === task.id && a.projectId === task.projectId) ? { ...task, dueDate: latestDate } : task,
          ),
        );
      }
    }
  };

  const deleteSelection = () => {
    const selectedCells = selection.filter((cell) => canEditPersonAllocation(currentUser, cell.personId));
    if (selectedCells.length === 0) return;
    setAllocations((current) =>
      current.filter(
        (a) =>
          !selectedCells.some((cell) => {
            if (cell.allocationId) return cell.allocationId === a.id;
            if (cell.rowType === 'summary') return cell.personId === a.personId && dateMatchesView(a.date, cell.date, view);
            return cell.personId === a.personId && cell.projectId === a.projectId && dateMatchesView(a.date, cell.date, view);
          }),
      ),
    );
    setSelection([]);
    setContextAllocationId(null);
  };

  const deleteAllocation = (allocationId: string) => {
    setAllocations((current) => current.filter((a) => a.id !== allocationId || !canEditPersonAllocation(currentUser, a.personId)));
    setSelection((current) => current.filter((cell) => cell.allocationId !== allocationId));
    setContextAllocationId(null);
  };

  const selectTimeOff = (entry: TimeOffEntry, event: React.MouseEvent) => {
    event.stopPropagation();
    const cell = { personId: entry.personId, date: entry.date, rowType: 'summary' as const, allocationId: entry.id };
    setSelection([cell]);
    setTimeOffType(entry.type);
    setTimeOffMode(entry.startMinute === 0 && entry.endMinute === DAY_MINUTES ? 'full-day' : 'hourly');
    setTimeOffStartMinute(entry.startMinute);
    setTimeOffEndMinute(entry.endMinute);
    setTimeOffValidation('');
  };

  const selectTimeOffGroup = (entries: TimeOffEntry[], event: React.MouseEvent) => {
    event.stopPropagation();
    if (entries.length === 0) return;
    const cells = entries.map((entry) => ({ personId: entry.personId, date: entry.date, rowType: 'summary' as const, allocationId: entry.id }));
    const first = entries[0];
    setSelection(cells);
    setTimeOffType(first.type);
    setTimeOffMode(first.startMinute === 0 && first.endMinute === DAY_MINUTES ? 'full-day' : 'hourly');
    setTimeOffStartMinute(first.startMinute);
    setTimeOffEndMinute(first.endMinute);
    setTimeOffValidation('');
  };

  const applyTimeOff = () => {
    setTimeOffValidation('');
    const selectedEntryIds = selection.map((cell) => cell.allocationId).filter(Boolean) as string[];
    const nextStart = timeOffMode === 'full-day' ? 0 : timeOffStartMinute;
    const nextEnd = timeOffMode === 'full-day' ? DAY_MINUTES : timeOffEndMinute;

    if (selectedEntryIds.length > 0) {
      const editedEntries = selectedEntryIds
        .map((id) => timeOff.find((entry) => entry.id === id))
        .filter(Boolean)
        .map((entry) => normalizeTimeOff({ ...(entry as TimeOffEntry), type: timeOffType, startMinute: nextStart, endMinute: nextEnd }));
      if (editedEntries.some((entry) => hasTimeOffOverlap(timeOff, entry, selectedEntryIds))) {
        setTimeOffValidation('Time off overlaps an existing time off entry for the same person and time range.');
        return;
      }
      setTimeOff((current) => current.map((entry) => editedEntries.find((edited) => edited.id === entry.id) ?? entry));
      return;
    }

    const selectedCells = selection.filter((cell) => !cell.allocationId && cell.rowType === 'summary');
    if (selectedCells.length === 0 || nextEnd <= nextStart) return;
    const additions = selectedCells.map((cell, index) =>
      normalizeTimeOff({
        id: `time-off-local-${Date.now()}-${index}`,
        personId: cell.personId,
        date: cell.date,
        startMinute: nextStart,
        endMinute: nextEnd,
        type: timeOffType,
        status: 'pending',
      }),
    );
    if (additions.some((entry) => hasTimeOffOverlap(timeOff, entry))) {
      setTimeOffValidation('Time off overlaps an existing time off entry for the same person and time range.');
      return;
    }
    setTimeOff((current) => [...current, ...additions]);
  };

  const setSelectedTimeOffStatus = (status: TimeOffStatus) => {
    if (!canApprove || selectedTimeOff.length === 0) return;
    const ids = selectedTimeOff.map((entry) => entry.id);
    setTimeOff((current) => current.map((entry) => (ids.includes(entry.id) ? { ...entry, status } : entry)));
  };

  const toggleTaskAttachment = (draftId: string, taskId: string) => {
    updateDraft(draftId, (draft) => ({
      ...draft,
      taskIds: draft.taskIds.includes(taskId) ? draft.taskIds.filter((id) => id !== taskId) : [...draft.taskIds, taskId],
    }));
  };

  const beginCreate = (personId: string, projectId: string, date: string, event: React.PointerEvent<HTMLButtonElement>) => {
    if (!editable || !canEditPersonAllocation(currentUser, personId) || view !== 'day') return;
    const startMinute = minuteFromPointerInWindow(event, dayWindow, SNAP_MINUTES);
    setDragState({ kind: 'create', personId, projectId, date, startMinute, endMinute: Math.min(dayWindow.endMinute, startMinute + 60) });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCreate = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragState?.kind !== 'create') return;
    setDragState({ ...dragState, endMinute: minuteFromPointerInWindow(event, dayWindow, SNAP_MINUTES) });
  };

  const endCreate = () => {
    if (dragState?.kind !== 'create') return;
    const startMinute = Math.min(dragState.startMinute, dragState.endMinute);
    const endMinute = Math.max(startMinute + SNAP_MINUTES, Math.max(dragState.startMinute, dragState.endMinute));
    const allocationsToAdd = splitAbsoluteAllocationRange(selectedDate, {
      id: `alloc-local-${Date.now()}`,
      personId: dragState.personId,
      projectId: dragState.projectId,
      status: segmentDrafts[0]?.status ?? 'planned',
      notes: segmentDrafts[0]?.notes ?? '',
    }, startMinute, endMinute);
    if (allocationsToAdd.length === 0) {
      setDragState(null);
      return;
    }
    setAllocations((current) => [...current, ...allocationsToAdd]);
    setSelection(allocationsToAdd.map((allocation) => ({ personId: allocation.personId, date: allocation.date, rowType: 'project', projectId: allocation.projectId, allocationId: allocation.id })));
    setSegmentDrafts(allocationsToAdd.map(draftFromAllocation));
    setDragState(null);
  };

  const beginBlockDrag = (allocation: Allocation, kind: 'move' | 'resize-start' | 'resize-end', event: React.PointerEvent) => {
    if (!editable || !canEditPersonAllocation(currentUser, allocation.personId) || view !== 'day') return;
    event.stopPropagation();
    const originMinute = minuteFromPointerInWindow(event, dayWindow, SNAP_MINUTES);
    setDragState({ kind, allocationId: allocation.id, originMinute, originalDate: allocation.date, originalStart: allocation.startMinute, originalEnd: allocation.endMinute });
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const updateBlockDrag = (event: React.PointerEvent) => {
    if (!dragState || dragState.kind === 'create') return;
    const minute = minuteFromPointerInWindow(event, dayWindow, SNAP_MINUTES);
    setAllocations((current) =>
      current.map((a) => {
        if (a.id !== dragState.allocationId) return a;
        const originalStart = dateMinuteToAbsoluteMinute(selectedDate, dragState.originalDate, dragState.originalStart);
        const originalEnd = dateMinuteToAbsoluteMinute(selectedDate, dragState.originalDate, dragState.originalEnd);
        if (dragState.kind === 'move') {
          const delta = minute - dragState.originMinute;
          const duration = originalEnd - originalStart;
          const nextStart = Math.min(dayWindow.endMinute - duration, Math.max(dayWindow.startMinute, originalStart + delta));
          const start = absoluteMinuteToDateMinute(selectedDate, nextStart);
          const dateStartAbsolute = dateMinuteToAbsoluteMinute(selectedDate, start.date, 0);
          return { ...a, date: start.date, startMinute: start.minuteOfDay, endMinute: nextStart + duration - dateStartAbsolute };
        }
        if (dragState.kind === 'resize-start') {
          const nextStart = Math.min(minute, originalEnd - SNAP_MINUTES);
          const start = absoluteMinuteToDateMinute(selectedDate, nextStart);
          const dateStartAbsolute = dateMinuteToAbsoluteMinute(selectedDate, start.date, 0);
          return { ...a, date: start.date, startMinute: start.minuteOfDay, endMinute: originalEnd - dateStartAbsolute };
        }
        const nextEnd = Math.max(minute, originalStart + SNAP_MINUTES);
        const start = absoluteMinuteToDateMinute(selectedDate, originalStart);
        const dateStartAbsolute = dateMinuteToAbsoluteMinute(selectedDate, start.date, 0);
        return { ...a, date: start.date, startMinute: start.minuteOfDay, endMinute: nextEnd - dateStartAbsolute };
      }),
    );
  };

  const endBlockDrag = () => {
    if (!dragState || dragState.kind === 'create') {
      setDragState(null);
      return;
    }
    setAllocations((current) => {
      const dragged = current.find((a) => a.id === dragState.allocationId);
      if (!dragged) return current;
      const startAbsolute = dateMinuteToAbsoluteMinute(selectedDate, dragged.date, dragged.startMinute);
      const endAbsolute = dateMinuteToAbsoluteMinute(selectedDate, dragged.date, dragged.endMinute);
      const replacements = splitAbsoluteAllocationRange(selectedDate, dragged, startAbsolute, endAbsolute);
      return current.flatMap((a) => (a.id === dragged.id ? replacements : [{ ...a, startMinute: clampMinute(a.startMinute), endMinute: clampMinute(a.endMinute) }]));
    });
    setDragState(null);
  };

  return (
    <>
      <section className="view-header calendar-header">
        <div>
          <p className="eyebrow">Relay / Calendar</p>
          <h1>calendar</h1>
        </div>
        <div className="toggle-row calendar-mode-buttons" aria-label="Calendar modes">
          {availableModes.map((mode) => (
            <button className={activeMode === mode ? 'is-active' : ''} key={mode} onClick={() => setActiveMode(mode)} type="button">
              {calendarModeLabel(mode)}
            </button>
          ))}
        </div>
      </section>

      <section className="calendar-layout">
        <CalendarToolbar
          dateLabel={activeMode === 'time-off' ? 'Time off date' : undefined}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setView={setView}
          shiftSelectedDate={shiftSelectedDate}
          view={view}
        />
        <div className="calendar-timeline" data-testid="calendar-timeline">
          {view === 'day' ? (
            <CalendarDayView
              activeProjectId={activeProjectId}
              activeMode={activeMode}
              allocations={allocations}
              beginBlockDrag={beginBlockDrag}
              beginCreate={beginCreate}
              cal={cal}
              contextAllocationId={contextAllocationId}
              deleteAllocation={deleteAllocation}
              dragState={dragState}
              dayWindow={dayWindow}
              canEditPerson={(personId) => canEditPersonAllocation(currentUser, personId)}
              editable={editable}
              endBlockDrag={endBlockDrag}
              endCreate={endCreate}
              moveCreate={moveCreate}
              overlays={forcedOverlays}
              people={activeMode === 'time-off' ? visiblePeople : people}
              projects={projects}
              segmentDraft={segmentDrafts[0] ?? null}
              selectAllocation={selectAllocation}
              selectTimeOff={selectTimeOff}
              setContextAllocationId={setContextAllocationId}
              timeOff={timeOff}
              updateBlockDrag={updateBlockDrag}
            />
          ) : (
            <CalendarCompactView
              activeMode={activeMode}
              allocations={allocations}
              cal={cal}
              overlays={forcedOverlays}
              people={activeMode === 'time-off' ? visiblePeople : people}
              projects={projects}
              onSelectTimeOffGroup={selectTimeOffGroup}
              timeOff={timeOff}
              view={view}
            />
          )}
        </div>
        {activeMode === 'allocation' && <aside className="allocation-editor" aria-label="Allocation editor">
          <h2>selected time</h2>
          <section className="segment-editor-list" aria-label="Time segments">
            {segmentDrafts.map((draft, index) => (
              <article className="segment-editor-row" key={draft.id} data-testid={`segment-editor-row-${index}`}>
                <label className={allSelectionProjectRows ? 'is-muted' : ''}>
                  Project
                  <select
                    disabled={!editable || allSelectionProjectRows}
                    onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, projectId: event.target.value }))}
                    value={draft.projectId}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {allSelectionProjectRows && <small>Using selected project rows</small>}
                </label>
                <div className="time-input-grid">
                  <label>
                    Start
                    <input
                      aria-label={`Start time ${index + 1}`}
                      disabled={!editable}
                      onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, startMinute: minuteFromTime(event.target.value) }))}
                      step={SNAP_MINUTES * 60}
                      type="time"
                      value={timeLabel(draft.startMinute)}
                    />
                  </label>
                  <label>
                    End
                    <input
                      aria-label={`End time ${index + 1}`}
                      disabled={!editable}
                      onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, endMinute: minuteFromTime(event.target.value) }))}
                      step={SNAP_MINUTES * 60}
                      type="time"
                      value={timeLabel(draft.endMinute)}
                    />
                  </label>
                </div>
                <label>
                  Duration
                  <input
                    aria-label={`Duration ${index + 1}`}
                    disabled={!editable}
                    max="16"
                    min="0.25"
                    onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, endMinute: current.startMinute + Number(event.target.value) * 60 }))}
                    step="0.25"
                    type="number"
                    value={(draft.endMinute - draft.startMinute) / 60}
                  />
                </label>
                <label>
                  Status
                  <select
                    disabled={!editable}
                    onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, status: event.target.value as typeof draft.status }))}
                    value={draft.status}
                  >
                    {allocationStatuses.map((status) => (
                      <option key={status} value={status}>
                        {allocationStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    disabled={!editable}
                    onChange={(event) => updateDraft(draft.id, (current) => ({ ...current, notes: event.target.value }))}
                    value={draft.notes}
                  />
                </label>
                <section className="task-attachment" aria-label={`Attach tasks ${index + 1}`}>
                  <h2>attach tasks</h2>
                  <div className="task-attachment-list">
                    {tasks.filter((task) => task.projectId === draft.projectId).length === 0 ? (
                      <p>No tasks for this project</p>
                    ) : (
                      tasks
                        .filter((task) => task.projectId === draft.projectId)
                        .map((task) => (
                          <label className="task-attachment-row" key={task.id}>
                            <input
                              checked={draft.taskIds.includes(task.id)}
                              disabled={!editable}
                              onChange={() => toggleTaskAttachment(draft.id, task.id)}
                              type="checkbox"
                            />
                            <span>
                              <strong>{task.title}</strong>
                              <small data-testid={`calendar-task-due-${task.id}`}>{task.dueDate}</small>
                            </span>
                          </label>
                        ))
                    )}
                  </div>
                </section>
                <div className="segment-actions">
                  <button
                    className="secondary-action"
                    disabled={!editable}
                    onClick={() => setSegmentDrafts((current) => current.filter((d) => d.id !== draft.id))}
                    type="button"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
          <button
            className="secondary-action"
            disabled={!editable}
            onClick={() =>
              setSegmentDrafts((current) => [
                ...current,
                { id: `draft-${Date.now()}`, projectId: current.at(-1)?.projectId ?? projects[0]?.id ?? '', startMinute: 13 * 60, endMinute: 15 * 60, status: current.at(-1)?.status ?? 'planned', notes: '', taskIds: [] },
              ])
            }
            type="button"
          >
            <Plus size={13} aria-hidden="true" />
            Add segment
          </button>
          <p data-testid="attached-task-count">{selectedTaskCount} attached</p>
          <button
            className="primary-action"
            disabled={!editable || selection.length === 0 || !selection.some((cell) => canEditPersonAllocation(currentUser, cell.personId))}
            onClick={applyAllocation}
            type="button"
          >
            {editorMode === 'replace-cell' ? 'Replace allocation' : 'Apply allocation'}
          </button>
          {!editable && <p className="access-note">Allocation editing is limited by role.</p>}
          {editable && selection.length > 0 && !selection.some((cell) => canEditPersonAllocation(currentUser, cell.personId)) && (
            <p className="access-note">Artists can only edit their own allocation.</p>
          )}
        </aside>}
        {activeMode === 'time-off' && (
          <aside className="allocation-editor time-off-editor" aria-label="Time Off editor">
            <h2>time off</h2>
            <p data-testid="time-off-selection-count">{selection.length} selected</p>
            <label>
              Type
              <select aria-label="Time off type" value={timeOffType} onChange={(event) => setTimeOffType(event.target.value as TimeOffType)}>
                <option value="holiday">Holiday</option>
                <option value="sick-leave">Sick leave</option>
              </select>
            </label>
            {selectedTimeOff.length > 0 && <p data-testid="time-off-status-summary">{selectedTimeOff.map((entry) => entry.status).join(', ')}</p>}
            <div className="toggle-row booking-time-mode" role="group" aria-label="Time off time mode">
              <button className={timeOffMode === 'full-day' ? 'is-active' : ''} onClick={() => setTimeOffMode('full-day')} type="button">
                Full day
              </button>
              <button className={timeOffMode === 'hourly' ? 'is-active' : ''} onClick={() => setTimeOffMode('hourly')} type="button">
                Hourly
              </button>
            </div>
            {timeOffMode === 'hourly' && (
              <div className="time-input-grid">
                <label>
                  Start
                  <select aria-label="Time off start time" value={timeOffStartMinute} onChange={(event) => setTimeOffStartMinute(Number(event.target.value))}>
                    {hourOptions().slice(0, -1).map((minute) => (
                      <option key={minute} value={minute}>{timeLabel(minute)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  End
                  <select aria-label="Time off end time" value={timeOffEndMinute} onChange={(event) => setTimeOffEndMinute(Number(event.target.value))}>
                    {hourOptions().slice(1).map((minute) => (
                      <option key={minute} value={minute}>{timeLabel(minute)}</option>
                    ))}
                  </select>
                </label>
                {timeOffEndMinute <= timeOffStartMinute && <p role="alert">End must be after start.</p>}
              </div>
            )}
            <button className="primary-action" disabled={selection.length === 0 || (timeOffMode === 'hourly' && timeOffEndMinute <= timeOffStartMinute)} onClick={applyTimeOff} type="button">
              {selection.some((cell) => cell.allocationId) ? 'Update time off' : 'Apply time off'}
            </button>
            {timeOffValidation && <p className="access-note" role="alert">{timeOffValidation}</p>}
            {canApprove && selectedTimeOff.length > 0 && (
              <div className="segment-actions">
                {selectedTimeOff.some((entry) => entry.status === 'pending') && (
                  <button className="secondary-action" onClick={() => setSelectedTimeOffStatus('confirmed')} type="button">Confirm</button>
                )}
                {selectedTimeOff.some((entry) => entry.status === 'confirmed') && (
                  <button className="secondary-action" onClick={() => setSelectedTimeOffStatus('pending')} type="button">Revert to pending</button>
                )}
              </div>
            )}
          </aside>
        )}
        {activeMode === 'milestones' && (
          <aside className="allocation-editor" aria-label="Milestones editor">
            <h2>milestones</h2>
            <p>Milestone planning will land here. The overlay toggle is reserved until milestone data is added.</p>
          </aside>
        )}
      </section>
    </>
  );
}

// Re-export for shared calendar usage (used by CalendarDayView imports via calendarUtils)
export { dateMatchesView } from '../shared/calendar';

function splitAbsoluteAllocationRange(
  selectedDate: string,
  base: Omit<Allocation, 'date' | 'startMinute' | 'endMinute'> | Allocation,
  startAbsolute: number,
  endAbsolute: number,
): Allocation[] {
  const start = Math.min(startAbsolute, endAbsolute);
  const end = Math.max(start + SNAP_MINUTES, endAbsolute);
  const firstDay = Math.floor(start / DAY_MINUTES);
  const lastDay = Math.floor((end - 1) / DAY_MINUTES);
  const parts: Allocation[] = [];
  for (let day = firstDay; day <= lastDay; day += 1) {
    const dayStart = day * DAY_MINUTES;
    const partStart = Math.max(start, dayStart);
    const partEnd = Math.min(end, dayStart + DAY_MINUTES);
    if (partEnd - partStart < SNAP_MINUTES) continue;
    const segmentStart = absoluteMinuteToDateMinute(selectedDate, partStart);
    const segmentEnd = absoluteMinuteToDateMinute(selectedDate, partEnd);
    parts.push({
      ...base,
      id: parts.length === 0 ? base.id : `${base.id}-${parts.length}`,
      date: segmentStart.date,
      startMinute: clampMinute(segmentStart.minuteOfDay),
      endMinute: segmentEnd.minuteOfDay === 0 && segmentEnd.date > segmentStart.date ? DAY_MINUTES : clampMinute(segmentEnd.minuteOfDay),
    });
  }
  return parts.filter((allocation) => allocation.endMinute - allocation.startMinute >= SNAP_MINUTES);
}

function normalizeTimeOff(entry: TimeOffEntry): TimeOffEntry {
  const startMinute = clampMinute(entry.startMinute);
  const endMinute = Math.max(startMinute + SNAP_MINUTES, clampMinute(entry.endMinute));
  return { ...entry, startMinute, endMinute: Math.min(DAY_MINUTES, endMinute), status: entry.status ?? 'pending', notes: entry.notes?.trim() || undefined };
}

function hasTimeOffOverlap(entries: TimeOffEntry[], candidate: TimeOffEntry, excludedIds: string[] = []) {
  return entries.some(
    (entry) =>
      !excludedIds.includes(entry.id) &&
      entry.personId === candidate.personId &&
      entry.date === candidate.date &&
      candidate.startMinute < entry.endMinute &&
      candidate.endMinute > entry.startMinute,
  );
}

function hourOptions() {
  return Array.from({ length: 25 }, (_, hour) => hour * 60);
}

function calendarModeLabel(mode: CalendarMode) {
  if (mode === 'time-off') return 'Time Off';
  if (mode === 'milestones') return 'Milestones';
  return 'Allocation';
}

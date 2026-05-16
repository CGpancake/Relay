import React from 'react';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import {
  absoluteMinuteToDateMinute,
  clipDateMinuteRangeToVisibleWindow,
  dateMinuteToAbsoluteMinute,
  minuteToWindowPercent,
  visibleBlockStyle,
  visibleWindowDuration,
  type VisibleDayWindow,
} from '../../shared/calendar';
import type { CalendarState } from '../../shared/calendar/useCalendarState';
import type { Allocation, CalendarMode, TimeOffEntry, Person, Project } from '../../types';
import {
  SegmentDraft, AllocationDragState,
  colorForProject, dayHourTicks, dayOverbookSegments, projectRowIds, timeLabel, ukBankHolidaysForDate,
} from './calendarUtils';

type Props = {
  cal: CalendarState;
  people: Person[];
  allocations: Allocation[];
  timeOff: TimeOffEntry[];
  projects: Project[];
  activeMode: CalendarMode;
  overlays: Record<CalendarMode, boolean>;
  dayWindow: VisibleDayWindow;
  displayDayWindow: VisibleDayWindow;
  dragState: AllocationDragState | null;
  segmentDraft: SegmentDraft | null;
  contextAllocationId: string | null;
  setContextAllocationId: (id: string | null) => void;
  activeProjectId: string;
  editable: boolean;
  canEditPerson: (personId: string) => boolean;
  selectAllocation: (allocation: Allocation, event: React.MouseEvent) => void;
  selectTimeOff: (entry: TimeOffEntry, event: React.MouseEvent) => void;
  deleteAllocation: (id: string) => void;
  beginCreate: (personId: string, projectId: string, date: string, event: React.PointerEvent<HTMLButtonElement>) => void;
  moveCreate: (event: React.PointerEvent<HTMLButtonElement>) => void;
  endCreate: () => void;
  beginBlockDrag: (allocation: Allocation, kind: 'move' | 'resize-start' | 'resize-end', event: React.PointerEvent) => void;
  updateBlockDrag: (event: React.PointerEvent) => void;
  endBlockDrag: () => void;
  onHeaderPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onHeaderPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onHeaderPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
};

export function CalendarDayView({
  cal, people, allocations, timeOff, projects,
  activeMode, overlays,
  dayWindow, displayDayWindow,
  dragState, contextAllocationId, setContextAllocationId,
  activeProjectId, editable, canEditPerson,
  selectAllocation, deleteAllocation,
  selectTimeOff,
  beginCreate, moveCreate, endCreate,
  beginBlockDrag, updateBlockDrag, endBlockDrag,
  onHeaderPointerDown, onHeaderPointerMove, onHeaderPointerUp,
}: Props) {
  const { selectedDate, today, now, selection, expandedPeople, manualProjectRows, projectPickerPersonId, setProjectPickerPersonId, toggleExpanded, addManualProjectRow } = cal;
  const labelWidthCh = React.useMemo(() => {
    const visibleProjectNames = projects
      .filter((project) =>
        people.some((person) =>
          allocations.some((allocation) => allocation.personId === person.id && allocation.projectId === project.id && allocation.date === selectedDate) ||
          (manualProjectRows[person.id] ?? []).includes(project.id),
        ),
      )
      .map((project) => project.name.length);
    const visiblePersonNames = people.map((person) => person.name.length);
    return Math.max(18, Math.min(34, Math.max(...visibleProjectNames, ...visiblePersonNames, 0) + 6));
  }, [allocations, manualProjectRows, people, projects, selectedDate]);
  const hourTicks = React.useMemo(() => {
    void displayDayWindow;
    return dayHourTicks(dayWindow.startMinute, dayWindow.endMinute);
  }, [dayWindow.endMinute, dayWindow.startMinute, displayDayWindow]);
  const pastWidth = selectedDate < today ? 100 : selectedDate === today ? minuteToWindowPercent(now.minute, dayWindow) : 0;
  const selectedDayStyle = visibleBlockStyle(0, 24 * 60, dayWindow);
  const showProjectRows = activeMode === 'allocation';
  const visibleDates = React.useMemo(() => {
    const dates = new Set<string>();
    for (let day = -1; day <= 1; day += 1) {
      const date = absoluteMinuteToDateMinute(selectedDate, day * 24 * 60).date;
      dates.add(date);
    }
    return [...dates];
  }, [selectedDate]);
  const holidayDates = React.useMemo(() => (
    visibleDates.flatMap((date) => ukBankHolidaysForDate(date, 'day').map((holiday) => holiday.date))
  ), [visibleDates]);

  return (
    <div
      className="day-timeline"
      data-testid="day-timeline"
      style={{
        '--visible-hours': visibleWindowDuration(dayWindow) / 60,
        '--calendar-label-width': `${labelWidthCh}ch`,
        '--calendar-day-width': `${(visibleWindowDuration(dayWindow) / 60) * 96}px`,
        '--calendar-inner-width': `calc(${labelWidthCh}ch + ${(visibleWindowDuration(dayWindow) / 60) * 96}px)`,
      } as React.CSSProperties}
    >
      <div className="calendar-corner day-label">person</div>
      <div
        className="day-scale"
        aria-hidden="true"
        data-testid="day-scale-header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
      >
        {hourTicks.map((tick) => (
          <span key={tick.minute} style={{ left: `${minuteToWindowPercent(tick.minute, dayWindow)}%` }}>
            {tick.label}
          </span>
        ))}
      </div>
      {people.map((person) => {
        const personAllocations = allocations
          .filter((a) => a.personId === person.id && clipDateMinuteRangeToVisibleWindow(selectedDate, a.date, a.startMinute, a.endMinute, dayWindow))
          .sort((a, b) => absoluteStart(a.date, a.startMinute) - absoluteStart(b.date, b.startMinute));
        const personTimeOff = timeOff.filter((entry) =>
          entry.personId === person.id && clipDateMinuteRangeToVisibleWindow(selectedDate, entry.date, entry.startMinute, entry.endMinute, dayWindow),
        );
        const overbookSegments = overlays.allocation
          ? visibleDates.flatMap((date) => dayOverbookSegments(allocations, person.id, date))
          : [];
        const isExpanded = expandedPeople.has(person.id);
        const visibleProjectIds = projectRowIds(
          projects,
          projects.filter((p) => personAllocations.some((a) => a.projectId === p.id)).map((p) => p.id),
          manualProjectRows[person.id] ?? [],
        );

        return (
          <React.Fragment key={person.id}>
            <div className="calendar-person calendar-summary-person day-person" data-testid={`calendar-summary-row-${person.id}`}>
              {showProjectRows && <div className="calendar-person-controls">
                <button
                  aria-label={`Add project row for ${person.name}`}
                  className="expand-button"
                  onClick={() => setProjectPickerPersonId((current) => (current === person.id ? null : person.id))}
                  type="button"
                >
                  <Plus size={13} aria-hidden="true" />
                </button>
                <button
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${person.name}`}
                  className="expand-button"
                  onClick={() => toggleExpanded(person.id)}
                  type="button"
                >
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
              </div>}
              <span>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </span>
              {showProjectRows && projectPickerPersonId === person.id && (
                <div className="project-row-picker">
                  <Dropdown
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    onChange={(projectId) => { addManualProjectRow(person.id, projectId); setProjectPickerPersonId(null); }}
                    placeholder="Pick project"
                    size="compact"
                    value=""
                  />
                </div>
              )}
            </div>
            <button
              className="calendar-cell calendar-summary-cell day-row"
              data-testid={`day-row-${person.id}-${selectedDate}`}
              onPointerDown={(event) => activeMode === 'allocation' && canEditPerson(person.id) && beginCreate(person.id, activeProjectId, selectedDate, event)}
              onPointerMove={(event) => { if (activeMode === 'allocation') { moveCreate(event); updateBlockDrag(event); } }}
              onPointerUp={() => { if (activeMode === 'allocation') { endCreate(); endBlockDrag(); } }}
              type="button"
            >
              {pastWidth > 0 && <span className="past-day-fill" style={{ width: `${pastWidth}%` }} aria-hidden="true" />}
              <span className="selected-date-overlay is-day" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" style={selectedDayStyle} />
              {holidayDates.map((date) => (
                <span
                  aria-hidden="true"
                  className="booking-overlay uk-holiday is-future-booking"
                  data-testid={`uk-holiday-overlay-${date}`}
                  key={`holiday-${date}`}
                  style={visibleBlockStyle(absoluteStart(date, 0), absoluteStart(date, 24 * 60), dayWindow)}
                  title={ukBankHolidaysForDate(date, 'day')[0]?.title}
                />
              ))}
              {overbookSegments.map((segment) => (
                <span
                  aria-hidden="true"
                  className="overbook-segment"
                  data-testid={`day-overbook-segment-${person.id}-${segment.date}-${segment.id}`}
                  key={`${segment.date}-${segment.id}`}
                  style={visibleBlockStyle(absoluteStart(segment.date, segment.startMinute), absoluteStart(segment.date, segment.endMinute), dayWindow)}
                />
              ))}
              {overlays['time-off'] && personTimeOff.map((timeOffEntry) => {
                const startMinute = absoluteStart(timeOffEntry.date, timeOffEntry.startMinute);
                const endMinute = absoluteStart(timeOffEntry.date, timeOffEntry.endMinute);
                return (
                  <button
                    className={`time-off-overlay booking-overlay booking-${timeOffEntry.type} status-${timeOffEntry.status} ${selection.some((cell) => cell.allocationId === timeOffEntry.id) ? 'is-selected' : ''} ${selectedDate < today ? 'is-past-booking' : 'is-future-booking'}`}
                    data-testid={`time-off-overlay-${timeOffEntry.type}-${timeOffEntry.status}-${person.id}-${timeOffEntry.date}`}
                    key={timeOffEntry.id}
                    onClick={(event) => selectTimeOff(timeOffEntry, event)}
                    style={visibleBlockStyle(startMinute, endMinute, dayWindow)}
                    type="button"
                  />
                );
              })}
              {dragState?.kind === 'create' && dragState.personId === person.id && (
                <span className="allocation-block is-draft" style={visibleBlockStyle(dragState.startMinute, dragState.endMinute, dayWindow)}>
                  {absoluteTimeLabel(Math.min(dragState.startMinute, dragState.endMinute))} - {absoluteTimeLabel(Math.max(dragState.startMinute, dragState.endMinute))}
                </span>
              )}
              {overlays.allocation && personAllocations.map((allocation) => {
                const startMinute = absoluteStart(allocation.date, allocation.startMinute);
                const endMinute = absoluteStart(allocation.date, allocation.endMinute);
                const isSelected = selection.some((cell) => cell.allocationId === allocation.id);
                const project = projects.find((p) => p.id === allocation.projectId);
                const projectColor = colorForProject(allocation.projectId, projects);
                return (
                  <span
                    className={`allocation-block status-${allocation.status} ${isSelected ? 'is-selected' : ''}`}
                    data-testid={`allocation-block-${allocation.id}`}
                    key={allocation.id}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      selectAllocation(allocation, event);
                      setContextAllocationId(allocation.id);
                    }}
                    onClick={(event) => selectAllocation(allocation, event)}
                    onPointerDown={(event) => beginBlockDrag(allocation, 'move', event)}
                    style={{ ...visibleBlockStyle(startMinute, endMinute, dayWindow), '--project-color': projectColor } as React.CSSProperties}
                    title={`${project?.name ?? allocation.projectId} ${timeLabel(allocation.startMinute)}-${timeLabel(allocation.endMinute)}`}
                  >
                    <span className="resize-handle is-start" onPointerDown={(event) => beginBlockDrag(allocation, 'resize-start', event)} />
                    <button type="button" onClick={(event) => selectAllocation(allocation, event)}>
                      <strong>{project?.name ?? allocation.projectId}</strong>
                      <small>{timeLabel(allocation.startMinute)}-{timeLabel(allocation.endMinute)}</small>
                    </button>
                    <span className="resize-handle is-end" onPointerDown={(event) => beginBlockDrag(allocation, 'resize-end', event)} />
                    {contextAllocationId === allocation.id && (
                      <span
                        className="allocation-context"
                        data-testid="allocation-context-menu"
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <button type="button" onClick={(event) => selectAllocation(allocation, event)}>
                          <Pencil size={12} aria-hidden="true" />
                          Edit
                        </button>
                        <button type="button" onClick={() => deleteAllocation(allocation.id)}>
                          <Trash2 size={12} aria-hidden="true" />
                          Delete
                        </button>
                      </span>
                    )}
                  </span>
                );
              })}
            </button>
            {showProjectRows && isExpanded &&
              visibleProjectIds.map((projectId) => {
                const project = projects.find((p) => p.id === projectId);
                const projectColor = colorForProject(projectId, projects);
                const projectAllocations = personAllocations.filter((a) => a.projectId === projectId);
                return (
                  <React.Fragment key={`${person.id}-${projectId}`}>
                    <div
                      className="calendar-person calendar-project-person day-person"
                      data-testid={`calendar-project-row-${person.id}-${projectId}`}
                      style={{ '--project-color': projectColor } as React.CSSProperties}
                      title={project?.name}
                    >
                      <span>{project?.name}</span>
                    </div>
                    <button
                      className="calendar-cell calendar-project-cell day-row calendar-project-day-row"
                      data-testid={`day-project-row-${person.id}-${projectId}-${selectedDate}`}
                      onPointerDown={(event) => activeMode === 'allocation' && canEditPerson(person.id) && beginCreate(person.id, projectId, selectedDate, event)}
                      onPointerMove={(event) => { if (activeMode === 'allocation') { moveCreate(event); updateBlockDrag(event); } }}
                      onPointerUp={() => { if (activeMode === 'allocation') { endCreate(); endBlockDrag(); } }}
                      type="button"
                    >
                      {pastWidth > 0 && <span className="past-day-fill" style={{ width: `${pastWidth}%` }} aria-hidden="true" />}
                      <span className="selected-date-overlay is-day" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" style={selectedDayStyle} />
                      {holidayDates.map((date) => (
                        <span
                          aria-hidden="true"
                          className="booking-overlay uk-holiday is-future-booking"
                          data-testid={`uk-holiday-overlay-${date}`}
                          key={`holiday-${date}`}
                          style={visibleBlockStyle(absoluteStart(date, 0), absoluteStart(date, 24 * 60), dayWindow)}
                          title={ukBankHolidaysForDate(date, 'day')[0]?.title}
                        />
                      ))}
                      {dragState?.kind === 'create' && dragState.personId === person.id && dragState.projectId === projectId && (
                        <span className="allocation-block is-draft" style={visibleBlockStyle(dragState.startMinute, dragState.endMinute, dayWindow)}>
                          {absoluteTimeLabel(Math.min(dragState.startMinute, dragState.endMinute))} - {absoluteTimeLabel(Math.max(dragState.startMinute, dragState.endMinute))}
                        </span>
                      )}
                      {overlays.allocation && projectAllocations.map((allocation) => {
                        const startMinute = absoluteStart(allocation.date, allocation.startMinute);
                        const endMinute = absoluteStart(allocation.date, allocation.endMinute);
                        const isSelected = selection.some((cell) => cell.allocationId === allocation.id);
                        return (
                          <span
                            className={`allocation-block status-${allocation.status} ${isSelected ? 'is-selected' : ''}`}
                            data-testid={`allocation-project-block-${allocation.id}`}
                            key={allocation.id}
                            onClick={(event) => selectAllocation(allocation, event)}
                            onPointerDown={(event) => beginBlockDrag(allocation, 'move', event)}
                            style={{ ...visibleBlockStyle(startMinute, endMinute, dayWindow), '--project-color': projectColor } as React.CSSProperties}
                          >
                            <span className="resize-handle is-start" onPointerDown={(event) => beginBlockDrag(allocation, 'resize-start', event)} />
                            <button type="button" onClick={(event) => selectAllocation(allocation, event)}>
                              <strong>{project?.name ?? allocation.projectId}</strong>
                              <small>{timeLabel(allocation.startMinute)}-{timeLabel(allocation.endMinute)}</small>
                            </button>
                            <span className="resize-handle is-end" onPointerDown={(event) => beginBlockDrag(allocation, 'resize-end', event)} />
                          </span>
                        );
                      })}
                    </button>
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </div>
  );

  function absoluteStart(date: string, minute: number) {
    return dateMinuteToAbsoluteMinute(selectedDate, date, minute);
  }

  function absoluteTimeLabel(minute: number) {
    return timeLabel(absoluteMinuteToDateMinute(selectedDate, minute).minuteOfDay);
  }
}

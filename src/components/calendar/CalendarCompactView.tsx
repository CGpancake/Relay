import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import { monthLabel, shortDate } from '../../lib/date';
import { dateMatchesView } from '../../shared/calendar';
import type { CalendarState } from '../../shared/calendar/useCalendarState';
import type { Allocation, AllocationSelectionCell, AllocationView, CalendarMode, TimeOffEntry, Person, Project } from '../../types';
import {
  CAPACITY_MINUTES, allocationsFor, bookingsFor,
  colorForProject, compactAllocationSegmentStyle, durationMinutes,
  formatDuration, projectColorsFor, projectRowIds,
} from './calendarUtils';

type Props = {
  cal: CalendarState;
  view: Exclude<AllocationView, 'day'>;
  people: Person[];
  allocations: Allocation[];
  timeOff: TimeOffEntry[];
  projects: Project[];
  activeMode: CalendarMode;
  overlays: Record<CalendarMode, boolean>;
  onSelectTimeOffGroup: (entries: TimeOffEntry[], event: React.MouseEvent) => void;
};

export function CalendarCompactView({ cal, view, people, allocations, timeOff, projects, activeMode, overlays, onSelectTimeOffGroup }: Props) {
  const { dates, today, selection, expandedPeople, manualProjectRows, projectPickerPersonId, setProjectPickerPersonId, selectCell, toggleExpanded, addManualProjectRow } = cal;
  const labelWidthCh = React.useMemo(() => {
    const visibleProjectNames = projects
      .filter((project) =>
        people.some((person) =>
          allocations.some((allocation) => allocation.personId === person.id && allocation.projectId === project.id && dates.some((date) => dateMatchesView(allocation.date, date, view))) ||
          (manualProjectRows[person.id] ?? []).includes(project.id),
        ),
      )
      .map((project) => project.name.length);
    const visiblePersonNames = people.map((person) => person.name.length);
    return Math.max(18, Math.min(34, Math.max(...visibleProjectNames, ...visiblePersonNames, 0) + 6));
  }, [allocations, dates, manualProjectRows, people, projects, view]);

  return (
    <div className={`calendar-grid calendar-${view}`} style={{ '--calendar-columns': dates.length, '--calendar-label-width': `${labelWidthCh}ch` } as React.CSSProperties}>
      <div className="calendar-corner">person</div>
      {dates.map((date) => (
        <div className={`calendar-date ${date < today ? 'is-past' : ''}`} key={date}>
          {view === 'year' ? monthLabel(date) : shortDate(date)}
        </div>
      ))}
      {people.map((person) => {
        const isExpanded = expandedPeople.has(person.id);
        const visibleProjectIds = projectRowIds(
          projects,
          projects
            .filter((p) => allocations.some((a) => a.personId === person.id && a.projectId === p.id && dates.some((d) => dateMatchesView(a.date, d, view))))
            .map((p) => p.id),
          manualProjectRows[person.id] ?? [],
        );
        const projectColorMap = projectColorsFor(visibleProjectIds);

        return (
          <React.Fragment key={person.id}>
            <div className="calendar-person calendar-summary-person" data-testid={`calendar-summary-row-${person.id}`}>
              <div className="calendar-person-controls">
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
              </div>
              <span>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </span>
              {projectPickerPersonId === person.id && (
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
            {dates.map((date) => {
              const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'summary' };
              const dayAllocations = allocationsFor(allocations, person.id, date, view);
              const dayTimeOff = bookingsFor(timeOff, person.id, date, view);
              const totalMinutes = overlays.allocation ? dayAllocations.reduce((sum, a) => sum + durationMinutes(a), 0) : 0;
              const isSelected = selection.some((s) => sameCell(s, cell));
              return (
                <button
                  aria-label={`${person.name} ${date} ${formatDuration(totalMinutes)} allocated`}
                  className={`calendar-cell calendar-summary-cell ${isSelected ? 'is-selected' : ''} ${overlays.allocation && totalMinutes > CAPACITY_MINUTES ? 'is-over' : ''} ${date < today ? 'is-past' : ''}`}
                  data-testid={`calendar-cell-${person.id}-${date}`}
                  data-time-off-testid={`time-off-cell-${person.id}-${date}`}
                  key={date}
                  onClick={(event) => selectCell(cell, event)}
                  type="button"
                >
                  {overlays.allocation && (
                    <span className="utilization-stack" aria-hidden="true" data-testid={`calendar-utilization-${person.id}-${date}`}>
                      {dayAllocations
                      .sort((a, b) => a.startMinute - b.startMinute)
                      .map((allocation) => (
                        <span
                          className="utilization-segment"
                          key={allocation.id}
                          style={{
                            '--project-color': projectColorMap[allocation.projectId] ?? colorForProject(allocation.projectId, projects),
                            '--segment-share': `${Math.min(100, (durationMinutes(allocation) / Math.max(totalMinutes > CAPACITY_MINUTES ? totalMinutes : CAPACITY_MINUTES, 1)) * 100)}%`,
                          } as React.CSSProperties}
                        />
                      ))}
                    </span>
                  )}
                  {overlays['time-off'] && dayTimeOff.map((timeOffEntry) => (
                    <span
                      className={`time-off-overlay booking-overlay ${activeMode === 'time-off' ? 'is-selectable' : ''} booking-${timeOffEntry.type} status-${timeOffEntry.status} is-compact ${date < today ? 'is-past-booking' : 'is-future-booking'}`}
                      data-testid={`time-off-overlay-${timeOffEntry.type}-${timeOffEntry.status}-${person.id}-${date}`}
                      key={timeOffEntry.id}
                      onClick={(event) => activeMode === 'time-off' && onSelectTimeOffGroup([timeOffEntry], event)}
                      role={activeMode === 'time-off' ? 'button' : undefined}
                      tabIndex={activeMode === 'time-off' ? 0 : undefined}
                    />
                  ))}
                </button>
              );
            })}
            {isExpanded &&
              visibleProjectIds.map((projectId) => {
                const project = projects.find((p) => p.id === projectId);
                const projectColor = projectColorMap[projectId] ?? colorForProject(projectId, projects);
                return (
                  <React.Fragment key={`${person.id}-${projectId}`}>
                    <div
                      className="calendar-person calendar-project-person"
                      data-testid={`calendar-project-row-${person.id}-${projectId}`}
                      style={{ '--project-color': projectColor } as React.CSSProperties}
                      title={project?.name}
                    >
                      <span>{project?.name}</span>
                    </div>
                    {dates.map((date) => {
                      const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'project', projectId };
                      const dayAllocations = allocationsFor(allocations, person.id, date, view);
                      const projectAllocations = dayAllocations.filter((a) => a.projectId === projectId);
                      const projectDayTimeOff = bookingsFor(timeOff, person.id, date, view);
                      const isSelected = selection.some((s) => sameCell(s, cell));
                      const hasAllocation = projectAllocations.length > 0;
                      return (
                        <button
                          className={`calendar-cell calendar-project-cell ${isSelected ? 'is-selected' : ''} ${hasAllocation ? 'has-allocation' : ''} ${date < today ? 'is-past' : ''}`}
                          data-testid={`calendar-project-cell-${person.id}-${projectId}-${date}`}
                          key={date}
                          onClick={(event) => activeMode === 'allocation' && selectCell(cell, event)}
                          style={{ '--project-color': projectColor } as React.CSSProperties}
                          type="button"
                        >
                          {overlays.allocation && hasAllocation && (
                            <span className="allocation-segment-layer" aria-hidden="true">
                              {projectAllocations
                                .sort((a, b) => a.startMinute - b.startMinute)
                                .map((allocation) => (
                                  <span
                                    className={`allocation-band status-${allocation.status}`}
                                    data-testid={`compact-allocation-segment-${allocation.id}`}
                                    key={allocation.id}
                                    style={compactAllocationSegmentStyle(allocation, dayAllocations)}
                                    title={`${formatDuration(durationMinutes(allocation))} ${project?.name ?? projectId}`}
                                  >
                                    <strong>{formatDuration(durationMinutes(allocation))}</strong>
                                  </span>
                                ))}
                            </span>
                          )}
                          {overlays['time-off'] && projectDayTimeOff.map((timeOffEntry) => (
                            <span
                              aria-hidden="true"
                              className={`time-off-overlay booking-overlay booking-${timeOffEntry.type} status-${timeOffEntry.status} is-compact ${date < today ? 'is-past-booking' : 'is-future-booking'}`}
                              data-testid={`time-off-overlay-${timeOffEntry.type}-${timeOffEntry.status}-${person.id}-${projectId}-${date}`}
                              key={timeOffEntry.id}
                            />
                          ))}
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
          </React.Fragment>
        );
      })}
    </div>
  );
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

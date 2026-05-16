import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import { monthLabel, shortDate } from '../../lib/date';
import { compactColumnWidthForView, dateMatchesView } from '../../shared/calendar';
import type { CalendarState } from '../../shared/calendar/useCalendarState';
import type { Allocation, AllocationSelectionCell, AllocationView, CalendarMode, TimeOffEntry, Person, Project } from '../../types';
import {
  CAPACITY_MINUTES, allocationsFor, bookingsFor,
  colorForProject, compactAllocationSegmentStyle, durationMinutes,
  formatDuration, projectColorsFor, projectRowIds,
  mergeAdjacentAllocations, monthlyProjectStats, ukBankHolidaysForDate,
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
  onHeaderPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onHeaderPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onHeaderPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
};

export function CalendarCompactView({ cal, view, people, allocations, timeOff, projects, activeMode, overlays, onSelectTimeOffGroup, onHeaderPointerDown, onHeaderPointerMove, onHeaderPointerUp }: Props) {
  const { dates, selectedDate, today, selection, expandedPeople, manualProjectRows, projectPickerPersonId, setProjectPickerPersonId, selectCell, toggleExpanded, addManualProjectRow } = cal;
  const columnWidth = compactColumnWidthForView(view);
  const showProjectRows = activeMode === 'allocation';
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
    <div
      className={`calendar-grid calendar-${view}`}
      style={{
        '--calendar-columns': dates.length,
        '--calendar-column-width': `${columnWidth}px`,
        '--calendar-label-width': `${labelWidthCh}ch`,
        '--calendar-inner-width': `calc(${labelWidthCh}ch + ${dates.length * columnWidth}px)`,
      } as React.CSSProperties}
    >
      <div className="calendar-corner">person</div>
      {dates.map((date) => (
        <div
          className={`calendar-date ${date < today ? 'is-past' : ''}`}
          data-testid={`calendar-date-header-${date}`}
          key={date}
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
        >
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
            {dates.map((date) => {
              const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'summary' };
              const yearStats = view === 'year' ? monthlyProjectStats(allocations, person.id, date) : [];
              const dayAllocations = view === 'year' ? [] : mergeAdjacentAllocations(allocationsFor(allocations, person.id, date, view));
              const dayTimeOff = bookingsFor(timeOff, person.id, date, view);
              const ukHolidays = view === 'year' ? [] : ukBankHolidaysForDate(date, view);
              const totalMinutes = overlays.allocation ? (view === 'year' ? yearStats.reduce((sum, stat) => sum + stat.totalMinutes, 0) : dayAllocations.reduce((sum, a) => sum + durationMinutes(a), 0)) : 0;
              const isSelected = selection.some((s) => sameCell(s, cell));
              const rangeClass = selectedRangeClass(selection, cell, dates);
              if (view === 'year') {
                return (
                  <div
                    aria-label={`${person.name} ${date} ${formatDuration(totalMinutes)} allocated`}
                    className={`calendar-cell calendar-summary-cell calendar-year-cell ${date < today ? 'is-past' : ''} ${dateMatchesView(selectedDate, date, view) ? 'has-selected-date' : ''}`}
                    data-testid={`calendar-cell-${person.id}-${date}`}
                    data-time-off-testid={`time-off-cell-${person.id}-${date}`}
                    key={date}
                  >
                    {dateMatchesView(selectedDate, date, view) && <span className="selected-date-overlay" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" />}
                    {overlays.allocation && (
                      <span className="year-stat-layer" aria-hidden="true" data-testid={`calendar-summary-bands-${person.id}-${date}`}>
                        {yearStats.map((stat) => (
                          <span
                            className="year-project-stat"
                            data-testid={`year-project-stat-${person.id}-${stat.projectId}-${date}`}
                            key={stat.projectId}
                            style={{
                              '--project-color': projectColorMap[stat.projectId] ?? colorForProject(stat.projectId, projects),
                              '--stat-width': `${Math.max(3, stat.relativeWidth * 100)}%`,
                            } as React.CSSProperties}
                            title={`${formatDuration(stat.totalMinutes)}`}
                          />
                        ))}
                      </span>
                    )}
                    {ukHolidays.map((holiday) => (
                      <span
                        aria-hidden="true"
                        className="booking-overlay uk-holiday is-compact"
                        data-testid={`uk-holiday-overlay-${holiday.date}`}
                        key={holiday.date}
                        title={holiday.title}
                      />
                    ))}
                  </div>
                );
              }
              return (
                <button
                  aria-label={`${person.name} ${date} ${formatDuration(totalMinutes)} allocated`}
                  className={`calendar-cell calendar-summary-cell ${isSelected ? 'is-selected' : ''} ${rangeClass} ${overlays.allocation && totalMinutes > CAPACITY_MINUTES ? 'is-over' : ''} ${date < today ? 'is-past' : ''} ${dateMatchesView(selectedDate, date, view) ? 'has-selected-date' : ''}`}
                  data-testid={`calendar-cell-${person.id}-${date}`}
                  data-time-off-testid={`time-off-cell-${person.id}-${date}`}
                  key={date}
                  onClick={(event) => selectCell(cell, event)}
                  type="button"
                >
                  {dateMatchesView(selectedDate, date, view) && <span className="selected-date-overlay" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" />}
                  {overlays.allocation && (
                    <span className="allocation-segment-layer" aria-hidden="true" data-testid={`calendar-summary-bands-${person.id}-${date}`}>
                      {dayAllocations
                      .sort((a, b) => a.startMinute - b.startMinute)
                      .map((allocation) => (
                        <span
                          className={`allocation-band status-${allocation.status}`}
                          key={allocation.id}
                          style={{
                            ...compactAllocationSegmentStyle(allocation, dayAllocations),
                            '--project-color': projectColorMap[allocation.projectId] ?? colorForProject(allocation.projectId, projects),
                          } as React.CSSProperties}
                          title={`${formatDuration(durationMinutes(allocation))}`}
                        >
                          <strong>{formatDuration(durationMinutes(allocation))}</strong>
                        </span>
                      ))}
                    </span>
                  )}
                  {overlays['time-off'] && dayTimeOff.map((timeOffEntry) => (
                    <span
                      className={`time-off-overlay booking-overlay ${activeMode === 'time-off' ? 'is-selectable' : ''} ${selection.some((cell) => cell.allocationId === timeOffEntry.id) ? 'is-selected' : ''} booking-${timeOffEntry.type} status-${timeOffEntry.status} is-compact ${date < today ? 'is-past-booking' : 'is-future-booking'}`}
                      data-testid={`time-off-overlay-${timeOffEntry.type}-${timeOffEntry.status}-${person.id}-${date}`}
                      key={timeOffEntry.id}
                      onClick={(event) => activeMode === 'time-off' && onSelectTimeOffGroup([timeOffEntry], event)}
                      role={activeMode === 'time-off' ? 'button' : undefined}
                      tabIndex={activeMode === 'time-off' ? 0 : undefined}
                    />
                  ))}
                  {ukHolidays.map((holiday) => (
                    <span
                      aria-hidden="true"
                      className="booking-overlay uk-holiday is-compact"
                      data-testid={`uk-holiday-overlay-${holiday.date}`}
                      key={holiday.date}
                      title={holiday.title}
                    />
                  ))}
                </button>
              );
            })}
            {showProjectRows && isExpanded &&
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
                      const yearStats = view === 'year' ? monthlyProjectStats(allocations, person.id, date) : [];
                      const projectYearStat = yearStats.find((stat) => stat.projectId === projectId);
                      const dayAllocations = view === 'year' ? [] : mergeAdjacentAllocations(allocationsFor(allocations, person.id, date, view));
                      const projectAllocations = dayAllocations.filter((a) => a.projectId === projectId);
                      const projectDayTimeOff = bookingsFor(timeOff, person.id, date, view);
                      const ukHolidays = view === 'year' ? [] : ukBankHolidaysForDate(date, view);
                      const isSelected = selection.some((s) => sameCell(s, cell));
                      const rangeClass = selectedRangeClass(selection, cell, dates);
                      const hasAllocation = view === 'year' ? Boolean(projectYearStat) : projectAllocations.length > 0;
                      if (view === 'year') {
                        return (
                          <div
                            className={`calendar-cell calendar-project-cell calendar-year-cell ${hasAllocation ? 'has-allocation' : ''} ${date < today ? 'is-past' : ''} ${dateMatchesView(selectedDate, date, view) ? 'has-selected-date' : ''}`}
                            data-testid={`calendar-project-cell-${person.id}-${projectId}-${date}`}
                            key={date}
                            style={{ '--project-color': projectColor } as React.CSSProperties}
                          >
                            {dateMatchesView(selectedDate, date, view) && <span className="selected-date-overlay" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" />}
                            {overlays.allocation && projectYearStat && (
                              <span className="year-stat-layer year-project-row-stat" aria-hidden="true">
                                <span
                                  className="year-project-stat"
                                  data-testid={`year-project-stat-${person.id}-${projectId}-${date}`}
                                  style={{
                                    '--project-color': projectColor,
                                    '--stat-width': `${Math.max(3, projectYearStat.relativeWidth * 100)}%`,
                                  } as React.CSSProperties}
                                  title={`${formatDuration(projectYearStat.totalMinutes)} ${project?.name ?? projectId}`}
                                >
                                  <strong>{formatDuration(projectYearStat.totalMinutes)}</strong>
                                </span>
                              </span>
                            )}
                            {ukHolidays.map((holiday) => (
                              <span
                                aria-hidden="true"
                                className="booking-overlay uk-holiday is-compact"
                                data-testid={`uk-holiday-overlay-${holiday.date}`}
                                key={holiday.date}
                                title={holiday.title}
                              />
                            ))}
                          </div>
                        );
                      }
                      return (
                        <button
                          className={`calendar-cell calendar-project-cell ${isSelected ? 'is-selected' : ''} ${rangeClass} ${hasAllocation ? 'has-allocation' : ''} ${date < today ? 'is-past' : ''} ${dateMatchesView(selectedDate, date, view) ? 'has-selected-date' : ''}`}
                          data-testid={`calendar-project-cell-${person.id}-${projectId}-${date}`}
                          key={date}
                          onClick={(event) => activeMode === 'allocation' && selectCell(cell, event)}
                          style={{ '--project-color': projectColor } as React.CSSProperties}
                          type="button"
                        >
                          {dateMatchesView(selectedDate, date, view) && <span className="selected-date-overlay" data-testid={`selected-date-overlay-${selectedDate}`} aria-hidden="true" />}
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
                          {ukHolidays.map((holiday) => (
                            <span
                              aria-hidden="true"
                              className="booking-overlay uk-holiday is-compact"
                              data-testid={`uk-holiday-overlay-${holiday.date}`}
                              key={holiday.date}
                              title={holiday.title}
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

function selectedRangeClass(selection: AllocationSelectionCell[], cell: AllocationSelectionCell, dates: string[]) {
  if (!selection.some((selected) => sameCell(selected, cell))) {
    return '';
  }
  const index = dates.indexOf(cell.date);
  const previous = dates[index - 1];
  const next = dates[index + 1];
  const sameRow = (date: string | undefined) => date && selection.some((selected) => sameCell(selected, { ...cell, date }));
  const hasPrevious = Boolean(sameRow(previous));
  const hasNext = Boolean(sameRow(next));
  return [
    hasPrevious ? 'is-range-middle' : 'is-range-start',
    hasNext ? 'is-range-middle' : 'is-range-end',
  ].join(' ');
}

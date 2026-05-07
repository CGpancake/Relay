import React from 'react';
import { allocationStatusLabels, allocationStatuses } from '../data/labels';
import { addDays, datesBetween, daysInMonth, formatDate, monthLabel, shortDate, startOfMonth, startOfWeek } from '../lib/date';
import { canEditAllocation } from '../lib/permissions';
import type { Allocation, AllocationSelectionCell, AllocationStatus, AllocationView as AllocationViewMode, Person, Project, Task } from '../types';

const sameCell = (a: AllocationSelectionCell, b: AllocationSelectionCell) =>
  a.personId === b.personId && a.date === b.date && a.rowType === b.rowType && a.projectId === b.projectId;

export function CalendarView({
  allocations,
  currentUser,
  people,
  projects,
  setAllocations,
  setTasks,
  tasks,
}: {
  allocations: Allocation[];
  currentUser: Person;
  people: Person[];
  projects: Project[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
}) {
  const [view, setView] = React.useState<AllocationViewMode>('week');
  const [selectedDate, setSelectedDate] = React.useState('2026-05-05');
  const [selection, setSelection] = React.useState<AllocationSelectionCell[]>([]);
  const [anchor, setAnchor] = React.useState<AllocationSelectionCell | null>(null);
  const [editProjectId, setEditProjectId] = React.useState(projects[0]?.id ?? '');
  const [editHours, setEditHours] = React.useState(4);
  const [editStatus, setEditStatus] = React.useState<AllocationStatus>('planned');
  const [editNotes, setEditNotes] = React.useState('');
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);
  const [expandedPeople, setExpandedPeople] = React.useState<Set<string>>(() => new Set());
  const editable = canEditAllocation(currentUser);
  const dates = React.useMemo(() => datesForView(view, selectedDate), [selectedDate, view]);
  const visiblePeople = people;
  const projectTasks = React.useMemo(() => tasks.filter((task) => task.projectId === editProjectId), [editProjectId, tasks]);
  const allSelectionProjectRows = selection.length > 0 && selection.every((cell) => cell.rowType === 'project' && cell.projectId);
  const browserToday = React.useMemo(() => formatDate(new Date()), []);

  React.useEffect(() => {
    const personIds = new Set(people.map((person) => person.id));
    setExpandedPeople((current) => new Set([...current].filter((personId) => personIds.has(personId))));
  }, [people]);

  React.useEffect(() => {
    setSelectedTaskIds((current) => current.filter((taskId) => projectTasks.some((task) => task.id === taskId)));
  }, [projectTasks]);

  React.useEffect(() => {
    if (!projects.some((project) => project.id === editProjectId)) {
      setEditProjectId(projects[0]?.id ?? '');
    }
  }, [editProjectId, projects]);

  const selectCell = (cell: AllocationSelectionCell, event: React.MouseEvent) => {
    if (event.shiftKey && anchor && anchor.personId === cell.personId && anchor.rowType === cell.rowType && anchor.projectId === cell.projectId) {
      const range = datesBetween(anchor.date, cell.date).map((date) => ({ ...cell, date }));
      setSelection(range);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      setSelection((current) =>
        current.some((selected) => sameCell(selected, cell))
          ? current.filter((selected) => !sameCell(selected, cell))
          : [...current, cell],
      );
      setAnchor(cell);
      return;
    }

    setSelection([cell]);
    setAnchor(cell);
  };

  const applyAllocation = () => {
    if (!editable || selection.length === 0) {
      return;
    }

    const selectedCells = [...selection];
    setAllocations((current) => {
      const selectedKeys = new Set(selectedCells.map((cell) => `${cell.personId}:${cell.date}:${cell.projectId ?? editProjectId}`));
      const retained = current.filter((allocation) => !selectedKeys.has(`${allocation.personId}:${allocation.date}:${allocation.projectId}`));
      const additions = selectedCells.map((cell, index) => ({
        id: `alloc-local-${Date.now()}-${index}`,
        personId: cell.personId,
        projectId: cell.projectId ?? editProjectId,
        date: cell.date,
        hours: editHours,
        status: editStatus,
        notes: editNotes,
      }));
      return [...retained, ...additions];
    });

    if (selectedTaskIds.length > 0) {
      const latestDate = selectedCells.map((cell) => cell.date).sort().at(-1);
      if (latestDate) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            selectedTaskIds.includes(task.id) && task.projectId === editProjectId ? { ...task, dueDate: latestDate } : task,
          ),
        );
      }
    }
  };

  const toggleExpanded = (personId: string) => {
    setExpandedPeople((current) => {
      const next = new Set(current);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  };

  const toggleTaskAttachment = (taskId: string) => {
    setSelectedTaskIds((current) => (current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]));
  };

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Allocation</p>
          <h1>allocation planner</h1>
        </div>
        <div className="header-stats">
          <span>{selection.length} selected</span>
          <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>

      <section className="calendar-layout">
        <div className="toolbar calendar-toolbar">
          {(['day', 'week', 'month', 'year'] as AllocationViewMode[]).map((mode) => (
            <button className={view === mode ? 'is-active' : ''} key={mode} onClick={() => setView(mode)} type="button">
              {mode}
            </button>
          ))}
          <input aria-label="Selected date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>
        <div className="calendar-timeline" data-testid="calendar-timeline">
          <div className={`calendar-grid calendar-${view}`} style={{ '--calendar-columns': dates.length } as React.CSSProperties}>
            <div className="calendar-corner">person</div>
            {dates.map((date) => (
              <div className={`calendar-date ${date < browserToday ? 'is-past' : ''}`} key={date}>
                {view === 'year' ? monthLabel(date) : shortDate(date)}
              </div>
            ))}
            {visiblePeople.map((person) => {
              const isExpanded = expandedPeople.has(person.id);
              const visibleProjectIds = projects
                .filter((project) =>
                  allocations.some(
                    (allocation) =>
                      allocation.personId === person.id &&
                      allocation.projectId === project.id &&
                      dates.some((date) => dateMatchesView(allocation.date, date, view)),
                  ),
                )
                .map((project) => project.id);
              const projectColorMap = projectColorsFor(visibleProjectIds);

              return (
                <React.Fragment key={person.id}>
                  <div className="calendar-person calendar-summary-person" data-testid={`calendar-summary-row-${person.id}`}>
                    <button
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${person.name}`}
                      className="expand-button"
                      onClick={() => toggleExpanded(person.id)}
                      type="button"
                    >
                      {isExpanded ? '-' : '+'}
                    </button>
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.discipline} / {person.role}</small>
                    </span>
                  </div>
                  {dates.map((date) => {
                    const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'summary' };
                    const totalHours = totalHoursFor(allocations, person.id, date, view);
                    const selected = selection.some((selectionCell) => sameCell(selectionCell, cell));

                    return (
                      <button
                        className={`calendar-cell calendar-summary-cell ${selected ? 'is-selected' : ''} ${totalHours > 8 ? 'is-over' : ''} ${date < browserToday ? 'is-past' : ''}`}
                        data-testid={`calendar-cell-${person.id}-${date}`}
                        key={date}
                        onClick={(event) => selectCell(cell, event)}
                      type="button"
                    >
                        <span className="utilization-stack" aria-hidden="true" data-testid={`calendar-utilization-${person.id}-${date}`}>
                          {allocationsByProject(allocations, person.id, date, view).map(({ projectId, hours }) => (
                            <span
                              className="utilization-segment"
                              key={projectId}
                              style={
                                {
                                  '--project-color': projectColorMap[projectId] ?? colorForProject(projectId, projects),
                                  '--segment-share': `${Math.max(5, Math.min(100, (hours / Math.max(totalHours, 1)) * 100))}%`,
                                } as React.CSSProperties
                              }
                            />
                          ))}
                        </span>
                        <span className="summary-hours" data-testid={`calendar-total-${person.id}-${date}`}>
                          {totalHours ? `${totalHours}h` : ''}
                        </span>
                      </button>
                    );
                  })}
                  {isExpanded &&
                    visibleProjectIds.map((projectId) => {
                      const project = projects.find((candidate) => candidate.id === projectId);
                      const projectColor = projectColorMap[projectId] ?? colorForProject(projectId, projects);
                      return (
                        <React.Fragment key={`${person.id}-${projectId}`}>
                          <div
                            className="calendar-person calendar-project-person"
                            data-testid={`calendar-project-row-${person.id}-${projectId}`}
                            style={{ '--project-color': projectColor } as React.CSSProperties}
                          >
                            <span>{project?.name}</span>
                          </div>
                          {dates.map((date) => {
                            const cell: AllocationSelectionCell = { personId: person.id, date, rowType: 'project', projectId };
                            const projectAllocations = allocations.filter(
                              (allocation) =>
                                allocation.personId === person.id &&
                                allocation.projectId === projectId &&
                                dateMatchesView(allocation.date, date, view),
                            );
                            const projectHours = projectAllocations.reduce((sum, allocation) => sum + allocation.hours, 0);
                            const selected = selection.some((selectionCell) => sameCell(selectionCell, cell));
                            const hasAllocation = projectAllocations.length > 0;
                            const previousHasAllocation = dates[dates.indexOf(date) - 1]
                              ? allocations.some(
                                  (allocation) =>
                                    allocation.personId === person.id &&
                                    allocation.projectId === projectId &&
                                    dateMatchesView(allocation.date, dates[dates.indexOf(date) - 1], view),
                                )
                              : false;
                            const nextHasAllocation = dates[dates.indexOf(date) + 1]
                              ? allocations.some(
                                  (allocation) =>
                                    allocation.personId === person.id &&
                                    allocation.projectId === projectId &&
                                    dateMatchesView(allocation.date, dates[dates.indexOf(date) + 1], view),
                                )
                              : false;

                            return (
                              <button
                                className={`calendar-cell calendar-project-cell ${selected ? 'is-selected' : ''} ${hasAllocation ? 'has-allocation' : ''} ${previousHasAllocation ? 'connects-left' : ''} ${nextHasAllocation ? 'connects-right' : ''} ${date < browserToday ? 'is-past' : ''}`}
                                data-testid={`calendar-project-cell-${person.id}-${projectId}-${date}`}
                                key={date}
                                onClick={(event) => selectCell(cell, event)}
                                style={{ '--project-color': projectColor } as React.CSSProperties}
                                type="button"
                              >
                                {hasAllocation && (
                                  <span className={`allocation-band status-${dominantStatus(projectAllocations)}`}>
                                    <span>{project?.name}</span>
                                    {' '}
                                    <strong>{projectHours}h</strong>
                                  </span>
                                )}
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
        </div>
        <aside className="allocation-editor" aria-label="Allocation editor">
          <h2>selected cells</h2>
          <p data-testid="selection-count">{selection.length} selected</p>
          <label className={allSelectionProjectRows ? 'is-muted' : ''}>
            Project
            <select
              value={editProjectId}
              onChange={(event) => {
                setEditProjectId(event.target.value);
                setSelectedTaskIds([]);
              }}
              disabled={!editable || allSelectionProjectRows}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {allSelectionProjectRows && <small>Using selected project rows</small>}
          </label>
          <label>
            Hours
            <input min="0" max="16" step="0.5" type="number" value={editHours} onChange={(event) => setEditHours(Number(event.target.value))} disabled={!editable} />
          </label>
          <label>
            Status
            <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as AllocationStatus)} disabled={!editable}>
              {allocationStatuses.map((status) => (
                <option key={status} value={status}>
                  {allocationStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notes
            <textarea value={editNotes} onChange={(event) => setEditNotes(event.target.value)} disabled={!editable} />
          </label>
          <section className="task-attachment" aria-label="Attach tasks">
            <h2>attach tasks</h2>
            <p data-testid="attached-task-count">{selectedTaskIds.length} attached</p>
            <div className="task-attachment-list">
              {projectTasks.length === 0 ? (
                <p>No tasks for this project</p>
              ) : (
                projectTasks.map((task) => (
                  <label key={task.id} className="task-attachment-row">
                    <input
                      checked={selectedTaskIds.includes(task.id)}
                      disabled={!editable}
                      onChange={() => toggleTaskAttachment(task.id)}
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
          <button className="primary-action" disabled={!editable || selection.length === 0} onClick={applyAllocation} type="button">
            Apply allocation
          </button>
          {!editable && <p className="access-note">Allocation editing is limited to admins and managers.</p>}
        </aside>
      </section>
    </>
  );
}

function datesForView(view: AllocationViewMode, selectedDate: string) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  if (view === 'day') {
    return [selectedDate];
  }
  if (view === 'week') {
    const start = startOfWeek(selected);
    return Array.from({ length: 7 }, (_, index) => formatDate(addDays(start, index)));
  }
  if (view === 'month') {
    const start = startOfMonth(selected);
    return Array.from({ length: daysInMonth(selected) }, (_, index) => formatDate(addDays(start, index)));
  }
  return Array.from({ length: 12 }, (_, index) => formatDate(new Date(selected.getFullYear(), index, 1)));
}

function dateMatchesView(allocationDate: string, date: string, view: AllocationViewMode) {
  return view === 'year' ? allocationDate.startsWith(date.slice(0, 7)) : allocationDate === date;
}

function totalHoursFor(allocations: Allocation[], personId: string, date: string, view: AllocationViewMode) {
  return allocations
    .filter((allocation) => allocation.personId === personId && dateMatchesView(allocation.date, date, view))
    .reduce((sum, allocation) => sum + allocation.hours, 0);
}

function allocationsByProject(allocations: Allocation[], personId: string, date: string, view: AllocationViewMode) {
  const totals = allocations
    .filter((allocation) => allocation.personId === personId && dateMatchesView(allocation.date, date, view))
    .reduce<Record<string, number>>((groups, allocation) => {
      groups[allocation.projectId] = (groups[allocation.projectId] ?? 0) + allocation.hours;
      return groups;
    }, {});

  return Object.entries(totals).map(([projectId, hours]) => ({ projectId, hours }));
}

function dominantStatus(allocations: Allocation[]) {
  return allocations[0]?.status ?? 'planned';
}

const projectColorPalette = ['#E6B450', '#6CB6FF', '#7FD88F', '#F37C9B', '#B493FF', '#4CC7C7', '#F59E5C', '#8BD450'];

function colorForProject(projectId: string, projects: Project[]) {
  const index = projects.findIndex((project) => project.id === projectId);
  return projectColorPalette[Math.max(0, index) % projectColorPalette.length];
}

function projectColorsFor(projectIds: string[]) {
  return projectIds.reduce<Record<string, string>>((colors, projectId, index) => {
    colors[projectId] = projectColorPalette[index % projectColorPalette.length];
    return colors;
  }, {});
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, ChevronRight, Circle, PanelRightClose, RotateCcw, Search, Settings } from 'lucide-react';
import './styles.css';

type TaskStatus = 'todo' | 'wip' | 'review' | 'blocked' | 'done';
type TaskPhase = 'brief' | 'layout' | 'animation' | 'lighting' | 'delivery';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  phase: TaskPhase;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  description: string;
  subtasks: Subtask[];
};

type Project = {
  id: string;
  name: string;
};

type Filters = {
  project: string;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
  search: string;
};

const RELAY_STORAGE_KEY = 'relay:first-slice:ephemeral';
const THEME_STORAGE_KEY = 'relay:theme';

const themeOptions = [
  { id: 'theme-relay-brutalist', label: 'Relay Brutalist' },
  { id: 'theme-nord', label: 'Nord' },
  { id: 'theme-dracula', label: 'Dracula' },
  { id: 'theme-gruvbox-dark', label: 'Gruvbox Dark' },
  { id: 'theme-solarized-dark', label: 'Solarized Dark' },
  { id: 'theme-tokyo-night', label: 'Tokyo Night' },
  { id: 'theme-catppuccin-mocha', label: 'Catppuccin Mocha' },
] as const;

type ThemeId = (typeof themeOptions)[number]['id'];

const defaultTheme: ThemeId = 'theme-relay-brutalist';

const isThemeId = (value: string | null): value is ThemeId => themeOptions.some((theme) => theme.id === value);

const projects: Project[] = [
  { id: 'harbor-station', name: 'Harbor Station Launch Film' },
];

const statuses: TaskStatus[] = ['todo', 'wip', 'review', 'blocked', 'done'];
const phases: TaskPhase[] = ['brief', 'layout', 'animation', 'lighting', 'delivery'];
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  wip: 'WIP',
  review: 'Review',
  blocked: 'Blocked',
  done: 'Done',
};

const phaseLabels: Record<TaskPhase, string> = {
  brief: 'Brief',
  layout: 'Layout',
  animation: 'Animation',
  lighting: 'Lighting',
  delivery: 'Delivery',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const createSeedTasks = (): Task[] => [
  {
    id: 'task-001',
    projectId: 'harbor-station',
    title: 'Lock launch film brief',
    status: 'done',
    phase: 'brief',
    priority: 'high',
    dueDate: '2026-05-03',
    assignee: 'Mina',
    description: 'Confirm the approved story beats, delivery targets, and client review cadence.',
    subtasks: [
      { id: 'task-001-a', title: 'Collect client notes', done: true },
      { id: 'task-001-b', title: 'Publish final brief PDF', done: true },
    ],
  },
  {
    id: 'task-002',
    projectId: 'harbor-station',
    title: 'Block camera path for opening flythrough',
    status: 'wip',
    phase: 'layout',
    priority: 'urgent',
    dueDate: '2026-05-06',
    assignee: 'Theo',
    description: 'Create a clean camera pass through the concourse with timing markers for edit.',
    subtasks: [
      { id: 'task-002-a', title: 'Set camera spline', done: true },
      { id: 'task-002-b', title: 'Add timing markers', done: false },
      { id: 'task-002-c', title: 'Export playblast', done: false },
    ],
  },
  {
    id: 'task-003',
    projectId: 'harbor-station',
    title: 'Prep crowd layout proxy pass',
    status: 'todo',
    phase: 'layout',
    priority: 'medium',
    dueDate: '2026-05-08',
    assignee: 'Ari',
    description: 'Place readable low-density crowd proxies without competing with hero signage.',
    subtasks: [
      { id: 'task-003-a', title: 'Import proxy rigs', done: false },
      { id: 'task-003-b', title: 'Rough in platform clusters', done: false },
    ],
  },
  {
    id: 'task-004',
    projectId: 'harbor-station',
    title: 'Animate departure board reveal',
    status: 'review',
    phase: 'animation',
    priority: 'high',
    dueDate: '2026-05-07',
    assignee: 'Jules',
    description: 'Polish the board flip timing and send a version for supervisor review.',
    subtasks: [
      { id: 'task-004-a', title: 'Ease flip timing', done: true },
      { id: 'task-004-b', title: 'Submit viewport capture', done: true },
      { id: 'task-004-c', title: 'Address first review note', done: false },
    ],
  },
  {
    id: 'task-005',
    projectId: 'harbor-station',
    title: 'Resolve glass shader artifacts',
    status: 'blocked',
    phase: 'lighting',
    priority: 'urgent',
    dueDate: '2026-05-05',
    assignee: 'Nina',
    description: 'Track down flickering reflections on the roof panels before lighting final.',
    subtasks: [
      { id: 'task-005-a', title: 'Reproduce in render wedge', done: true },
      { id: 'task-005-b', title: 'Request latest material cache', done: false },
      { id: 'task-005-c', title: 'Validate fixed shader', done: false },
    ],
  },
  {
    id: 'task-006',
    projectId: 'harbor-station',
    title: 'Set golden-hour lighting base',
    status: 'wip',
    phase: 'lighting',
    priority: 'high',
    dueDate: '2026-05-09',
    assignee: 'Nina',
    description: 'Build the first lighting pass for the atrium and platform hero angles.',
    subtasks: [
      { id: 'task-006-a', title: 'Balance exterior sun', done: true },
      { id: 'task-006-b', title: 'Tune interior practicals', done: false },
      { id: 'task-006-c', title: 'Render contact sheet', done: false },
    ],
  },
  {
    id: 'task-007',
    projectId: 'harbor-station',
    title: 'Assemble editorial review packet',
    status: 'todo',
    phase: 'delivery',
    priority: 'medium',
    dueDate: '2026-05-12',
    assignee: 'Mina',
    description: 'Prepare the first browser-friendly packet for internal editorial review.',
    subtasks: [
      { id: 'task-007-a', title: 'Collect latest playblasts', done: false },
      { id: 'task-007-b', title: 'Add slate and frame range labels', done: false },
    ],
  },
  {
    id: 'task-008',
    projectId: 'harbor-station',
    title: 'Review signage placement pass',
    status: 'review',
    phase: 'layout',
    priority: 'medium',
    dueDate: '2026-05-06',
    assignee: 'Ari',
    description: 'Confirm wayfinding and brand signage are readable in approved camera angles.',
    subtasks: [
      { id: 'task-008-a', title: 'Check camera one', done: true },
      { id: 'task-008-b', title: 'Check camera two', done: false },
    ],
  },
  {
    id: 'task-009',
    projectId: 'harbor-station',
    title: 'Publish internal delivery notes',
    status: 'done',
    phase: 'delivery',
    priority: 'low',
    dueDate: '2026-05-02',
    assignee: 'Jules',
    description: 'Document naming, review locations, and temporary export conventions.',
    subtasks: [
      { id: 'task-009-a', title: 'Write export checklist', done: true },
      { id: 'task-009-b', title: 'Share with production', done: true },
    ],
  },
  {
    id: 'task-010',
    projectId: 'harbor-station',
    title: 'Create train door timing polish pass',
    status: 'wip',
    phase: 'animation',
    priority: 'high',
    dueDate: '2026-05-10',
    assignee: 'Theo',
    description: 'Match train door movement to the edit and remove mechanical jitter.',
    subtasks: [
      { id: 'task-010-a', title: 'Compare against edit timing', done: false },
      { id: 'task-010-b', title: 'Polish left-side doors', done: false },
      { id: 'task-010-c', title: 'Polish right-side doors', done: false },
    ],
  },
];

const progressFor = (task: Task) => {
  const done = task.subtasks.filter((subtask) => subtask.done).length;
  return { done, total: task.subtasks.length };
};

const matchesFilters = (task: Task, filters: Filters) => {
  const query = filters.search.trim().toLowerCase();
  const projectMatches = filters.project === 'all' || task.projectId === filters.project;
  const statusMatches = filters.status === 'all' || task.status === filters.status;
  const phaseMatches = filters.phase === 'all' || task.phase === filters.phase;
  const searchMatches =
    query.length === 0 ||
    task.title.toLowerCase().includes(query) ||
    task.assignee.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query);

  return projectMatches && statusMatches && phaseMatches && searchMatches;
};

function App() {
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    localStorage.setItem(RELAY_STORAGE_KEY, 'seed-reset-on-load');
    return createSeedTasks();
  });
  const [theme, setTheme] = React.useState<ThemeId>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(savedTheme) ? savedTheme : defaultTheme;
  });
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsRef = React.useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = React.useState<Filters>({
    project: 'all',
    status: 'all',
    phase: 'all',
    search: '',
  });
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (window.location.pathname !== '/tasks') {
      window.history.replaceState(null, '', '/tasks');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const filteredTasks = React.useMemo(() => tasks.filter((task) => matchesFilters(task, filters)), [tasks, filters]);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const updateTask = (taskId: string, updater: (task: Task) => Task) => {
    setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? updater(task) : task)));
  };

  const setTaskComplete = (taskId: string, complete: boolean) => {
    updateTask(taskId, (task) => ({
      ...task,
      status: complete ? 'done' : 'wip',
      subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: complete ? true : subtask.done })),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    updateTask(taskId, (task) => {
      const subtasks = task.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
      );
      const allDone = subtasks.length > 0 && subtasks.every((subtask) => subtask.done);
      return {
        ...task,
        status: allDone ? 'done' : task.status === 'done' ? 'wip' : task.status,
        subtasks,
      };
    });
  };

  return (
    <main className={`relay-shell ${theme}`}>
      <header className="topbar">
        <div>
          <p className="route-label">Relay / Tasks</p>
          <h1>Relay Task Board</h1>
        </div>
        <div className="topbar-tools">
          <div className="topbar-meta">
            <span>{filteredTasks.length} visible</span>
            <span>{tasks.length} seeded</span>
          </div>
          <div className="settings-menu" ref={settingsRef}>
            <button
              aria-expanded={settingsOpen}
              aria-label="Open settings"
              className="icon-button settings-trigger"
              onClick={() => setSettingsOpen((open) => !open)}
              type="button"
            >
              <Settings size={18} aria-hidden="true" />
            </button>
            {settingsOpen && (
              <div className="settings-popover" role="menu">
                <label>
                  Theme
                  <select
                    aria-label="Theme"
                    value={theme}
                    onChange={(event) => setTheme(event.target.value as ThemeId)}
                  >
                    {themeOptions.map((themeOption) => (
                      <option key={themeOption.id} value={themeOption.id}>
                        {themeOption.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="filters" aria-label="Task filters">
        <label>
          Project
          <select
            value={filters.project}
            onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as Filters['status'] }))}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phase
          <select
            value={filters.phase}
            onChange={(event) => setFilters((current) => ({ ...current, phase: event.target.value as Filters['phase'] }))}
          >
            <option value="all">All phases</option>
            {phases.map((phase) => (
              <option key={phase} value={phase}>
                {phaseLabels[phase]}
              </option>
            ))}
          </select>
        </label>
        <label className="search-field">
          Search
          <span>
            <Search size={16} aria-hidden="true" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Title, owner, notes"
              type="search"
            />
          </span>
        </label>
      </section>

      <section className="task-table" aria-label="Relay task table">
        <div className="table-header" role="row">
          <span>Done</span>
          <span>Title</span>
          <span>Status</span>
          <span>Phase</span>
          <span>Priority</span>
          <span>Due</span>
          <span>Assignee</span>
          <span>Subtasks</span>
        </div>

        {statuses.map((status) => {
          const groupTasks = filteredTasks.filter((task) => task.status === status);
          return (
            <section className="status-group" key={status} data-testid={`group-${status}`}>
              <h2>
                <span>{statusLabels[status]}</span>
                <span>{groupTasks.length}</span>
              </h2>
              {groupTasks.length === 0 ? (
                <p className="empty-row">No matching tasks</p>
              ) : (
                groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    selected={task.id === selectedTaskId}
                    onOpen={() => setSelectedTaskId(task.id)}
                    onComplete={(complete) => setTaskComplete(task.id, complete)}
                  />
                ))
              )}
            </section>
          );
        })}
      </section>

      <TaskPane
        task={selectedTask}
        projectName={projects.find((project) => project.id === selectedTask?.projectId)?.name ?? ''}
        onClose={() => setSelectedTaskId(null)}
        onComplete={(complete) => selectedTask && setTaskComplete(selectedTask.id, complete)}
        onToggleSubtask={(subtaskId) => selectedTask && toggleSubtask(selectedTask.id, subtaskId)}
      />
    </main>
  );
}

function TaskRow({
  task,
  selected,
  onOpen,
  onComplete,
}: {
  task: Task;
  selected: boolean;
  onOpen: () => void;
  onComplete: (complete: boolean) => void;
}) {
  const progress = progressFor(task);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);

  return (
    <button
      className={`task-row ${selected ? 'is-selected' : ''}`}
      data-testid={`task-row-${task.id}`}
      onClick={onOpen}
      type="button"
    >
      <span className="check-cell" onClick={(event) => event.stopPropagation()}>
        <input
          aria-label={`Complete ${task.title}`}
          checked={task.status === 'done'}
          onChange={(event) => onComplete(event.target.checked)}
          type="checkbox"
        />
      </span>
      <span className="title-cell">
        <strong>{task.title}</strong>
        <small>{task.description}</small>
      </span>
      <span className={`pill status-${task.status}`}>{statusLabels[task.status]}</span>
      <span>{phaseLabels[task.phase]}</span>
      <span className={`priority priority-${task.priority}`}>{priorityLabels[task.priority]}</span>
      <span>{task.dueDate}</span>
      <span>{task.assignee}</span>
      <span className="progress-cell" data-testid={`progress-${task.id}`}>
        <span>{progress.done}/{progress.total}</span>
        <span className="progress-track" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </span>
      </span>
      <ChevronRight className="row-chevron" size={16} aria-hidden="true" />
    </button>
  );
}

function TaskPane({
  task,
  projectName,
  onClose,
  onComplete,
  onToggleSubtask,
}: {
  task: Task | null;
  projectName: string;
  onClose: () => void;
  onComplete: (complete: boolean) => void;
  onToggleSubtask: (subtaskId: string) => void;
}) {
  const progress = task ? progressFor(task) : { done: 0, total: 0 };

  return (
    <>
      <div className={`pane-scrim ${task ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`task-pane ${task ? 'is-open' : ''}`} aria-label="Task pane" data-testid="task-pane">
        {task && (
          <>
            <header className="pane-header">
              <button aria-label="Close task pane" className="icon-button" onClick={onClose} type="button">
                <PanelRightClose size={18} aria-hidden="true" />
              </button>
              <div>
                <p>{projectName}</p>
                <h2>{task.title}</h2>
              </div>
            </header>

            <div className="pane-actions">
              {task.status === 'done' ? (
                <button className="secondary-action" onClick={() => onComplete(false)} type="button">
                  <RotateCcw size={16} aria-hidden="true" />
                  Undo to WIP
                </button>
              ) : (
                <button className="primary-action" onClick={() => onComplete(true)} type="button">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Mark complete
                </button>
              )}
            </div>

            <dl className="pane-meta">
              <div>
                <dt>Status</dt>
                <dd className={`pill status-${task.status}`}>{statusLabels[task.status]}</dd>
              </div>
              <div>
                <dt>Phase</dt>
                <dd>{phaseLabels[task.phase]}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd className={`priority priority-${task.priority}`}>{priorityLabels[task.priority]}</dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>{task.dueDate}</dd>
              </div>
              <div>
                <dt>Assignee</dt>
                <dd>{task.assignee}</dd>
              </div>
            </dl>

            <section className="pane-section">
              <h3>Details</h3>
              <p>{task.description}</p>
            </section>

            <section className="pane-section">
              <div className="section-title">
                <h3>Subtasks</h3>
                <span data-testid="pane-progress">{progress.done}/{progress.total}</span>
              </div>
              <div className="subtasks">
                {task.subtasks.map((subtask) => (
                  <label key={subtask.id} className="subtask">
                    <input
                      checked={subtask.done}
                      data-testid={`subtask-${subtask.id}`}
                      onChange={() => onToggleSubtask(subtask.id)}
                      type="checkbox"
                    />
                    {subtask.done ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                    <span>{subtask.title}</span>
                  </label>
                ))}
              </div>
            </section>
          </>
        )}
      </aside>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import React from 'react';
import {
  Archive,
  Bold,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Maximize2,
  PanelRightClose,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { phases, phaseLabels, priorities, priorityLabels, statusLabels, statuses } from '../data/labels';
import { canEditTask } from '../lib/permissions';
import { progressFor } from '../lib/tasks';
import type { Person, Project, Task, TaskPhase, TaskPriority, TaskStatus } from '../types';

type Filters = {
  user: string;
  project: string;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
  priority: 'all' | TaskPriority;
  search: string;
};

const matchesFilters = (task: Task, filters: Filters, currentUser: Person) => {
  const query = filters.search.trim().toLowerCase();
  const userMatches = filters.user === 'all' || task.assignee === filters.user;
  const projectMatches = filters.project === 'all' || task.projectId === filters.project;
  const statusMatches = filters.status === 'all' || task.status === filters.status;
  const phaseMatches = filters.phase === 'all' || task.phase === filters.phase;
  const priorityMatches = filters.priority === 'all' || task.priority === filters.priority;
  const clientMatches = currentUser.permissionLevel !== 'Client' || task.clientVisible;
  const searchMatches =
    query.length === 0 ||
    task.title.toLowerCase().includes(query) ||
    task.assignee.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query);

  return userMatches && projectMatches && statusMatches && phaseMatches && priorityMatches && clientMatches && searchMatches;
};

export function TaskView({
  currentUser,
  people,
  projects,
  tasks,
  setTasks,
  onArchiveTask,
  onArchiveSubtask,
  onTaskUpdated,
}: {
  currentUser: Person;
  people: Person[];
  projects: Project[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onArchiveTask: (taskId: string, message?: string) => void;
  onArchiveSubtask: (taskId: string, subtaskId: string) => void;
  onTaskUpdated: (task: Task, message: string) => void;
}) {
  const [filters, setFilters] = React.useState<Filters>({
    user: currentUser.name,
    project: 'all',
    status: 'all',
    phase: 'all',
    priority: 'all',
    search: '',
  });
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([]);
  const [selectedSubtask, setSelectedSubtask] = React.useState<{ taskId: string; subtaskId: string } | null>(null);
  const [rangeAnchorTaskId, setRangeAnchorTaskId] = React.useState<string | null>(null);
  const [paneWidths, setPaneWidths] = React.useState<Record<string, number>>({});
  const [contextMenu, setContextMenu] = React.useState<{ taskId: string; x: number; y: number } | null>(null);

  React.useEffect(() => {
    setFilters((current) => ({ ...current, user: currentUser.name }));
    setSelectedTaskIds([]);
    setRangeAnchorTaskId(null);
  }, [currentUser.name]);

  const filteredTasks = React.useMemo(
    () => tasks.filter((task) => matchesFilters(task, filters, currentUser)),
    [currentUser, filters, tasks],
  );
  const filteredTaskIds = filteredTasks.map((task) => task.id);
  const selectedTasks = selectedTaskIds.map((taskId) => tasks.find((task) => task.id === taskId)).filter((task): task is Task => Boolean(task));

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select')) {
        return;
      }
      if (selectedSubtask) {
        event.preventDefault();
        onArchiveSubtask(selectedSubtask.taskId, selectedSubtask.subtaskId);
        setSelectedSubtask(null);
        return;
      }
      if (selectedTaskIds.length > 0) {
        event.preventDefault();
        selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Task deleted'));
        setSelectedTaskIds([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onArchiveSubtask, onArchiveTask, selectedSubtask, selectedTaskIds]);

  const updateTask = (taskId: string, updater: (task: Task) => Task) => {
    setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? updater(task) : task)));
  };

  const setTaskComplete = (taskId: string, complete: boolean) => {
    updateTask(taskId, (task) => {
      const status: TaskStatus = complete ? 'done' : 'wip';
      const next = {
        ...task,
        status,
        subtasks: task.subtasks.map((subtask) => ({ ...subtask, done: complete ? true : subtask.done })),
      };
      onTaskUpdated(next, `Status changed to ${statusLabels[next.status]}: ${next.title}`);
      return next;
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    updateTask(taskId, (task) => {
      const subtasks = task.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
      );
      const allDone = subtasks.length > 0 && subtasks.every((subtask) => subtask.done);
      const status: TaskStatus = allDone ? 'done' : task.status === 'done' ? 'wip' : task.status;
      const next = {
        ...task,
        status,
        subtasks,
      };
      const subtask = subtasks.find((candidate) => candidate.id === subtaskId);
      onTaskUpdated(next, `Subtask ${subtask?.done ? 'completed' : 'reopened'}: ${subtask?.title ?? next.title}`);
      return next;
    });
  };

  const addSubtask = (taskId: string, title: string) => {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return;
    }
    updateTask(taskId, (task) => {
      const status: TaskStatus = task.status === 'done' ? 'wip' : task.status;
      const next = {
        ...task,
        status,
        subtasks: [...task.subtasks, { id: `${task.id}-subtask-${task.subtasks.length + 1}`, title: trimmed, done: false }],
      };
      onTaskUpdated(next, `Subtask added: ${trimmed}`);
      return next;
    });
  };

  const addComment = (taskId: string, body: string, versionId: string) => {
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      return;
    }
    updateTask(taskId, (task) => {
      const next = {
        ...task,
        comments: [
          ...task.comments,
          {
            id: `${task.id}-comment-${task.comments.length + 1}`,
            author: currentUser.name,
            date: new Date().toISOString().slice(0, 10),
            versionId,
            body: trimmed,
          },
        ],
      };
      onTaskUpdated(next, `Comment added: ${next.title}`);
      return next;
    });
  };

  const updateTaskField = <K extends 'status' | 'phase' | 'priority' | 'assignee'>(taskId: string, field: K, value: Task[K]) => {
    updateTask(taskId, (task) => {
      const next = {
        ...task,
        [field]: value,
        followers: field === 'assignee' ? [...new Set([...task.followers, String(value)])] : task.followers,
      };
      onTaskUpdated(next, `${field} changed: ${next.title}`);
      return next;
    });
  };

  const toggleFollow = (taskId: string) => {
    updateTask(taskId, (task) => ({
      ...task,
      followers: task.followers.includes(currentUser.name)
        ? task.followers.filter((follower) => follower !== currentUser.name)
        : [...task.followers, currentUser.name],
    }));
  };

  const openTask = (taskId: string, event: React.MouseEvent) => {
    setSelectedTaskIds((current) => {
      if (event.shiftKey && rangeAnchorTaskId) {
        const anchorIndex = filteredTaskIds.indexOf(rangeAnchorTaskId);
        const taskIndex = filteredTaskIds.indexOf(taskId);
        if (anchorIndex >= 0 && taskIndex >= 0) {
          const [start, end] = [anchorIndex, taskIndex].sort((a, b) => a - b);
          return limitOpenPanes(filteredTaskIds.slice(start, end + 1));
        }
      }

      if (event.ctrlKey || event.metaKey) {
        const next = current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId];
        return limitOpenPanes(next);
      }

      return [taskId];
    });
    setRangeAnchorTaskId(taskId);
  };

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Tasks</p>
          <h1>task board</h1>
        </div>
        <div className="header-stats">
          <span>{filteredTasks.length} visible</span>
            <span>{tasks.length} seeded</span>
            <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>

      <section className="toolbar selection-toolbar" aria-label="Task actions">
        <button disabled={selectedTaskIds.length === 0} onClick={() => selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Task deleted'))} type="button">
          <Trash2 size={14} aria-hidden="true" />
          Delete
        </button>
        <button disabled={selectedTaskIds.length === 0} onClick={() => selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Task archived'))} type="button">
          <Archive size={14} aria-hidden="true" />
          Archive
        </button>
      </section>

      <section className="filters" aria-label="Task filters">
        <label>
          User
          <select value={filters.user} onChange={(event) => setFilters((current) => ({ ...current, user: event.target.value }))}>
            <option value="all">All users</option>
            {people.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select value={filters.project} onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}>
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
        <label>
          Priority
          <select
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value as Filters['priority'] }))}
          >
            <option value="all">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="search-field">
          Search
          <span>
            <Search size={14} aria-hidden="true" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="title, owner, notes"
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
                    currentUser={currentUser}
                    key={task.id}
                    onComplete={(complete) => setTaskComplete(task.id, complete)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setSelectedTaskIds([task.id]);
                      setContextMenu({ taskId: task.id, x: event.clientX, y: event.clientY });
                    }}
                    onOpen={(event) => openTask(task.id, event)}
                    selected={selectedTaskIds.includes(task.id)}
                    task={task}
                  />
                ))
              )}
            </section>
          );
        })}
      </section>

      {selectedTasks.map((task, index) => (
        <TaskPane
          currentUser={currentUser}
          key={task.id}
          onArchiveSubtask={(subtaskId) => {
            onArchiveSubtask(task.id, subtaskId);
            setSelectedSubtask(null);
          }}
          onAddComment={(body, versionId) => addComment(task.id, body, versionId)}
          onAddSubtask={(title) => addSubtask(task.id, title)}
          onClose={() => setSelectedTaskIds((current) => current.filter((taskId) => taskId !== task.id))}
          onComplete={(complete) => setTaskComplete(task.id, complete)}
          onResize={(width) => setPaneWidths((current) => ({ ...current, [task.id]: width }))}
          onSelectSubtask={(subtaskId) => setSelectedSubtask({ taskId: task.id, subtaskId })}
          onToggleFollow={() => toggleFollow(task.id)}
          onToggleSubtask={(subtaskId) => toggleSubtask(task.id, subtaskId)}
          onUpdateField={(field, value) => updateTaskField(task.id, field, value)}
          paneIndex={index}
          paneWidths={selectedTasks.map((selectedTask) => paneWidths[selectedTask.id] ?? 420)}
          people={people}
          projectName={projects.find((project) => project.id === task.projectId)?.name ?? ''}
          task={task}
          width={paneWidths[task.id] ?? 420}
        />
      ))}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} role="menu">
          <button onClick={() => { onArchiveTask(contextMenu.taskId, 'Task deleted'); setContextMenu(null); }} type="button">
            Delete
          </button>
          <button onClick={() => { onArchiveTask(contextMenu.taskId, 'Task archived'); setContextMenu(null); }} type="button">
            Archive
          </button>
        </div>
      )}
    </>
  );
}

function limitOpenPanes(taskIds: string[]) {
  return [...new Set(taskIds)].slice(-3);
}

function TaskRow({
  currentUser,
  task,
  selected,
  onOpen,
  onComplete,
  onContextMenu,
}: {
  currentUser: Person;
  task: Task;
  selected: boolean;
  onOpen: (event: React.MouseEvent) => void;
  onComplete: (complete: boolean) => void;
  onContextMenu: (event: React.MouseEvent) => void;
}) {
  const progress = progressFor(task);
  const percent = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100);
  const editable = canEditTask(currentUser, task.assignee);

  return (
    <button
      className={`task-row status-mark-${task.status} ${selected ? 'is-selected' : ''}`}
      data-testid={`task-row-${task.id}`}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      type="button"
    >
      <span className="check-cell" onClick={(event) => event.stopPropagation()}>
        <input
          aria-label={`Complete ${task.title}`}
          checked={task.status === 'done'}
          disabled={!editable}
          onChange={(event) => onComplete(event.target.checked)}
          type="checkbox"
        />
      </span>
      <span className="title-cell">
        <strong>{task.title}</strong>
        <small>{task.description}</small>
      </span>
      <span className={`status-label status-${task.status}`}>{statusLabels[task.status]}</span>
      <span>{phaseLabels[task.phase]}</span>
      <span>{priorityLabels[task.priority]}</span>
      <span>{task.dueDate}</span>
      <span>{task.assignee}</span>
      <span className="progress-cell" data-testid={`progress-${task.id}`}>
        <span>{progress.done}/{progress.total}</span>
        <span className="progress-track" aria-hidden="true">
          <span className={percent < 31 ? 'progress-danger' : percent < 66 ? 'progress-active' : 'progress-success'} style={{ width: `${percent}%` }} />
        </span>
      </span>
    </button>
  );
}

function TaskPane({
  currentUser,
  task,
  projectName,
  people,
  paneIndex,
  paneWidths,
  width,
  onClose,
  onComplete,
  onToggleSubtask,
  onArchiveSubtask,
  onSelectSubtask,
  onResize,
  onAddComment,
  onAddSubtask,
  onUpdateField,
  onToggleFollow,
}: {
  currentUser: Person;
  task: Task;
  people: Person[];
  projectName: string;
  paneIndex: number;
  paneWidths: number[];
  width: number;
  onClose: () => void;
  onComplete: (complete: boolean) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onArchiveSubtask: (subtaskId: string) => void;
  onSelectSubtask: (subtaskId: string) => void;
  onResize: (width: number) => void;
  onAddComment: (body: string, versionId: string) => void;
  onAddSubtask: (title: string) => void;
  onUpdateField: <K extends 'status' | 'phase' | 'priority' | 'assignee'>(field: K, value: Task[K]) => void;
  onToggleFollow: () => void;
}) {
  const progress = progressFor(task);
  const editable = canEditTask(currentUser, task.assignee);
  const assignedUser = currentUser.name === task.assignee;
  const following = task.followers.includes(currentUser.name);
  const [versionId, setVersionId] = React.useState(task.reviewVersions[0]?.id ?? '');
  const [composer, setComposer] = React.useState('');
  const [fullscreen, setFullscreen] = React.useState(false);
  const activeVersion = task.reviewVersions.find((version) => version.id === versionId) ?? task.reviewVersions[0];
  const activeVersionIndex = task.reviewVersions.findIndex((version) => version.id === activeVersion?.id);
  const rightOffset = paneWidths.slice(paneIndex + 1).reduce((sum, paneWidth) => sum + paneWidth, 0);

  React.useEffect(() => {
    if (!task.reviewVersions.some((version) => version.id === versionId)) {
      setVersionId(task.reviewVersions[0]?.id ?? '');
    }
  }, [task.reviewVersions, versionId]);

  const stepVersion = (direction: -1 | 1) => {
    if (task.reviewVersions.length === 0 || activeVersionIndex < 0) {
      return;
    }
    const nextIndex = (activeVersionIndex + direction + task.reviewVersions.length) % task.reviewVersions.length;
    setVersionId(task.reviewVersions[nextIndex].id);
  };

  const sendComment = () => {
    if (!activeVersion) {
      return;
    }
    onAddComment(composer, activeVersion.id);
    setComposer('');
  };

  const addComposerSubtask = () => {
    onAddSubtask(composer || `Follow up ${task.reviewVersions.length + task.subtasks.length + 1}`);
    setComposer('');
  };

  return (
    <>
      <aside
        className="task-pane is-open"
        aria-label="Task pane"
        data-testid="task-pane"
        style={{ right: rightOffset, width, zIndex: 10 + paneIndex }}
      >
        <button
          aria-label="Resize task pane"
          className="pane-resize-handle"
          onPointerDown={(event) => {
            const startX = event.clientX;
            const startWidth = width;
            const handleMove = (moveEvent: PointerEvent) => {
              onResize(Math.max(320, Math.min(620, startWidth + startX - moveEvent.clientX)));
            };
            const handleUp = () => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
          type="button"
        />
        <header className="pane-header">
          <button aria-label="Close task pane" className="icon-button" onClick={onClose} type="button">
            <PanelRightClose size={16} aria-hidden="true" />
          </button>
          <div>
            <p>{projectName}</p>
            <h2>{task.title}</h2>
          </div>
        </header>
        <section className="review-media" aria-label="Review media">
          <button aria-label="Previous version" className="icon-button" onClick={() => stepVersion(-1)} type="button">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button className="media-placeholder" onClick={() => setFullscreen(true)} type="button">
            <select
              aria-label={`Version for ${task.title}`}
              className="version-overlay"
              value={activeVersion?.id ?? ''}
              onChange={(event) => {
                event.stopPropagation();
                setVersionId(event.target.value);
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {task.reviewVersions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.label}
                </option>
              ))}
            </select>
            <span>{activeVersion?.label}</span>
            <strong>{activeVersion?.summary}</strong>
            <small>{activeVersion?.kind} / {activeVersion?.date}</small>
            <Maximize2 size={15} aria-hidden="true" />
          </button>
          <button aria-label="Next version" className="icon-button" onClick={() => stepVersion(1)} type="button">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>
        <div className="pane-actions">
          {task.status === 'done' ? (
            <button className="secondary-action" disabled={!editable} onClick={() => onComplete(false)} type="button">
              <RotateCcw size={15} aria-hidden="true" />
              Undo to WIP
            </button>
          ) : (
            <button className="primary-action" disabled={!editable} onClick={() => onComplete(true)} type="button">
              <CheckCircle2 size={15} aria-hidden="true" />
              Mark complete
            </button>
          )}
          {assignedUser ? (
            <button className="secondary-action" disabled type="button">Following</button>
          ) : (
            <button className="secondary-action" onClick={onToggleFollow} type="button">{following ? 'Unfollow' : 'Follow'}</button>
          )}
        </div>
        <dl className="pane-meta">
          <div>
            <dt>Status</dt>
            <dd>
              <select value={task.status} disabled={!editable} onChange={(event) => onUpdateField('status', event.target.value as TaskStatus)}>
                {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
            </dd>
          </div>
          <div>
            <dt>Phase</dt>
            <dd>
              <select value={task.phase} disabled={!editable} onChange={(event) => onUpdateField('phase', event.target.value as TaskPhase)}>
                {phases.map((phase) => <option key={phase} value={phase}>{phaseLabels[phase]}</option>)}
              </select>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <select value={task.priority} disabled={!editable} onChange={(event) => onUpdateField('priority', event.target.value as TaskPriority)}>
                {priorities.map((priority) => <option key={priority} value={priority}>{priorityLabels[priority]}</option>)}
              </select>
            </dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>{task.dueDate}</dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>
              <select value={task.assignee} disabled={!editable} onChange={(event) => onUpdateField('assignee', event.target.value)}>
                {people.map((person) => <option key={person.id} value={person.name}>{person.name}</option>)}
              </select>
            </dd>
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
              <div key={subtask.id} className="subtask" role="button" tabIndex={0} onClick={() => onSelectSubtask(subtask.id)}>
                <input
                  checked={subtask.done}
                  data-testid={`subtask-${subtask.id}`}
                  disabled={!editable}
                  onChange={() => onToggleSubtask(subtask.id)}
                  onClick={(event) => event.stopPropagation()}
                  type="checkbox"
                />
                <span>{subtask.title}</span>
                <button aria-label={`Archive ${subtask.title}`} className="icon-button" onClick={(event) => { event.stopPropagation(); onArchiveSubtask(subtask.id); }} type="button">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="pane-section">
          <h3>Comments</h3>
          <div className="comment-history">
            {task.comments.map((comment) => {
              const addressedVersion = task.reviewVersions.find((version) => version.id === comment.versionId);
              return (
                <article key={comment.id}>
                  <header>
                    <strong>{comment.author}</strong>
                    <span>{comment.date} / {addressedVersion?.label ?? comment.versionId}</span>
                  </header>
                  <p>{comment.body}</p>
                </article>
              );
            })}
          </div>
          <div className="comment-composer">
            <div className="composer-toolbar" aria-label="Composer toolbar">
              <button aria-label="Bold" className="icon-button" type="button">
                <Bold size={14} aria-hidden="true" />
              </button>
              <button aria-label="List" className="icon-button" type="button">
                <List size={14} aria-hidden="true" />
              </button>
              <button aria-label="Add subtask" className="icon-button" onClick={addComposerSubtask} type="button">
                <Plus size={14} aria-hidden="true" />
              </button>
              <button aria-label="Attach" className="icon-button" type="button">
                <Paperclip size={14} aria-hidden="true" />
              </button>
              <button aria-label="Send comment" className="icon-button" onClick={sendComment} type="button">
                <Send size={14} aria-hidden="true" />
              </button>
            </div>
            <textarea aria-label={`Message for ${task.title}`} value={composer} onChange={(event) => setComposer(event.target.value)} />
          </div>
        </section>
      </aside>
      {fullscreen && (
        <div className="media-fullscreen" role="dialog" aria-modal="true" onClick={() => setFullscreen(false)}>
          <button aria-label="Close preview" className="icon-button" onClick={() => setFullscreen(false)} type="button">
            <PanelRightClose size={16} aria-hidden="true" />
          </button>
          <div className="media-placeholder">
            <span>{activeVersion?.label}</span>
            <strong>{activeVersion?.summary}</strong>
            <small>{task.title}</small>
          </div>
        </div>
      )}
    </>
  );
}

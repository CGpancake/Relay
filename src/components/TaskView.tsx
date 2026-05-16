import React from 'react';
import '@annotorious/react/annotorious-react.css';
import { Annotorious, ImageAnnotator, W3CImageFormat, useAnnotator, type AnnotoriousImageAnnotator, type W3CImageAnnotation } from '@annotorious/react';
import {
  Archive,
  Bold,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Maximize2,
  Minus,
  MousePointer2,
  PanelRightClose,
  Eye,
  EyeOff,
  Paperclip,
  Pause,
  PenLine,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Send,
  Square,
  Columns2,
  Trash2,
} from 'lucide-react';
import { phases, phaseLabels, priorities, priorityLabels, statusLabels, statuses } from '../data/labels';
import { canEditTask } from '../lib/permissions';
import { progressFor } from '../lib/tasks';
import { themeAccentChoices, type ThemeAccentKey, type ThemeDefinition } from '../themes';
import type { Person, Project, Task, TaskComment, TaskPhase, TaskPriority, TaskReviewVersion, TaskStatus } from '../types';

type Filters = {
  user: string;
  project: string;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
  priority: 'all' | TaskPriority;
  search: string;
};

type StoredAnnotation = {
  id: string;
  body: W3CImageAnnotation;
};

type ReviewTool = 'select' | 'box' | 'pen';

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const abSlopeForAngle = (angleDeg: number) => {
  const boundedAngle = clampNumber(angleDeg, -89.5, 89.5);
  return Math.tan((boundedAngle * Math.PI) / 180);
};

type Point = { x: number; y: number };

const splitBoundsForSlope = (slope: number) => {
  const cornerConstants = [
    0 + slope * (0 - 50),
    100 + slope * (0 - 50),
    0 + slope * (100 - 50),
    100 + slope * (100 - 50),
  ];
  return {
    max: Math.max(...cornerConstants),
    min: Math.min(...cornerConstants),
  };
};

const xOnSplitLine = (split: number, slope: number, y: number) => split - slope * (y - 50);

const splitLineIntersections = (split: number, slope: number): [Point, Point] => {
  const candidates: Point[] = [
    { x: xOnSplitLine(split, slope, 0), y: 0 },
    { x: xOnSplitLine(split, slope, 100), y: 100 },
  ];
  if (Math.abs(slope) > 0.0001) {
    candidates.push({ x: 0, y: 50 + split / slope });
    candidates.push({ x: 100, y: 50 + (split - 100) / slope });
  }
  const unique = candidates
    .filter((point) => point.x >= -0.001 && point.x <= 100.001 && point.y >= -0.001 && point.y <= 100.001)
    .map((point) => ({ x: clampNumber(point.x, 0, 100), y: clampNumber(point.y, 0, 100) }))
    .filter((point, index, points) => points.findIndex((candidate) => Math.abs(candidate.x - point.x) < 0.01 && Math.abs(candidate.y - point.y) < 0.01) === index);
  if (unique.length < 2) {
    const fallback = clampNumber(split, 0, 100);
    return [{ x: fallback, y: 0 }, { x: fallback, y: 100 }];
  }
  return [unique[0], unique[1]];
};

const clipPolygonForSplit = (split: number, slope: number) => {
  const inside = (point: Point) => point.x + slope * (point.y - 50) >= split;
  const intersect = (start: Point, end: Point) => {
    const startValue = start.x + slope * (start.y - 50) - split;
    const endValue = end.x + slope * (end.y - 50) - split;
    const amount = startValue / (startValue - endValue || 1);
    return {
      x: start.x + (end.x - start.x) * amount,
      y: start.y + (end.y - start.y) * amount,
    };
  };
  const rectangle: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const clipped = rectangle.reduce<Point[]>((output, current, index) => {
    const previous = rectangle[(index + rectangle.length - 1) % rectangle.length];
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside && !previousInside) output.push(intersect(previous, current));
    if (currentInside) output.push(current);
    if (!currentInside && previousInside) output.push(intersect(previous, current));
    return output;
  }, []);
  if (clipped.length === 0) return 'polygon(100% 0, 100% 100%, 100% 100%)';
  return `polygon(${clipped.map((point) => `${point.x}% ${point.y}%`).join(', ')})`;
};

const hitPolygonForLine = (start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = 2.6;
  const nx = (-dy / length) * offset;
  const ny = (dx / length) * offset;
  return `polygon(${[
    { x: start.x + nx, y: start.y + ny },
    { x: end.x + nx, y: end.y + ny },
    { x: end.x - nx, y: end.y - ny },
    { x: start.x - nx, y: start.y - ny },
  ].map((point) => `${point.x}% ${point.y}%`).join(', ')})`;
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
  accentKey,
  activeTheme,
  currentUser,
  people,
  projects,
  tasks,
  setTasks,
  onArchiveTask,
  onArchiveSubtask,
  onTaskUpdated,
}: {
  accentKey: ThemeAccentKey;
  activeTheme: ThemeDefinition;
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
        selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Deliverable deleted'));
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
      onTaskUpdated(next, `Subdeliverable ${subtask?.done ? 'completed' : 'reopened'}: ${subtask?.title ?? next.title}`);
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
      onTaskUpdated(next, `Subdeliverable added: ${trimmed}`);
      return next;
    });
  };

  const addComment = (taskId: string, body: string, versionId: string, metadata: Pick<TaskComment, 'annotationIds' | 'frameNumber'> = {}) => {
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
            ...metadata,
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
          <p className="eyebrow">Relay / Deliverables</p>
          <h1>deliverables board</h1>
        </div>
        <div className="header-stats">
          <span>{filteredTasks.length} visible</span>
            <span>{tasks.length} seeded</span>
            <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>

      <section className="toolbar selection-toolbar" aria-label="Deliverable actions">
        <button disabled={selectedTaskIds.length === 0} onClick={() => selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Deliverable deleted'))} type="button">
          <Trash2 size={14} aria-hidden="true" />
          Delete
        </button>
        <button disabled={selectedTaskIds.length === 0} onClick={() => selectedTaskIds.forEach((taskId) => onArchiveTask(taskId, 'Deliverable archived'))} type="button">
          <Archive size={14} aria-hidden="true" />
          Archive
        </button>
      </section>

      <section className="filters" aria-label="Deliverable filters">
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

      <section className="task-table" aria-label="Relay deliverable table">
        <div className="table-header" role="row">
          <span>Done</span>
          <span>Title</span>
          <span>Status</span>
          <span>Phase</span>
          <span>Priority</span>
          <span>Due</span>
          <span>Assignee</span>
          <span>Subdeliverables</span>
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
                <p className="empty-row">No matching deliverables</p>
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
          accentKey={accentKey}
          activeTheme={activeTheme}
          key={task.id}
          onArchiveSubtask={(subtaskId) => {
            onArchiveSubtask(task.id, subtaskId);
            setSelectedSubtask(null);
          }}
          onAddComment={(body, versionId, metadata) => addComment(task.id, body, versionId, metadata)}
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
          <button onClick={() => { onArchiveTask(contextMenu.taskId, 'Deliverable deleted'); setContextMenu(null); }} type="button">
            Delete
          </button>
          <button onClick={() => { onArchiveTask(contextMenu.taskId, 'Deliverable archived'); setContextMenu(null); }} type="button">
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

function TaskReviewPanel({
  task,
  version,
  onOpenVersion,
  onStepVersion,
  onVersionChange,
}: {
  task: Task;
  version?: TaskReviewVersion;
  onOpenVersion: (versionId: string) => void;
  onStepVersion: (direction: -1 | 1) => void;
  onVersionChange: (versionId: string) => void;
}) {
  const latestVersion = task.reviewVersions[task.reviewVersions.length - 1];
  const isLatest = Boolean(version && latestVersion?.id === version.id);

  return (
    <section className="review-media review-thumbnail-list" aria-label="Review media" data-testid="task-review-panel">
      {version ? (
        <div className="review-selected-version">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Open ${version.label} fullscreen review`}
            className="review-version-card"
            data-testid={`review-version-thumbnail-${version.label.toLowerCase()}`}
            onClick={() => {
              onVersionChange(version.id);
              onOpenVersion(version.id);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onVersionChange(version.id);
              onOpenVersion(version.id);
            }}
          >
            <img alt={`${task.title} ${version.label} thumbnail`} src={version.thumbnailUrl ?? frameUrl(version, version.defaultFrame)} />
            {isLatest && <span className="review-latest-badge">Latest</span>}
            <span className="review-version-badge">{version.label}</span>
            <Maximize2 size={15} aria-hidden="true" />
            <button
              aria-label="Previous review version"
              className="icon-button review-selected-step review-selected-step-left"
              onClick={(event) => {
                event.stopPropagation();
                if (task.reviewVersions.length < 2) return;
                onStepVersion(-1);
              }}
              disabled={task.reviewVersions.length < 2}
              type="button"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              aria-label="Next review version"
              className="icon-button review-selected-step review-selected-step-right"
              onClick={(event) => {
                event.stopPropagation();
                if (task.reviewVersions.length < 2) return;
                onStepVersion(1);
              }}
              disabled={task.reviewVersions.length < 2}
              type="button"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="media-placeholder">
          <span>No version</span>
          <strong>No review media is available.</strong>
        </div>
      )}
    </section>
  );
}

const AnnotatedFrame = React.forwardRef<HTMLDivElement, {
  annotationColor: string;
  annotationAccentKey: ThemeAccentKey;
  currentUser: Person;
  deleteRequest: number;
  frameNumber: number;
  imageUrl: string;
  onAnnotationCreated: (annotationId: string, frameNumber: number) => void;
  onAnnotationDeleted: (annotationId: string) => void;
  onAnnotationSelected: (annotationId?: string) => void;
  selectedAnnotationId?: string;
  task: Task;
  version: TaskReviewVersion;
  tool: ReviewTool;
  onImageClick: () => void;
  annotationsVisible: boolean;
  interactionsDisabled: boolean;
}>(function AnnotatedFrame({
  annotationColor,
  annotationAccentKey,
  currentUser,
  deleteRequest,
  frameNumber,
  imageUrl,
  onAnnotationCreated,
  onAnnotationDeleted,
  onAnnotationSelected,
  selectedAnnotationId,
  task,
  version,
  tool,
  onImageClick,
  annotationsVisible,
  interactionsDisabled,
}, ref) {
  const annotator = useAnnotator<AnnotoriousImageAnnotator<any, W3CImageAnnotation> | null>();
  const [penAnnotations, setPenAnnotations] = React.useState<W3CImageAnnotation[]>([]);
  const [draftPenPoints, setDraftPenPoints] = React.useState<Array<{ x: number; y: number }>>([]);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    annotationApi
      .list({
        frameNumber,
        projectId: task.projectId,
        shotId: version.shotId,
        versionId: version.id,
        signal: controller.signal,
      })
      .then((annotations) => {
        if (!cancelled) {
          const normalizedAnnotations = annotations.map(normalizeStoredAnnotation);
          setPenAnnotations(normalizedAnnotations.map((annotation) => annotation.body).filter(isPenAnnotation));
          annotator?.setAnnotations(normalizedAnnotations.map((annotation) => annotation.body).filter((annotation) => !isPenAnnotation(annotation)), true);
          if (selectedAnnotationId) {
            window.setTimeout(() => annotator?.setSelected(selectedAnnotationId, false), 0);
          }
        }
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) console.warn('Failed to load annotations', error);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [annotator, frameNumber, selectedAnnotationId, task.projectId, version.id, version.shotId]);

  React.useEffect(() => {
    annotator?.setDrawingEnabled(!interactionsDisabled && tool === 'box');
    annotator?.setDrawingTool?.('rectangle');
  }, [annotator, interactionsDisabled, tool]);

  React.useEffect(() => {
    annotator?.setStyle((annotation) => annotationDrawingStyle(annotation, annotationColor));
  }, [annotationColor, annotator]);

  React.useEffect(() => {
    if (annotator && selectedAnnotationId) {
      annotator.setSelected(selectedAnnotationId, false);
    }
  }, [annotator, selectedAnnotationId]);

  React.useEffect(() => {
    if (!annotator) return;

    const createAnnotation = (annotation: W3CImageAnnotation) => {
      if (interactionsDisabled) return;
      const styledAnnotation = withAnnotationStyle(annotation, annotationAccentKey, annotationColor, 'box');
      void annotationApi.create({
        body: styledAnnotation,
        frameNumber,
        projectId: task.projectId,
        shotId: version.shotId,
        userId: currentUser.id,
        versionId: version.id,
      }).then((stored) => onAnnotationCreated(String(stored.body.id ?? stored.id), frameNumber));
    };
    const updateAnnotation = (annotation: W3CImageAnnotation) => {
      if (interactionsDisabled) return;
      if (!annotation.id) return;
      void annotationApi.update(String(annotation.id), annotation);
    };
    const deleteAnnotation = (annotation: W3CImageAnnotation) => {
      if (interactionsDisabled) return;
      if (!annotation.id) return;
      void annotationApi.delete(String(annotation.id));
      onAnnotationDeleted(String(annotation.id));
    };
    const selectionChanged = (selection: Array<W3CImageAnnotation> | Array<{ annotation?: W3CImageAnnotation }>) => {
      if (interactionsDisabled) return;
      const selected = selection[0];
      const annotation = 'annotation' in (selected ?? {}) ? (selected as { annotation?: W3CImageAnnotation }).annotation : selected as W3CImageAnnotation | undefined;
      onAnnotationSelected(annotation?.id ? String(annotation.id) : undefined);
    };

    annotator.on('createAnnotation', createAnnotation);
    annotator.on('updateAnnotation', updateAnnotation);
    annotator.on('deleteAnnotation', deleteAnnotation);
    annotator.on('selectionChanged', selectionChanged);
    return () => {
      annotator.off('createAnnotation', createAnnotation);
      annotator.off('updateAnnotation', updateAnnotation);
      annotator.off('deleteAnnotation', deleteAnnotation);
      annotator.off('selectionChanged', selectionChanged);
    };
  }, [annotationAccentKey, annotationColor, annotator, currentUser.id, frameNumber, interactionsDisabled, onAnnotationCreated, onAnnotationDeleted, onAnnotationSelected, task.projectId, version.id, version.shotId]);

  React.useEffect(() => {
    if (interactionsDisabled || deleteRequest === 0 || !selectedAnnotationId) return;
    const selectedPen = penAnnotations.find((annotation) => annotation.id === selectedAnnotationId);
    if (selectedPen) {
      void annotationApi.delete(selectedAnnotationId);
      setPenAnnotations((current) => current.filter((annotation) => annotation.id !== selectedAnnotationId));
      onAnnotationDeleted(selectedAnnotationId);
      return;
    }
    const deleted = annotator?.removeAnnotation?.(selectedAnnotationId);
    if (!deleted) {
      void annotationApi.delete(selectedAnnotationId).then(() => onAnnotationDeleted(selectedAnnotationId));
    }
  }, [annotator, deleteRequest, interactionsDisabled, onAnnotationDeleted, penAnnotations, selectedAnnotationId]);

  const toSvgPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * 1000,
      y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * 1000,
    };
  };

  const beginPen = (event: React.PointerEvent<SVGSVGElement>) => {
    if (interactionsDisabled || tool !== 'pen') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraftPenPoints([toSvgPoint(event)]);
  };

  const continuePen = (event: React.PointerEvent<SVGSVGElement>) => {
    if (interactionsDisabled || tool !== 'pen' || draftPenPoints.length === 0) return;
    setDraftPenPoints((current) => [...current, toSvgPoint(event)]);
  };

  const endPen = (event: React.PointerEvent<SVGSVGElement>) => {
    if (interactionsDisabled || tool !== 'pen' || draftPenPoints.length < 2) {
      setDraftPenPoints([]);
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    const annotation = withAnnotationStyle(createPenAnnotation(imageUrl, draftPenPoints), annotationAccentKey, annotationColor, 'pen');
    setDraftPenPoints([]);
    setPenAnnotations((current) => [...current, annotation]);
    void annotationApi.create({
      body: annotation,
      frameNumber,
      projectId: task.projectId,
      shotId: version.shotId,
      userId: currentUser.id,
      versionId: version.id,
    }).then((stored) => {
      const storedId = String(stored.body.id ?? stored.id);
      setPenAnnotations((current) => current.map((item) => (item.id === annotation.id ? stored.body : item)));
      onAnnotationCreated(storedId, frameNumber);
      onAnnotationSelected(storedId);
    });
  };

  const penElements = [...penAnnotations, ...(draftPenPoints.length > 0 ? [createPenAnnotation(imageUrl, draftPenPoints)] : [])];

  return (
    <div className={`annotated-frame-layer tool-${tool} ${annotationsVisible ? '' : 'annotations-hidden'} ${interactionsDisabled ? 'annotations-disabled' : ''}`} data-testid="annotated-frame-layer" ref={ref}>
      <ImageAnnotator adapter={W3CImageFormat(imageUrl)} autoSave drawingEnabled={!interactionsDisabled && tool === 'box'} style={(annotation) => annotationDrawingStyle(annotation, annotationColor)}>
        <img alt={`${task.title} ${version.label} frame ${frameNumber}`} data-testid="review-frame-image" onClick={onImageClick} src={imageUrl} />
      </ImageAnnotator>
      <svg
        aria-label="Pen annotation layer"
        className="pen-annotation-layer"
        data-testid="pen-annotation-layer"
        onPointerDown={beginPen}
        onPointerMove={continuePen}
        onPointerUp={endPen}
        ref={svgRef}
        viewBox="0 0 1000 1000"
      >
        {penElements.map((annotation) => {
          const points = penPointsFromAnnotation(annotation);
          const style = annotationStyleFromBodies(annotation.body as Array<{ value?: string }>) ?? { color: annotationColor };
          const id = String(annotation.id);
          return (
            <polyline
              className={id === selectedAnnotationId ? 'is-selected' : ''}
              data-testid={`pen-annotation-${id}`}
              fill="none"
              key={id}
              onClick={(event) => {
                if (interactionsDisabled || tool !== 'select') return;
                event.stopPropagation();
                annotator?.cancelSelected?.();
                onAnnotationSelected(id);
              }}
              points={points.map((point) => `${point.x},${point.y}`).join(' ')}
              stroke={style.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={id === selectedAnnotationId ? 10 : 7}
            />
          );
        })}
      </svg>
    </div>
  );
});

function FullscreenReview({
  accentKey,
  activeTheme,
  currentUser,
  composer,
  onClose,
  onComposerChange,
  onSendComment,
  onVersionChange,
  task,
  version,
}: {
  accentKey: ThemeAccentKey;
  activeTheme: ThemeDefinition;
  currentUser: Person;
  composer: string;
  onClose: () => void;
  onComposerChange: (value: string) => void;
  onSendComment: (metadata?: Pick<TaskComment, 'annotationIds' | 'frameNumber'>, fallbackBody?: string) => void;
  onVersionChange: (versionId: string) => void;
  task: Task;
  version: TaskReviewVersion;
}) {
  const [frameNumber, setFrameNumber] = React.useState(version.defaultFrame);
  const [fps, setFps] = React.useState(24);
  const [playing, setPlaying] = React.useState(false);
  const [loopPlayback, setLoopPlayback] = React.useState(false);
  const [tool, setTool] = React.useState<ReviewTool>('select');
  const [deleteRequest, setDeleteRequest] = React.useState(0);
  const [selectedAnnotationId, setSelectedAnnotationId] = React.useState<string | undefined>();
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | undefined>();
  const [pendingAnnotationIds, setPendingAnnotationIds] = React.useState<Array<{ id: string; frameNumber: number; versionId: string }>>([]);
  const [annotationAccentKey, setAnnotationAccentKey] = React.useState<ThemeAccentKey>(accentKey);
  const [revealTarget, setRevealTarget] = React.useState<{ annotationId?: string; frameNumber?: number; versionId: string } | null>(null);
  const [abMode, setAbMode] = React.useState(false);
  const [abLeftVersionId, setAbLeftVersionId] = React.useState(version.id);
  const [abRightVersionId, setAbRightVersionId] = React.useState(() => {
    const currentIndex = task.reviewVersions.findIndex((candidate) => candidate.id === version.id);
    return task.reviewVersions[currentIndex + 1]?.id ?? task.reviewVersions[currentIndex - 1]?.id ?? version.id;
  });
  const [abSplit, setAbSplit] = React.useState(50);
  const [abAngleDeg, setAbAngleDeg] = React.useState(0);
  const [annotationToolsOpen, setAnnotationToolsOpen] = React.useState(false);
  const [reviewZoom, setReviewZoom] = React.useState(100);
  const [reviewPan, setReviewPan] = React.useState({ x: 0, y: 0 });
  const reviewSurfaceRef = React.useRef<HTMLDivElement | null>(null);
  const reviewContentRef = React.useRef<HTMLDivElement | null>(null);
  const panDragRef = React.useRef<{ pointerId: number; x: number; y: number; pan: { x: number; y: number } } | null>(null);
  const accentChoices = themeAccentChoices(activeTheme);
  const annotationColor = accentChoices.find((choice) => choice.key === annotationAccentKey)?.color ?? accentChoices[0]?.color ?? '#F5C400';
  const imageUrl = frameUrl(version, frameNumber);
  const versionIndex = task.reviewVersions.findIndex((candidate) => candidate.id === version.id);
  const abLeftVersion = task.reviewVersions.find((candidate) => candidate.id === abLeftVersionId) ?? version;
  const abRightVersion = task.reviewVersions.find((candidate) => candidate.id === abRightVersionId) ?? task.reviewVersions.find((candidate) => candidate.id !== abLeftVersion.id) ?? version;
  const abLeftFrame = Math.max(abLeftVersion.frameStart, Math.min(abLeftVersion.frameEnd, frameNumber));
  const abRightFrame = Math.max(abRightVersion.frameStart, Math.min(abRightVersion.frameEnd, frameNumber));
  const abSlope = abSlopeForAngle(abAngleDeg);
  const abSplitBounds = splitBoundsForSlope(abSlope);
  const clampedAbSplit = clampNumber(abSplit, abSplitBounds.min, abSplitBounds.max);
  const [abLineStart, abLineEnd] = splitLineIntersections(clampedAbSplit, abSlope);
  const abClipPolygon = clipPolygonForSplit(clampedAbSplit, abSlope);
  const abHitPolygon = hitPolygonForLine(abLineStart, abLineEnd);
  const annotationInteractionsDisabled = playing || abMode;
  const setClampedAbAngle = (nextAngle: number) => setAbAngleDeg(clampNumber(Math.round(nextAngle), -90, 90));
  const setClampedReviewZoom = React.useCallback((nextZoom: number | ((current: number) => number)) => {
    setReviewZoom((current) => clampNumber(typeof nextZoom === 'function' ? nextZoom(current) : nextZoom, 100, 200));
  }, []);
  const clampReviewPan = React.useCallback((pan: { x: number; y: number }, zoom = reviewZoom) => {
    if (zoom <= 100) return { x: 0, y: 0 };
    const surface = reviewSurfaceRef.current;
    const content = reviewContentRef.current;
    const maxX = surface && content ? Math.max(0, (content.offsetWidth * (zoom / 100) - surface.clientWidth) / 2) : 0;
    const maxY = surface && content ? Math.max(0, (content.offsetHeight * (zoom / 100) - surface.clientHeight) / 2) : 0;
    return {
      x: clampNumber(pan.x, -maxX, maxX),
      y: clampNumber(pan.y, -maxY, maxY),
    };
  }, [reviewZoom]);

  React.useEffect(() => {
    setFrameNumber(version.defaultFrame);
    setPlaying(false);
    setSelectedAnnotationId(undefined);
    setTool('select');
    setReviewPan({ x: 0, y: 0 });
  }, [version.defaultFrame, version.id]);

  React.useEffect(() => {
    setReviewPan((current) => clampReviewPan(current, reviewZoom));
  }, [abMode, clampReviewPan, frameNumber, reviewZoom, version.id]);

  React.useEffect(() => {
    if (!abMode) return;
    const currentIndex = task.reviewVersions.findIndex((candidate) => candidate.id === version.id);
    const fallback = task.reviewVersions[currentIndex + 1] ?? task.reviewVersions[currentIndex - 1] ?? version;
    setAbLeftVersionId(version.id);
    setAbRightVersionId(fallback.id);
    setTool('select');
    setSelectedAnnotationId(undefined);
  }, [abMode, task.reviewVersions, version]);

  React.useEffect(() => {
    if (revealTarget?.versionId !== version.id) {
      return;
    }
    if (revealTarget.frameNumber) {
      setFrameNumber(Math.max(version.frameStart, Math.min(version.frameEnd, revealTarget.frameNumber)));
    }
    setSelectedAnnotationId(revealTarget.annotationId);
    setRevealTarget(null);
  }, [revealTarget, version.frameEnd, version.frameStart, version.id]);

  React.useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setFrameNumber((current) => {
        if (current >= version.frameEnd) {
          if (loopPlayback) {
            return version.frameStart;
          }
          setPlaying(false);
          return version.frameEnd;
        }
        return current + 1;
      });
    }, 1000 / Math.max(1, fps));
    return () => window.clearInterval(interval);
  }, [fps, loopPlayback, playing, version.frameEnd, version.frameStart]);

  const togglePlayback = React.useCallback(() => {
    setPlaying((current) => {
      if (current) {
        return false;
      }
      setFrameNumber((frame) => (frame >= version.frameEnd ? version.frameStart : frame));
      return true;
    });
  }, [version.frameEnd, version.frameStart]);

  const stepFrame = React.useCallback(
    (direction: -1 | 1) => {
      setPlaying(false);
      setFrameNumber((current) => Math.max(version.frameStart, Math.min(version.frameEnd, current + direction)));
    },
    [version.frameEnd, version.frameStart],
  );

  const stepVersion = (direction: -1 | 1) => {
    if (task.reviewVersions.length < 2 || versionIndex < 0) {
      return;
    }
    const nextIndex = (versionIndex + direction + task.reviewVersions.length) % task.reviewVersions.length;
    onVersionChange(task.reviewVersions[nextIndex].id);
  };

  const setReviewTool = (nextTool: ReviewTool) => {
    if (annotationInteractionsDisabled) return;
    setTool(nextTool);
    if (nextTool !== 'select') {
      setSelectedAnnotationId(undefined);
    }
  };

  const chooseAbVersion = (side: 'left' | 'right', nextVersionId: string) => {
    if (task.reviewVersions.length > 1) {
      if (side === 'left' && nextVersionId === abRightVersionId) {
        setAbRightVersionId(task.reviewVersions.find((candidate) => candidate.id !== nextVersionId)?.id ?? abRightVersionId);
      }
      if (side === 'right' && nextVersionId === abLeftVersionId) {
        setAbLeftVersionId(task.reviewVersions.find((candidate) => candidate.id !== nextVersionId)?.id ?? abLeftVersionId);
      }
    }
    if (side === 'left') setAbLeftVersionId(nextVersionId);
    else setAbRightVersionId(nextVersionId);
  };

  const beginReviewPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== 'select' || reviewZoom <= 100 || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea, polyline, .a9s-annotation, .a9s-annotationlayer')) return;
    event.preventDefault();
    panDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, pan: reviewPan };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveReviewPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = panDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setReviewPan(clampReviewPan({
      x: drag.pan.x + event.clientX - drag.x,
      y: drag.pan.y + event.clientY - drag.y,
    }));
  };

  const endReviewPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panDragRef.current?.pointerId !== event.pointerId) return;
    panDragRef.current = null;
  };

  const queueAnnotationAttachment = React.useCallback(
    (annotationId: string, annotationFrame: number) => {
      setSelectedAnnotationId(annotationId);
      setPendingAnnotationIds((current) => [...current, { id: annotationId, frameNumber: annotationFrame, versionId: version.id }]);
    },
    [version.id],
  );

  const sendFullscreenComment = () => {
    const attachments = pendingAnnotationIds.filter((annotation) => annotation.versionId === version.id && annotation.frameNumber === frameNumber);
    const metadata = attachments.length > 0 ? { annotationIds: attachments.map((annotation) => annotation.id), frameNumber } : undefined;
    onSendComment(metadata, attachments.length > 0 ? `Annotation on frame ${frameNumber}` : undefined);
    if (attachments.length > 0) {
      setPendingAnnotationIds((current) => current.filter((annotation) => !attachments.some((attached) => attached.id === annotation.id)));
      setSelectedAnnotationId(attachments[0].id);
    }
  };

  const jumpToComment = (comment: TaskComment) => {
    const targetVersion = task.reviewVersions.find((candidate) => candidate.id === comment.versionId);
    if (!targetVersion) {
      return;
    }
    setPlaying(false);
    setSelectedCommentId(comment.id);
    setSelectedAnnotationId(comment.annotationIds?.[0]);
    const target = { annotationId: comment.annotationIds?.[0], frameNumber: comment.frameNumber, versionId: comment.versionId };
    if (comment.versionId !== version.id) {
      setRevealTarget(target);
      onVersionChange(comment.versionId);
      return;
    }
    if (comment.frameNumber) {
      setFrameNumber(Math.max(targetVersion.frameStart, Math.min(targetVersion.frameEnd, comment.frameNumber)));
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepFrame(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepFrame(1);
      }
      if (event.key === ' ') {
        const target = event.target as HTMLElement | null;
        if (target?.closest('input, textarea, select, button')) {
          return;
        }
        event.preventDefault();
        togglePlayback();
      }
      if (event.key === '+' || event.key === '=' || event.key === '-') {
        const target = event.target as HTMLElement | null;
        if (target?.closest('input, textarea, select, button')) {
          return;
        }
        event.preventDefault();
        setClampedReviewZoom((current) => current + (event.key === '-' ? -10 : 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, setClampedReviewZoom, stepFrame, togglePlayback]);

  return (
    <div className="media-fullscreen" role="dialog" aria-modal="true" aria-label={`${task.title} fullscreen review`} onClick={onClose}>
      <button aria-label="Close preview" className="icon-button fullscreen-close" onClick={onClose} type="button">
        <PanelRightClose size={16} aria-hidden="true" />
      </button>
      <div className="fullscreen-review-shell" onClick={(event) => event.stopPropagation()}>
        <section className="fullscreen-review-main" aria-label="Annotation viewer" data-testid="fullscreen-review">
          <header className="fullscreen-review-toolbar">
            <select aria-label={`Fullscreen version for ${task.title}`} value={version.id} onChange={(event) => onVersionChange(event.target.value)}>
              {task.reviewVersions.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>
            <button
              aria-label="A/B preview"
              className={`icon-button ${abMode ? 'is-active' : ''}`}
              disabled={task.reviewVersions.length < 2}
              onClick={() => setAbMode((current) => !current)}
              type="button"
            >
              <Columns2 size={15} aria-hidden="true" />
            </button>
            {annotationToolsOpen && (
              <>
                <div className="ab-angle-control" aria-label="A/B split angle">
                  <input
                    aria-label="A/B split angle degrees"
                    max={90}
                    min={-90}
                    onChange={(event) => setClampedAbAngle(Number(event.target.value) || 0)}
                    step={1}
                    type="number"
                    value={abAngleDeg}
                  />
                  <input
                    aria-label="A/B split angle slider"
                    max={90}
                    min={-90}
                    onChange={(event) => setClampedAbAngle(Number(event.target.value))}
                    step={1}
                    type="range"
                    value={abAngleDeg}
                  />
                </div>
                <div className="fullscreen-zoom-control" aria-label="Fullscreen zoom">
                  <button aria-label="Zoom out" className="icon-button" disabled={reviewZoom <= 100} onClick={() => setClampedReviewZoom((current) => current - 10)} type="button">
                    <Minus size={15} aria-hidden="true" />
                  </button>
                  <input
                    aria-label="Review zoom"
                    max={200}
                    min={100}
                    onChange={(event) => setClampedReviewZoom(Number(event.target.value))}
                    step={10}
                    type="range"
                    value={reviewZoom}
                  />
                  <button aria-label="Zoom in" className="icon-button" disabled={reviewZoom >= 200} onClick={() => setClampedReviewZoom((current) => current + 10)} type="button">
                    <Plus size={15} aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
            {annotationToolsOpen && (
              <div className="annotation-toolbar-group" data-testid="annotation-toolbar-group">
                <button
                  aria-label="Select annotations"
                  className={`icon-button ${tool === 'select' && !annotationInteractionsDisabled ? 'is-active' : ''}`}
                  disabled={annotationInteractionsDisabled}
                  onClick={() => setReviewTool('select')}
                  type="button"
                >
                  <MousePointer2 size={15} aria-hidden="true" />
                </button>
                <button
                  aria-label="Draw box annotation"
                  className={`icon-button ${tool === 'box' && !annotationInteractionsDisabled ? 'is-active' : ''}`}
                  disabled={annotationInteractionsDisabled}
                  onClick={() => setReviewTool('box')}
                  type="button"
                >
                  <Square size={15} aria-hidden="true" />
                </button>
                <button
                  aria-label="Draw pen annotation"
                  className={`icon-button ${tool === 'pen' && !annotationInteractionsDisabled ? 'is-active' : ''}`}
                  disabled={annotationInteractionsDisabled}
                  onClick={() => setReviewTool('pen')}
                  type="button"
                >
                  <PenLine size={15} aria-hidden="true" />
                </button>
                <div className="annotation-color-palette" aria-label="Annotation color">
                  {accentChoices.map((choice) => (
                    <button
                      aria-label={`Annotation color ${choice.label}`}
                      className={choice.key === annotationAccentKey ? 'is-active' : ''}
                      data-testid={`annotation-color-${choice.key}`}
                      disabled={annotationInteractionsDisabled}
                      key={choice.key}
                      onClick={() => setAnnotationAccentKey(choice.key)}
                      style={{ '--swatch': choice.color } as React.CSSProperties}
                      type="button"
                    />
                  ))}
                </div>
                <button
                  aria-label="Delete selected annotation"
                  className="icon-button"
                  disabled={annotationInteractionsDisabled || tool !== 'select' || !selectedAnnotationId}
                  onClick={() => setDeleteRequest((current) => current + 1)}
                  type="button"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            )}
            <button
              aria-label={annotationToolsOpen ? 'Hide annotation tools' : 'Show annotation tools'}
              aria-pressed={!annotationToolsOpen}
              className="icon-button annotation-tools-toggle"
              onClick={() => setAnnotationToolsOpen((current) => !current)}
              type="button"
            >
              {annotationToolsOpen ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            </button>
          </header>
          <button aria-label="Previous fullscreen review version" className="icon-button fullscreen-version-step fullscreen-version-step-left" disabled={task.reviewVersions.length < 2} onClick={() => stepVersion(-1)} type="button">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button aria-label="Next fullscreen review version" className="icon-button fullscreen-version-step fullscreen-version-step-right" disabled={task.reviewVersions.length < 2} onClick={() => stepVersion(1)} type="button">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <div className="fullscreen-annotator">
            <div
              className="review-zoom-layer"
              data-pan-x={reviewPan.x.toFixed(1)}
              data-pan-y={reviewPan.y.toFixed(1)}
              data-testid="review-zoom-layer"
              onPointerDown={beginReviewPan}
              onPointerMove={moveReviewPan}
              onPointerUp={endReviewPan}
              onPointerCancel={endReviewPan}
              ref={reviewSurfaceRef}
              style={{ '--review-pan-x': `${reviewPan.x}px`, '--review-pan-y': `${reviewPan.y}px`, '--review-zoom': reviewZoom / 100 } as React.CSSProperties}
            >
            {abMode ? (
              <div
              className="ab-preview"
              data-testid="ab-preview"
              ref={reviewContentRef}
              style={{
                  '--ab-clip': abClipPolygon,
                  '--ab-hit': abHitPolygon,
                } as React.CSSProperties}
              >
                <div className="ab-version-control ab-version-control-left">
                  <select aria-label="A/B left version" value={abLeftVersion.id} onChange={(event) => chooseAbVersion('left', event.target.value)}>
                    {task.reviewVersions.map((candidate) => <option disabled={task.reviewVersions.length > 1 && candidate.id === abRightVersion.id} key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
                  </select>
                </div>
                <div className="ab-version-control ab-version-control-right">
                  <select aria-label="A/B right version" value={abRightVersion.id} onChange={(event) => chooseAbVersion('right', event.target.value)}>
                    {task.reviewVersions.map((candidate) => <option disabled={task.reviewVersions.length > 1 && candidate.id === abLeftVersion.id} key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
                  </select>
                </div>
                <img alt={`${abLeftVersion.label} frame ${abLeftFrame}`} className="ab-image ab-image-left" src={frameUrl(abLeftVersion, abLeftFrame)} />
                <div className="ab-right-clip">
                  <img alt={`${abRightVersion.label} frame ${abRightFrame}`} className="ab-image ab-image-right" src={frameUrl(abRightVersion, abRightFrame)} />
                </div>
                <svg aria-hidden="true" className="ab-split-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1={abLineStart.x} y1={abLineStart.y} x2={abLineEnd.x} y2={abLineEnd.y} />
                </svg>
                <button
                  aria-label="Drag A/B split"
                  className="ab-split-handle"
                  onPointerDown={(event) => {
                    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
                    if (!rect) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    const move = (moveEvent: PointerEvent) => {
                      const pointerX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                      const pointerY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                      const bounds = splitBoundsForSlope(abSlope);
                      setAbSplit(clampNumber(pointerX + abSlope * (pointerY - 50), bounds.min, bounds.max));
                    };
                    const up = () => {
                      window.removeEventListener('pointermove', move);
                      window.removeEventListener('pointerup', up);
                    };
                    window.addEventListener('pointermove', move);
                    window.addEventListener('pointerup', up);
                  }}
                  type="button"
                />
              </div>
            ) : (
              <Annotorious>
                <AnnotatedFrame
                  annotationAccentKey={annotationAccentKey}
                  annotationColor={annotationColor}
                  currentUser={currentUser}
                  deleteRequest={deleteRequest}
                  frameNumber={frameNumber}
                  imageUrl={imageUrl}
                  ref={reviewContentRef}
                  onAnnotationCreated={queueAnnotationAttachment}
                  onAnnotationDeleted={(annotationId) => {
                    setSelectedAnnotationId(undefined);
                    setPendingAnnotationIds((current) => current.filter((annotation) => annotation.id !== annotationId));
                  }}
                  onAnnotationSelected={setSelectedAnnotationId}
                  onImageClick={() => {
                    if (tool === 'select') togglePlayback();
                  }}
                  annotationsVisible={!playing}
                  interactionsDisabled={annotationInteractionsDisabled}
                  selectedAnnotationId={selectedAnnotationId}
                  task={task}
                  tool={tool}
                  version={version}
                />
              </Annotorious>
            )}
            </div>
          </div>
          <footer className="fullscreen-playback-controls">
            <div className="fullscreen-fps-control">
              <label>
                FPS
                <input
                  aria-label="Playback FPS"
                  min={1}
                  max={60}
                  step={1}
                  type="number"
                  value={fps}
                  onChange={(event) => setFps(Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
                />
              </label>
            </div>
            <div className="fullscreen-timeline-control">
              <input
                aria-label="Review timeline"
                data-testid="review-timeline"
                max={version.frameEnd}
                min={version.frameStart}
                onChange={(event) => {
                  setPlaying(false);
                  setFrameNumber(Number(event.target.value));
                }}
                step={1}
                type="range"
                value={frameNumber}
              />
              <span data-testid="review-frame-counter">Frame {frameNumber} / {version.frameEnd}</span>
              <button aria-label={playing ? 'Pause playback' : 'Play playback'} className="icon-button" onClick={togglePlayback} type="button">
                {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              </button>
              <button
                aria-label={loopPlayback ? 'Disable loop playback' : 'Enable loop playback'}
                aria-pressed={loopPlayback}
                className={`icon-button loop-toggle ${loopPlayback ? 'is-active' : ''}`}
                onClick={() => setLoopPlayback((current) => !current)}
                type="button"
              >
                <Repeat size={15} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </section>
        <aside className="fullscreen-comments" aria-label={`${version.label} comments`}>
          <header>
            <span>{version.label}</span>
            <strong>{task.title}</strong>
            <small>Frames {version.frameStart}-{version.frameEnd}</small>
          </header>
          <div className="comment-history" data-testid="fullscreen-version-comments">
            {task.comments.length === 0 ? (
              <p className="empty-inline">No comments</p>
            ) : (
              task.comments.map((comment) => {
                const commentVersion = task.reviewVersions.find((candidate) => candidate.id === comment.versionId);
                return (
                <article
                  className={comment.id === selectedCommentId || comment.annotationIds?.includes(selectedAnnotationId ?? '') ? 'is-selected' : ''}
                  data-testid={`fullscreen-comment-${comment.id}`}
                  key={comment.id}
                  onClick={() => jumpToComment(comment)}
                >
                  <header>
                    <strong>{comment.author}</strong>
                    <span>{comment.date} / {commentVersion?.label ?? comment.versionId}{comment.frameNumber ? ` / Frame ${comment.frameNumber}` : ''}</span>
                  </header>
                  <p>{comment.body}</p>
                </article>
              );
              })
            )}
          </div>
          <div className="comment-composer">
            <div className="composer-toolbar" aria-label="Fullscreen composer toolbar">
              <button aria-label="Send fullscreen comment" className="icon-button" onClick={sendFullscreenComment} type="button">
                <Send size={14} aria-hidden="true" />
              </button>
            </div>
            <textarea aria-label={`Fullscreen message for ${version.label}`} value={composer} onChange={(event) => onComposerChange(event.target.value)} />
          </div>
        </aside>
      </div>
    </div>
  );
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

function frameUrl(version: TaskReviewVersion, frameNumber: number) {
  return version.proxyFrameUrlTemplate.replace('{frame}', String(frameNumber));
}

const ANNOTATION_STYLE_VALUE = 'relay:annotation-style';
const ANNOTATION_KIND_VALUE = 'relay:annotation-kind';

function annotationDrawingStyle(annotation: { bodies?: Array<{ purpose?: string; value?: string }> }, fallbackColor: string) {
  const color = annotationStyleFromBodies(annotation.bodies)?.color ?? fallbackColor;
  return {
    fill: color as `#${string}`,
    fillOpacity: 0.18,
    stroke: color as `#${string}`,
    strokeOpacity: 0.95,
    strokeWidth: 3,
  };
}

function withAnnotationStyle(annotation: W3CImageAnnotation, accentKey: ThemeAccentKey, color: string, kind: 'box' | 'pen'): W3CImageAnnotation {
  const body = Array.isArray(annotation.body) ? annotation.body : annotation.body ? [annotation.body] : [];
  const styleBody = {
    purpose: 'tagging',
    type: 'TextualBody',
    value: `${ANNOTATION_STYLE_VALUE}:${JSON.stringify({ accentKey, color })}`,
  };
  const kindBody = {
    purpose: 'tagging',
    type: 'TextualBody',
    value: `${ANNOTATION_KIND_VALUE}:${kind}`,
  };
  return {
    ...annotation,
    body: [
      ...body.filter((item) => item.value?.startsWith(`${ANNOTATION_STYLE_VALUE}:`) !== true && item.value?.startsWith(`${ANNOTATION_KIND_VALUE}:`) !== true),
      styleBody,
      kindBody,
    ],
  };
}

function annotationStyleFromBodies(bodies?: Array<{ value?: string }>) {
  const styleBody = bodies?.find((body) => body.value?.startsWith(`${ANNOTATION_STYLE_VALUE}:`));
  if (!styleBody?.value) {
    return undefined;
  }
  try {
    return JSON.parse(styleBody.value.slice(ANNOTATION_STYLE_VALUE.length + 1)) as { accentKey: ThemeAccentKey; color: string };
  } catch {
    return undefined;
  }
}

function isPenAnnotation(annotation: W3CImageAnnotation) {
  const body = Array.isArray(annotation.body) ? annotation.body : annotation.body ? [annotation.body] : [];
  return body.some((item) => item.value === `${ANNOTATION_KIND_VALUE}:pen`) || Boolean(penPointsFromAnnotation(annotation).length);
}

function createPenAnnotation(source: string, points: Array<{ x: number; y: number }>): W3CImageAnnotation {
  const id = `pen-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const pointValue = points.map((point) => `${Math.round(point.x * 10) / 10},${Math.round(point.y * 10) / 10}`).join(' ');
  return {
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id,
    type: 'Annotation',
    body: [],
    target: {
      source,
      selector: {
        type: 'SvgSelector',
        value: `<svg viewBox="0 0 1000 1000"><polyline points="${pointValue}" /></svg>`,
      },
    },
  } as unknown as W3CImageAnnotation;
}

function penPointsFromAnnotation(annotation: W3CImageAnnotation) {
  const target = Array.isArray(annotation.target) ? annotation.target[0] : annotation.target;
  if (!target || typeof target === 'string' || !('selector' in target)) return [];
  const selector = Array.isArray(target.selector) ? target.selector[0] : target.selector;
  const value = selector && 'value' in selector ? String(selector.value ?? '') : '';
  const match = value.match(/points="([^"]+)"/);
  if (!match) return [];
  return match[1].split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  }).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

const annotationApi = {
  async list({
    frameNumber,
    projectId,
    shotId,
    signal,
    versionId,
  }: {
    frameNumber: number;
    projectId: string;
    shotId: string;
    signal?: AbortSignal;
    versionId: string;
  }): Promise<StoredAnnotation[]> {
    const params = new URLSearchParams({
      frame_number: String(frameNumber),
      project_id: projectId,
      shot_id: shotId,
      version_id: versionId,
    });
    const key = annotationStorageKey({ frameNumber, projectId, shotId, versionId });
    try {
      const response = await fetch(`/annotations?${params.toString()}`, { signal });
      if (!response.ok) throw new Error(`Annotation fetch failed: ${response.status}`);
      const annotations = await response.json() as StoredAnnotation[];
      return annotations.map(normalizeStoredAnnotation);
    } catch (error) {
      if (isAbortError(error)) throw error;
      return readLocalAnnotations(key);
    }
  },
  async create(payload: {
    body: W3CImageAnnotation;
    frameNumber: number;
    projectId: string;
    shotId: string;
    userId: string;
    versionId: string;
  }) {
    const key = annotationStorageKey(payload);
    try {
      const response = await fetch('/annotations', {
        body: JSON.stringify({
          body: payload.body,
          frame_number: payload.frameNumber,
          project_id: payload.projectId,
          shot_id: payload.shotId,
          user_id: payload.userId,
          version_id: payload.versionId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Annotation create failed: ${response.status}`);
      const annotation = await response.json() as StoredAnnotation;
      return normalizeStoredAnnotation(annotation);
    } catch {
      const id = String(payload.body.id ?? `local-${Date.now()}`);
      const annotation = normalizeStoredAnnotation({ id, body: { ...payload.body, id } });
      writeLocalAnnotations(key, [...readLocalAnnotations(key).filter((item) => item.id !== annotation.id), annotation]);
      return annotation;
    }
  },
  async update(annotationId: string, body: W3CImageAnnotation) {
    try {
      const response = await fetch(`/annotations/${encodeURIComponent(annotationId)}`, {
        body: JSON.stringify({ body }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      if (!response.ok) throw new Error(`Annotation update failed: ${response.status}`);
      const annotation = await response.json() as StoredAnnotation;
      return normalizeStoredAnnotation(annotation);
    } catch {
      const annotation = normalizeStoredAnnotation({ id: annotationId, body });
      updateLocalAnnotation(annotationId, annotation.body);
      return annotation;
    }
  },
  async delete(annotationId: string) {
    try {
      const response = await fetch(`/annotations/${encodeURIComponent(annotationId)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Annotation delete failed: ${response.status}`);
    } catch {
      deleteLocalAnnotation(annotationId);
    }
  },
};

function normalizeStoredAnnotation(annotation: StoredAnnotation): StoredAnnotation {
  const id = String(annotation.id ?? annotation.body.id ?? `local-${Date.now()}`);
  return {
    id,
    body: {
      ...annotation.body,
      id,
    },
  };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function annotationStorageKey({
  frameNumber,
  projectId,
  shotId,
  versionId,
}: {
  frameNumber: number;
  projectId: string;
  shotId: string;
  versionId: string;
}) {
  return `relay:annotations:${projectId}:${shotId}:${versionId}:${frameNumber}`;
}

function readLocalAnnotations(key: string): StoredAnnotation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as StoredAnnotation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalAnnotations(key: string, annotations: StoredAnnotation[]) {
  localStorage.setItem(key, JSON.stringify(annotations));
}

function updateLocalAnnotation(annotationId: string, body: W3CImageAnnotation) {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('relay:annotations:'))
    .forEach((key) => {
      const next = readLocalAnnotations(key).map((annotation) => (annotation.id === annotationId ? { ...annotation, body } : annotation));
      writeLocalAnnotations(key, next);
    });
}

function deleteLocalAnnotation(annotationId: string) {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('relay:annotations:'))
    .forEach((key) => {
      const next = readLocalAnnotations(key).filter((annotation) => annotation.id !== annotationId);
      writeLocalAnnotations(key, next);
    });
}

function TaskPane({
  accentKey,
  activeTheme,
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
  accentKey: ThemeAccentKey;
  activeTheme: ThemeDefinition;
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
  onAddComment: (body: string, versionId: string, metadata?: Pick<TaskComment, 'annotationIds' | 'frameNumber'>) => void;
  onAddSubtask: (title: string) => void;
  onUpdateField: <K extends 'status' | 'phase' | 'priority' | 'assignee'>(field: K, value: Task[K]) => void;
  onToggleFollow: () => void;
}) {
  const progress = progressFor(task);
  const editable = canEditTask(currentUser, task.assignee);
  const assignedUser = currentUser.name === task.assignee;
  const following = task.followers.includes(currentUser.name);
  const [versionId, setVersionId] = React.useState(task.reviewVersions[task.reviewVersions.length - 1]?.id ?? '');
  const [composer, setComposer] = React.useState('');
  const [fullscreen, setFullscreen] = React.useState(false);
  const activeVersion = task.reviewVersions.find((version) => version.id === versionId) ?? task.reviewVersions[0];
  const activeVersionIndex = task.reviewVersions.findIndex((version) => version.id === activeVersion?.id);
  const rightOffset = paneWidths.slice(paneIndex + 1).reduce((sum, paneWidth) => sum + paneWidth, 0);

  React.useEffect(() => {
    if (!task.reviewVersions.some((version) => version.id === versionId)) {
      setVersionId(task.reviewVersions[task.reviewVersions.length - 1]?.id ?? '');
    }
  }, [task.reviewVersions, versionId]);

  const stepVersion = (direction: -1 | 1) => {
    if (task.reviewVersions.length === 0 || activeVersionIndex < 0) {
      return;
    }
    const nextIndex = (activeVersionIndex + direction + task.reviewVersions.length) % task.reviewVersions.length;
    setVersionId(task.reviewVersions[nextIndex].id);
  };

  const sendComment = (metadata?: Pick<TaskComment, 'annotationIds' | 'frameNumber'>, fallbackBody?: string) => {
    if (!activeVersion) {
      return;
    }
    onAddComment(composer || fallbackBody || '', activeVersion.id, metadata);
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
        aria-label="Deliverable pane"
        data-testid="task-pane"
        style={{ right: rightOffset, width, zIndex: 10 + paneIndex }}
      >
        <button
          aria-label="Resize deliverable pane"
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
          <button aria-label="Close deliverable pane" className="icon-button" onClick={onClose} type="button">
            <PanelRightClose size={16} aria-hidden="true" />
          </button>
          <div>
            <p>{projectName}</p>
            <h2>{task.title}</h2>
          </div>
        </header>
        <TaskReviewPanel
          onOpenVersion={(nextVersionId) => {
            setVersionId(nextVersionId);
            setFullscreen(true);
          }}
          onStepVersion={stepVersion}
          onVersionChange={setVersionId}
          task={task}
          version={activeVersion}
        />
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
            <h3>Subdeliverables</h3>
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
                    <span>{comment.date} / {addressedVersion?.label ?? comment.versionId}{comment.frameNumber ? ` / Frame ${comment.frameNumber}` : ''}</span>
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
              <button aria-label="Add subdeliverable" className="icon-button" onClick={addComposerSubtask} type="button">
                <Plus size={14} aria-hidden="true" />
              </button>
              <button aria-label="Attach" className="icon-button" type="button">
                <Paperclip size={14} aria-hidden="true" />
              </button>
              <button aria-label="Send comment" className="icon-button" onClick={() => sendComment()} type="button">
                <Send size={14} aria-hidden="true" />
              </button>
            </div>
            <textarea aria-label={`Message for ${task.title}`} value={composer} onChange={(event) => setComposer(event.target.value)} />
          </div>
        </section>
      </aside>
      {fullscreen && activeVersion && (
        <FullscreenReview
          accentKey={accentKey}
          activeTheme={activeTheme}
          composer={composer}
          currentUser={currentUser}
          onClose={() => setFullscreen(false)}
          onComposerChange={setComposer}
          onSendComment={sendComment}
          onVersionChange={setVersionId}
          task={task}
          version={activeVersion}
        />
      )}
    </>
  );
}

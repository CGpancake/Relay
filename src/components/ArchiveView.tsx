import React from 'react';
import { ChevronRight, Crosshair, LocateFixed, RotateCcw, Search, SlidersHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
import { phaseLabels, phases, priorityLabels, projectTags, projectTools, statusLabels, statuses } from '../data/labels';
import { studios } from '../data/studios';
import type { ArchiveState, Person, Project, ProjectTag, ProjectTool, Task, TaskPhase, TaskStatus } from '../types';

type ArchiveFilters = {
  search: string;
  tag: 'all' | ProjectTag;
  tool: 'all' | ProjectTool;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
  active: boolean;
  archived: boolean;
  visibleTypes: Record<GraphNodeType, boolean>;
};

const defaultVisibleTypes: Record<GraphNodeType, boolean> = {
  studio: true,
  project: true,
  deliverable: true,
  subdeliverable: true,
  tag: true,
  tool: true,
  user: true,
  status: true,
  phase: true,
  priority: true,
};

export function ArchiveView({
  activeProjects,
  archive,
  currentUser,
  onRestoreProject,
  onRestoreTask,
}: {
  activeProjects: Project[];
  archive: ArchiveState;
  currentUser: Person;
  onRestoreProject: (projectId: string) => void;
  onRestoreTask: (taskId: string) => void;
}) {
  const [filters, setFilters] = React.useState<ArchiveFilters>({
    search: '',
    tag: 'all',
    tool: 'all',
    status: 'all',
    phase: 'all',
    active: true,
    archived: true,
    visibleTypes: defaultVisibleTypes,
  });
  const [numbersOpen, setNumbersOpen] = React.useState(false);
  const archivedProjectIds = new Set(archive.projects.map((project) => project.id));
  const allProjects = [...activeProjects, ...archive.projects];
  const projectById = new Map(allProjects.map((project) => [project.id, project]));
  const normalizedSearch = filters.search.trim().toLowerCase();
  const matchesProjectFilters = (project: Project) => {
    const isArchived = archivedProjectIds.has(project.id);
    const searchable = `${project.name} ${project.tags.join(' ')} ${project.tools.join(' ')}`.toLowerCase();
    return (
      (filters.active || isArchived) &&
      (filters.archived || !isArchived) &&
      (filters.tag === 'all' || project.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project.tools.includes(filters.tool)) &&
      (!normalizedSearch || searchable.includes(normalizedSearch))
    );
  };
  const graphProjects = allProjects.filter(matchesProjectFilters);
  const filteredProjects = filters.visibleTypes.project ? graphProjects : [];
  const filteredTasks = archive.tasks.filter((task) => {
    const project = projectById.get(task.projectId);
    const taskSearchable = `${task.title} ${statusLabels[task.status]} ${phaseLabels[task.phase]} ${priorityLabels[task.priority]} ${project?.name ?? ''}`.toLowerCase();
    return (
      filters.archived &&
      filters.visibleTypes.deliverable &&
      (filters.status === 'all' || task.status === filters.status) &&
      (filters.phase === 'all' || task.phase === filters.phase) &&
      (filters.tag === 'all' || project?.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project?.tools.includes(filters.tool)) &&
      (!normalizedSearch || taskSearchable.includes(normalizedSearch))
    );
  });
  const filteredSubtasks = archive.subtasks.filter((subtask) => {
    const project = projectById.get(subtask.projectId);
    const parentTask = archive.tasks.find((task) => task.id === subtask.taskId);
    const subtaskSearchable = `${subtask.title} ${subtask.taskTitle} ${project?.name ?? ''}`.toLowerCase();
    return (
      filters.archived &&
      filters.visibleTypes.subdeliverable &&
      (filters.status === 'all' || parentTask?.status === filters.status) &&
      (filters.phase === 'all' || parentTask?.phase === filters.phase) &&
      (filters.tag === 'all' || project?.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project?.tools.includes(filters.tool)) &&
      (!normalizedSearch || subtaskSearchable.includes(normalizedSearch))
    );
  });
  const completedTaskCount = archive.tasks.filter((task) => task.status === 'done').length;
  const totalSubtasks = archive.tasks.reduce((sum, task) => sum + task.subtasks.length, 0) + archive.subtasks.length;
  const completedSubtasks =
    archive.tasks.reduce((sum, task) => sum + task.subtasks.filter((subtask) => subtask.done).length, 0) +
    archive.subtasks.filter((subtask) => subtask.done).length;
  const studioCounts = studios.map((studio) => ({
    ...studio,
    count: allProjects.filter((project) => project.studioId === studio.id).length,
  }));

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Archive</p>
          <h1>archive</h1>
        </div>
        <div className="header-stats">
          <span>{activeProjects.length} active</span>
          <span>{archive.projects.length} archived projects</span>
          <span>{archive.tasks.length} deliverables</span>
          <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>

      <section className="archive-layout">
        <section className="archive-workspace">
          <ArchiveFilterPanel filters={filters} setFilters={setFilters} />

          <section className="archive-graph-panel" aria-label="Archive relationship graph">
            <header>
              <div>
                <h2>relationship graph</h2>
                <p>{filteredProjects.length} projects / {filteredTasks.length} archived deliverables</p>
              </div>
            </header>
            <ArchiveRelationshipGraph
              archive={archive}
              filteredProjects={graphProjects}
              filteredSubtasks={filteredSubtasks}
              filteredTasks={filteredTasks}
              visibleTypes={filters.visibleTypes}
            />
          </section>
        </section>

        <section className={`archive-numbers ${numbersOpen ? 'is-open' : ''}`} aria-label="Archive numbers">
          <button
            aria-expanded={numbersOpen}
            className="archive-numbers-toggle"
            onClick={() => setNumbersOpen((open) => !open)}
            type="button"
          >
            <span>Archive numbers</span>
            <strong>{activeProjects.length} active / {archive.projects.length} archived projects / {archive.tasks.length} deliverables</strong>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
          {numbersOpen && (
            <section className="archive-summary" aria-label="Archive summary">
              <Stat emphasis="active" label="Active projects" value={activeProjects.length} />
              <Stat label="Archived projects" value={archive.projects.length} />
              <Stat label="Archived deliverables" value={archive.tasks.length} />
              <Stat label="Completed deliverables" value={completedTaskCount} />
              <Stat label="Subdeliverables" value={`${completedSubtasks}/${totalSubtasks}`} />
              {studioCounts.map((studio) => (
                <Stat key={studio.id} label={`${studio.shortName} studio`} value={studio.count} />
              ))}
              {projectTags.map((tag) => (
                <Stat key={tag} label={`${tag} projects`} value={allProjects.filter((project) => project.tags.includes(tag)).length} />
              ))}
              {projectTools.map((tool) => (
                <Stat key={tool} label={tool} value={allProjects.filter((project) => project.tools.includes(tool)).length} />
              ))}
            </section>
          )}
        </section>

        <section className="archive-table" aria-label="Projects in archive report">
          <h2>projects</h2>
          {filteredProjects.length === 0 ? (
            <p className="empty-row">No matching projects</p>
          ) : (
            filteredProjects.map((project) => {
              const isArchived = archivedProjectIds.has(project.id);
              return (
                <article
                  className={`archive-row archive-project-row ${isArchived ? 'is-archived' : 'is-active'}`}
                  data-testid={`archive-project-${project.id}`}
                  key={project.id}
                >
                  <strong>{project.name}</strong>
                  <small>{project.tags.join(', ')} / {project.tools.join(', ')}</small>
                  {isArchived ? (
                    <button className="secondary-action" onClick={() => onRestoreProject(project.id)} type="button">
                      <RotateCcw size={15} aria-hidden="true" />
                      Restore
                    </button>
                  ) : (
                    <span className="archive-active-status">Active</span>
                  )}
                </article>
              );
            })
          )}
        </section>

        <section className="archive-table" aria-label="Archived deliverables">
          <h2>deliverables and subdeliverables</h2>
          {filteredTasks.map((task) => (
            <article className="archive-row" data-testid={`archive-task-${task.id}`} key={task.id}>
              <strong>{task.title}</strong>
              <span>{statusLabels[task.status]} / {phaseLabels[task.phase]}</span>
              <small>{projectById.get(task.projectId)?.name ?? task.projectId}</small>
              {!archivedProjectIds.has(task.projectId) && (
                <button className="secondary-action" onClick={() => onRestoreTask(task.id)} type="button">
                  <RotateCcw size={15} aria-hidden="true" />
                  Restore
                </button>
              )}
            </article>
          ))}
          {filteredSubtasks.map((subtask) => (
            <article className="archive-row" data-testid={`archive-subtask-${subtask.id}`} key={`${subtask.taskId}-${subtask.id}`}>
              <strong>{subtask.title}</strong>
              <span>{subtask.done ? 'Done' : 'Open'}</span>
              <small>{subtask.taskTitle}</small>
            </article>
          ))}
          {filteredTasks.length === 0 && filteredSubtasks.length === 0 && <p className="empty-row">No archived deliverables or subdeliverables</p>}
        </section>
      </section>
    </>
  );
}

function Stat({ emphasis, label, value }: { emphasis?: 'active'; label: string; value: React.ReactNode }) {
  return (
    <div className={emphasis === 'active' ? 'stat-active' : undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ArchiveFilterPanel({
  filters,
  setFilters,
}: {
  filters: ArchiveFilters;
  setFilters: React.Dispatch<React.SetStateAction<ArchiveFilters>>;
}) {
  const setVisibleType = (type: GraphNodeType, value: boolean) => {
    setFilters((current) => ({ ...current, visibleTypes: { ...current.visibleTypes, [type]: value } }));
  };

  return (
    <aside className="filters archive-filters" aria-label="Archive filters" data-testid="archive-filter-panel">
      <header>
        <span>Archive filters</span>
        <button onClick={() => setFilters((current) => ({ ...current, search: '', tag: 'all', tool: 'all', status: 'all', phase: 'all', active: true, archived: true, visibleTypes: defaultVisibleTypes }))} type="button">
          Reset
        </button>
      </header>
      <label className="archive-search">
        Search
        <span>
          <Search size={14} aria-hidden="true" />
          <input
            aria-label="Search archive"
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search archive"
            type="text"
            value={filters.search}
          />
        </span>
      </label>
      <section className="archive-filter-section" aria-label="Project filters">
        <span>Projects</span>
        <label>
          Project tag
          <select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value as ArchiveFilters['tag'] }))}>
            <option value="all">All tags</option>
            {projectTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project tool
          <select value={filters.tool} onChange={(event) => setFilters((current) => ({ ...current, tool: event.target.value as ArchiveFilters['tool'] }))}>
            <option value="all">All tools</option>
            {projectTools.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="archive-filter-section" aria-label="Deliverable filters">
        <span>Deliverables</span>
        <label>
          Deliverable status
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ArchiveFilters['status'] }))}>
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Deliverable phase
          <select value={filters.phase} onChange={(event) => setFilters((current) => ({ ...current, phase: event.target.value as ArchiveFilters['phase'] }))}>
            <option value="all">All phases</option>
            {phases.map((phase) => (
              <option key={phase} value={phase}>
                {phaseLabels[phase]}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="archive-filter-section" aria-label="Archive state filters">
        <span>State</span>
        <label><input checked={filters.active} onChange={(event) => setFilters((current) => ({ ...current, active: event.target.checked }))} type="checkbox" /> Active</label>
        <label><input checked={filters.archived} onChange={(event) => setFilters((current) => ({ ...current, archived: event.target.checked }))} type="checkbox" /> Archived</label>
      </section>
      <section className="archive-filter-section" aria-label="Graph entity filters">
        <span>Entities</span>
        {(Object.keys(graphTypeLabels) as GraphNodeType[]).map((type) => (
          <label key={type}>
            <input checked={filters.visibleTypes[type]} onChange={(event) => setVisibleType(type, event.target.checked)} type="checkbox" />
            {graphTypeLabels[type]}
          </label>
        ))}
      </section>
    </aside>
  );
}

type GraphNodeType = 'studio' | 'project' | 'deliverable' | 'subdeliverable' | 'tag' | 'tool' | 'user' | 'status' | 'phase' | 'priority';
type ArchiveGraphState = 'active' | 'archived';

type GraphNode = {
  id: string;
  label: string;
  type: GraphNodeType;
  details: string;
  state: ArchiveGraphState;
  archived?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  directed?: boolean;
};

type GraphView = {
  x: number;
  y: number;
  scale: number;
};

type GraphSettings = {
  controlsOpen: boolean;
  labels: boolean;
  arrows: boolean;
  nodeSize: number;
  linkThickness: number;
  centerForce: number;
  repelForce: number;
  linkForce: number;
  linkDistance: number;
};

const graphTypeLabels: Record<GraphNodeType, string> = {
  studio: 'Studios',
  project: 'Projects',
  deliverable: 'Deliverables',
  subdeliverable: 'Subdeliverables',
  tag: 'Tags',
  tool: 'Tools',
  user: 'Users',
  status: 'Status',
  phase: 'Phase',
  priority: 'Priority',
};

const defaultGraphSettings: GraphSettings = {
  controlsOpen: false,
  labels: true,
  arrows: false,
  nodeSize: 1,
  linkThickness: 0.5,
  centerForce: 0,
  repelForce: 0.2,
  linkForce: 0.2,
  linkDistance: 0.6,
};

function ArchiveRelationshipGraph({
  archive,
  filteredProjects,
  filteredSubtasks,
  filteredTasks,
  visibleTypes,
}: {
  archive: ArchiveState;
  filteredProjects: Project[];
  filteredSubtasks: ArchiveState['subtasks'];
  filteredTasks: Task[];
  visibleTypes: Record<GraphNodeType, boolean>;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const nodesRef = React.useRef<GraphNode[]>([]);
  const viewRef = React.useRef<GraphView>({ x: 0, y: 0, scale: 1 });
  const dragRef = React.useRef<{ mode: 'node'; id: string; dx: number; dy: number } | { mode: 'pan'; x: number; y: number; view: GraphView } | null>(null);
  const manualViewRef = React.useRef(false);
  const autoFitFramesRef = React.useRef(0);
  const [settings, setSettings] = React.useState<GraphSettings>(defaultGraphSettings);
  const [size, setSize] = React.useState({ width: 760, height: 420 });
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [frame, setFrame] = React.useState(0);
  const baseGraph = React.useMemo(
    () => buildArchiveGraph(archive, filteredProjects, filteredTasks, filteredSubtasks, size.width, size.height),
    [archive, filteredProjects, filteredSubtasks, filteredTasks, size.height, size.width],
  );
  const graph = React.useMemo(() => filterGraph(baseGraph, visibleTypes), [baseGraph, visibleTypes]);

  React.useEffect(() => {
    const existing = new Map(nodesRef.current.map((node) => [node.id, node]));
    nodesRef.current = graph.nodes.map((node) => ({ ...node, ...(existing.has(node.id) ? pickPosition(existing.get(node.id)!) : {}) }));
    if (!manualViewRef.current) autoFitFramesRef.current = 60;
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setFrame((value) => value + 1);
  }, [graph]);

  React.useEffect(() => {
    if (manualViewRef.current || nodesRef.current.length === 0) return undefined;
    autoFitFramesRef.current = Math.max(autoFitFramesRef.current, 60);
    const rafs: number[] = [];
    const timeouts = [0, 180, 420, 700].map((delay) => window.setTimeout(() => {
      const raf = window.requestAnimationFrame(() => {
        if (manualViewRef.current) return;
        fitView(nodesRef.current, size, viewRef);
        setFrame((value) => value + 1);
      });
      rafs.push(raf);
    }, delay));
    return () => {
      rafs.forEach((raf) => window.cancelAnimationFrame(raf));
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [graph.nodes.length, size]);

  React.useEffect(() => {
    if (!wrapRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(360, Math.floor(entry.contentRect.width));
      const height = Math.max(320, Math.floor(entry.contentRect.height));
      setSize({ width, height });
    });
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let raf = window.requestAnimationFrame(() => undefined);
    const tick = () => {
      stepGraph(nodesRef.current, graph.edges, size.width, size.height, settings, dragRef.current?.mode === 'node' ? dragRef.current.id : null);
      if (!manualViewRef.current && autoFitFramesRef.current > 0) {
        fitView(nodesRef.current, size, viewRef);
        autoFitFramesRef.current -= 1;
      }
      drawGraph(canvasRef.current, nodesRef.current, graph.edges, viewRef.current, size, settings, selectedNodeId, hoveredNodeId);
      setFrame((value) => value + 1);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [graph.edges, hoveredNodeId, selectedNodeId, settings, size]);

  const nodes = nodesRef.current;
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const focusId = hoveredNodeId ?? selectedNodeId;
  const neighborIds = React.useMemo(() => neighborsFor(graph.edges, focusId), [graph.edges, focusId]);
  const focusedNode = focusId ? nodeById.get(focusId) : undefined;

  const graphPoint = (event: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const view = viewRef.current;
    return {
      x: (event.clientX - rect.left - view.x) / view.scale,
      y: (event.clientY - rect.top - view.y) / view.scale,
    };
  };

  const hitNode = (event: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>, slack = 4) => {
    const point = graphPoint(event);
    return [...nodesRef.current].reverse().find((node) => distance(point, node) <= nodeRadius(node, settings) + slack);
  };

  const setZoom = (scale: number, anchor = { x: size.width / 2, y: size.height / 2 }) => {
    manualViewRef.current = true;
    const view = viewRef.current;
    const world = { x: (anchor.x - view.x) / view.scale, y: (anchor.y - view.y) / view.scale };
    const nextScale = clamp(scale, 0.35, 2.8);
    viewRef.current = {
      x: anchor.x - world.x * nextScale,
      y: anchor.y - world.y * nextScale,
      scale: nextScale,
    };
    setFrame((value) => value + 1);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      manualViewRef.current = true;
      const rect = canvas.getBoundingClientRect();
      setZoom(viewRef.current.scale * (event.deltaY > 0 ? 0.9 : 1.1), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  });

  const fitGraph = () => {
    manualViewRef.current = true;
    fitView(nodesRef.current, size, viewRef);
    setFrame((value) => value + 1);
  };

  const resetGraph = () => {
    manualViewRef.current = true;
    viewRef.current = { x: 0, y: 0, scale: 1 };
    nodesRef.current = graph.nodes.map((node) => ({ ...node }));
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setFrame((value) => value + 1);
  };

  return (
    <div
      className="archive-graph graph-view"
      data-edge-count={graph.edges.length}
      data-frame={frame}
      data-node-count={graph.nodes.length}
      data-view-x={viewRef.current.x.toFixed(2)}
      data-view-y={viewRef.current.y.toFixed(2)}
      data-zoom={viewRef.current.scale.toFixed(3)}
      data-testid="archive-graph"
    >
      <div className="archive-graph-canvas-wrap" ref={wrapRef}>
        <canvas
        aria-label="Archive graph canvas"
        data-testid="archive-graph-canvas"
        ref={canvasRef}
        onPointerDown={(event) => {
          manualViewRef.current = true;
          if (event.button === 1) {
            event.preventDefault();
            dragRef.current = { mode: 'pan', x: event.clientX, y: event.clientY, view: { ...viewRef.current } };
            event.currentTarget.setPointerCapture(event.pointerId);
            return;
          }
          const node = hitNode(event, 52 / viewRef.current.scale);
          if (node) {
            const point = graphPoint(event);
            dragRef.current = { mode: 'node', id: node.id, dx: point.x - node.x, dy: point.y - node.y };
            node.fixed = true;
            setSelectedNodeId(node.id);
          } else {
            dragRef.current = { mode: 'pan', x: event.clientX, y: event.clientY, view: { ...viewRef.current } };
          }
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onAuxClick={(event) => event.preventDefault()}
        onMouseDown={(event) => {
          if (event.button === 1) event.preventDefault();
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (drag?.mode === 'node') {
            const point = graphPoint(event);
            const node = nodesRef.current.find((candidate) => candidate.id === drag.id);
            if (node) {
              node.x = point.x - drag.dx;
              node.y = point.y - drag.dy;
              node.vx = 0;
              node.vy = 0;
            }
          } else if (drag?.mode === 'pan') {
            viewRef.current = {
              ...drag.view,
              x: drag.view.x + event.clientX - drag.x,
              y: drag.view.y + event.clientY - drag.y,
            };
          } else {
            setHoveredNodeId(hitNode(event)?.id ?? null);
          }
          setFrame((value) => value + 1);
        }}
        onPointerUp={() => {
          const drag = dragRef.current;
          if (drag?.mode === 'node') {
            const node = nodesRef.current.find((candidate) => candidate.id === drag.id);
            if (node) node.fixed = false;
          }
          dragRef.current = null;
        }}
        onPointerLeave={() => {
          setHoveredNodeId(null);
          dragRef.current = null;
        }}
        onClick={(event) => {
          const node = hitNode(event, 52 / viewRef.current.scale);
          setSelectedNodeId(node?.id ?? null);
        }}
      />
        {focusedNode && (
          <aside className="archive-graph-detail" data-testid="archive-graph-detail">
            <span>{graphTypeLabels[focusedNode.type]}</span>
            <strong>{focusedNode.label}</strong>
            <small>{focusedNode.details}</small>
            <small>{neighborIds.size} linked nodes</small>
          </aside>
        )}
        <div className="archive-graph-toolbar" aria-label="Graph viewport controls">
          <button aria-label="Zoom in graph" className="icon-button" onClick={() => setZoom(viewRef.current.scale * 1.18)} type="button">
            <ZoomIn size={15} aria-hidden="true" />
          </button>
          <button aria-label="Zoom out graph" className="icon-button" onClick={() => setZoom(viewRef.current.scale * 0.84)} type="button">
            <ZoomOut size={15} aria-hidden="true" />
          </button>
          <button aria-label="Fit graph" className="icon-button" onClick={fitGraph} type="button">
            <LocateFixed size={15} aria-hidden="true" />
          </button>
          <button aria-label="Reset graph" className="icon-button" onClick={resetGraph} type="button">
            <Crosshair size={15} aria-hidden="true" />
          </button>
        </div>
        <GraphControls settings={settings} setSettings={setSettings} />
      </div>
      <div className="graph-legend" aria-label="Graph node types">
        {(Object.keys(graphTypeLabels) as GraphNodeType[]).map((type) => (
          <span data-muted={!visibleTypes[type]} key={type} style={{ '--legend-color': graphNodeToken(type) } as React.CSSProperties}>{graphTypeLabels[type]}</span>
        ))}
      </div>
    </div>
  );
}

function GraphControls({
  settings,
  setSettings,
}: {
  settings: GraphSettings;
  setSettings: React.Dispatch<React.SetStateAction<GraphSettings>>;
}) {
  return (
    <aside className={`graph-controls ${settings.controlsOpen ? '' : 'is-close'}`} aria-label="Graph controls" data-testid="archive-graph-controls">
      <button
        aria-label={settings.controlsOpen ? 'Collapse graph controls' : 'Open graph controls'}
        className="graph-controls-button"
        onClick={() => setSettings((current) => ({ ...current, controlsOpen: !current.controlsOpen }))}
        type="button"
      >
        {settings.controlsOpen ? <ChevronRight size={15} aria-hidden="true" /> : <SlidersHorizontal size={15} aria-hidden="true" />}
      </button>
      {settings.controlsOpen && (
        <>
          <section className="graph-control-section mod-display">
            <h3>Display</h3>
            <label><input checked={settings.labels} onChange={(event) => setSettings((current) => ({ ...current, labels: event.target.checked }))} type="checkbox" /> Labels</label>
            <label><input checked={settings.arrows} onChange={(event) => setSettings((current) => ({ ...current, arrows: event.target.checked }))} type="checkbox" /> Arrows</label>
            <GraphRange label="Node size" max={1.8} min={0.6} onChange={(nodeSize) => setSettings((current) => ({ ...current, nodeSize }))} step={0.1} value={settings.nodeSize} />
            <GraphRange label="Link thickness" max={2.2} min={0.5} onChange={(linkThickness) => setSettings((current) => ({ ...current, linkThickness }))} step={0.1} value={settings.linkThickness} />
          </section>
          <section className="graph-control-section">
            <h3>Forces</h3>
            <GraphRange label="Center force" max={1.8} min={0} onChange={(centerForce) => setSettings((current) => ({ ...current, centerForce }))} step={0.1} value={settings.centerForce} />
            <GraphRange label="Repel force" max={2.4} min={0.2} onChange={(repelForce) => setSettings((current) => ({ ...current, repelForce }))} step={0.1} value={settings.repelForce} />
            <GraphRange label="Link force" max={2} min={0.2} onChange={(linkForce) => setSettings((current) => ({ ...current, linkForce }))} step={0.1} value={settings.linkForce} />
            <GraphRange label="Link distance" max={1.8} min={0.6} onChange={(linkDistance) => setSettings((current) => ({ ...current, linkDistance }))} step={0.1} value={settings.linkDistance} />
          </section>
        </>
      )}
    </aside>
  );
}

function GraphRange({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  return (
    <label className="graph-range">
      <span>{label}</span>
      <input aria-label={label} max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} step={step} type="range" value={value} />
    </label>
  );
}

function buildArchiveGraph(
  archive: ArchiveState,
  filteredProjects: Project[],
  filteredTasks: Task[],
  filteredSubtasks: ArchiveState['subtasks'],
  width: number,
  height: number,
) {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const archivedProjectIds = new Set(archive.projects.map((project) => project.id));
  const taskIds = new Set(filteredTasks.map((task) => task.id));

  const addNode = (id: string, label: string, type: GraphNodeType, archived = false, details = graphTypeLabels[type]) => {
    if (!nodes.has(id)) {
      const center = graphClusterCenter(type, width, height);
      const clusterIndex = [...nodes.values()].filter((node) => node.type === type).length;
      const angle = clusterIndex * 2.399 + nodes.size * 0.19;
      const radius = 18 + (clusterIndex % 9) * 13;
      nodes.set(id, {
        id,
        label,
        type,
        details,
        state: archived ? 'archived' : 'active',
        archived,
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      });
    }
  };
  const addEdge = (source: string, target: string, directed = true) => {
    if (source !== target) {
      edges.set(`${source}->${target}`, { id: `${source}->${target}`, source, target, directed });
    }
  };

  for (const project of filteredProjects) {
    const studio = studios.find((candidate) => candidate.id === project.studioId);
    const studioId = `studio:${project.studioId}`;
    const projectId = `project:${project.id}`;
    addNode(studioId, studio?.shortName ?? project.studioId, 'studio', false, studio?.name ?? project.studioId);
    addNode(projectId, project.name, 'project', archivedProjectIds.has(project.id), `${project.tags.join(', ')} / ${project.tools.join(', ')}`);
    addEdge(studioId, projectId);
    project.tags.forEach((tag) => {
      const tagId = `tag:${tag}`;
      addNode(tagId, tag, 'tag', false, 'Project tag');
      addEdge(projectId, tagId);
    });
    project.tools.forEach((tool) => {
      const toolId = `tool:${tool}`;
      addNode(toolId, tool, 'tool', false, 'Production tool');
      addEdge(projectId, toolId);
    });
  }

  for (const task of filteredTasks) {
    const projectId = `project:${task.projectId}`;
    const taskId = `deliverable:${task.id}`;
    addNode(taskId, task.title, 'deliverable', true, `${statusLabels[task.status]} / ${phaseLabels[task.phase]} / ${priorityLabels[task.priority]}`);
    if (nodes.has(projectId)) addEdge(projectId, taskId);
    const userId = `user:${task.assignee}`;
    const statusId = `status:${task.status}`;
    const phaseId = `phase:${task.phase}`;
    const priorityId = `priority:${task.priority}`;
    addNode(userId, task.assignee, 'user', false, 'Assignee');
    addNode(statusId, statusLabels[task.status], 'status', false, 'Deliverable status');
    addNode(phaseId, phaseLabels[task.phase], 'phase', false, 'Production phase');
    addNode(priorityId, priorityLabels[task.priority], 'priority', false, 'Priority');
    addEdge(taskId, userId);
    addEdge(taskId, statusId);
    addEdge(taskId, phaseId);
    addEdge(taskId, priorityId);
  }

  for (const subtask of filteredSubtasks) {
    if (!taskIds.has(subtask.taskId)) continue;
    const subtaskId = `subdeliverable:${subtask.taskId}:${subtask.id}`;
    addNode(subtaskId, subtask.title, 'subdeliverable', true, subtask.done ? 'Done' : 'Open');
    addEdge(`deliverable:${subtask.taskId}`, subtaskId);
  }

  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}

function graphClusterCenter(type: GraphNodeType, width: number, height: number) {
  const centers: Record<GraphNodeType, { x: number; y: number }> = {
    studio: { x: width * 0.24, y: height * 0.26 },
    project: { x: width * 0.42, y: height * 0.42 },
    deliverable: { x: width * 0.62, y: height * 0.52 },
    subdeliverable: { x: width * 0.78, y: height * 0.66 },
    tag: { x: width * 0.34, y: height * 0.78 },
    tool: { x: width * 0.54, y: height * 0.78 },
    user: { x: width * 0.78, y: height * 0.3 },
    status: { x: width * 0.72, y: height * 0.18 },
    phase: { x: width * 0.88, y: height * 0.42 },
    priority: { x: width * 0.88, y: height * 0.82 },
  };
  return centers[type];
}

function filterGraph(graph: { nodes: GraphNode[]; edges: GraphEdge[] }, visibleTypes: Record<GraphNodeType, boolean>) {
  const visibleNodes = graph.nodes.filter((node) => visibleTypes[node.type]);
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  return {
    nodes: visibleNodes,
    edges: graph.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
  };
}

function neighborsFor(edges: GraphEdge[], focusId: string | null) {
  const neighbors = new Set<string>();
  if (!focusId) return neighbors;
  for (const edge of edges) {
    if (edge.source === focusId) neighbors.add(edge.target);
    if (edge.target === focusId) neighbors.add(edge.source);
  }
  return neighbors;
}

function stepGraph(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number, settings: GraphSettings, draggedNodeId: string | null) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x || 0.01;
      const dy = a.y - b.y || 0.01;
      const distanceSq = Math.max(dx * dx + dy * dy, 64);
      const force = (2200 * settings.repelForce) / distanceSq;
      const fx = dx * force;
      const fy = dy * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }
  }
  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDistance = (source.type === 'project' && target.type === 'deliverable' ? 120 : 86) * settings.linkDistance;
    const force = (distance - targetDistance) * 0.008 * settings.linkForce;
    const fx = (dx / distance) * force;
    const fy = (dy / distance) * force;
    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }
  for (const node of nodes) {
    if (node.id !== draggedNodeId && !node.fixed) {
      node.vx += (width / 2 - node.x) * 0.0008 * settings.centerForce;
      node.vy += (height / 2 - node.y) * 0.0008 * settings.centerForce;
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < -80 || node.x > width + 80) node.vx += (width / 2 - node.x) * 0.0016;
      if (node.y < -80 || node.y > height + 80) node.vy += (height / 2 - node.y) * 0.0016;
    }
    node.vx *= 0.86;
    node.vy *= 0.86;
  }
}

function drawGraph(
  canvas: HTMLCanvasElement | null,
  nodes: GraphNode[],
  edges: GraphEdge[],
  view: GraphView,
  size: { width: number; height: number },
  settings: GraphSettings,
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(size.width * dpr) || canvas.height !== Math.floor(size.height * dpr)) {
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const styles = getComputedStyle(canvas);
  const colors = {
    bg: css(styles, '--bg'),
    text: css(styles, '--ink'),
    muted: css(styles, '--ink-3'),
    edge: css(styles, '--line'),
    edgeSoft: css(styles, '--line-s'),
    accent: css(styles, '--color-active'),
    active: css(styles, '--color-active'),
    success: css(styles, '--color-success'),
    pending: css(styles, '--color-pending'),
    special: css(styles, '--color-special'),
    danger: css(styles, '--color-danger'),
    ink2: css(styles, '--ink-2'),
    panel: css(styles, '--bg-elevated', css(styles, '--bg')),
  };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = colors.panel;
  ctx.fillRect(0, 0, size.width, size.height);
  drawGrid(ctx, size, view, colors.edgeSoft);
  ctx.save();
  ctx.translate(view.x, view.y);
  ctx.scale(view.scale, view.scale);
  const focusId = hoveredNodeId ?? selectedNodeId;
  const neighbors = neighborsFor(edges, focusId);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) continue;
    const highlighted = Boolean(focusId) && (edge.source === focusId || edge.target === focusId || (neighbors.has(edge.source) && neighbors.has(edge.target)));
    ctx.globalAlpha = focusId ? (highlighted ? 0.9 : 0.42) : 0.68;
    ctx.strokeStyle = highlighted ? colors.accent : colors.edge;
    ctx.lineWidth = Math.max(0.85, settings.linkThickness) / view.scale;
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    if (settings.arrows && edge.directed) drawArrow(ctx, source, target, highlighted ? colors.accent : colors.edge, settings.linkThickness / view.scale, highlighted || !focusId);
  }
  for (const node of nodes) {
    const focused = node.id === focusId;
    const emphasized = !focusId || focused || neighbors.has(node.id);
    ctx.globalAlpha = emphasized ? 1 : 0.24;
    drawNode(ctx, node, colors, settings, focused);
    if (settings.labels && !focusId) drawLabel(ctx, node, colors, focused, view.scale);
  }
  if (focusId) {
    for (const node of nodes) {
      const focused = node.id === focusId;
      if (!focused && !neighbors.has(node.id) && !settings.labels) continue;
      if (!focused && !neighbors.has(node.id)) continue;
      ctx.globalAlpha = focused ? 1 : 0.88;
      drawLabel(ctx, node, colors, focused, view.scale);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawGrid(ctx: CanvasRenderingContext2D, size: { width: number; height: number }, view: GraphView, color: string) {
  const step = 36 * view.scale;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 1;
  for (let x = view.x % step; x < size.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size.height);
    ctx.stroke();
  }
  for (let y = view.y % step; y < size.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size.width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawNode(ctx: CanvasRenderingContext2D, node: GraphNode, colors: Record<string, string>, settings: GraphSettings, focused: boolean) {
  const radius = nodeRadius(node, settings);
  const alpha = ctx.globalAlpha;
  ctx.fillStyle = focused ? colors.accent : graphNodeColor(node.type, colors);
  ctx.strokeStyle = focused ? colors.accent : colors.edgeSoft;
  ctx.lineWidth = focused ? 1.8 : 0.8;
  ctx.beginPath();
  ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (focused) {
    ctx.globalAlpha = alpha * 0.22;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha;
  } else if (node.archived) {
    ctx.globalAlpha = alpha * 0.28;
    ctx.strokeStyle = colors.panel;
    ctx.lineWidth = Math.max(1, radius * 0.36);
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.max(2, radius * 0.42), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }
}

function drawLabel(ctx: CanvasRenderingContext2D, node: GraphNode, colors: Record<string, string>, focused: boolean, scale: number) {
  if (scale < 0.45 && !focused) return;
  const radius = nodeRadius(node, defaultGraphSettings);
  ctx.font = `${focused ? 700 : 600} ${Math.max(8, 10 / scale)}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4 / scale;
  ctx.strokeStyle = colors.panel;
  ctx.fillStyle = focused ? colors.accent : colors.text;
  const label = node.label.length > 28 ? `${node.label.slice(0, 27)}...` : node.label;
  ctx.strokeText(label, node.x + radius + 6, node.y + 1);
  ctx.fillText(label, node.x + radius + 6, node.y + 1);
}

function drawArrow(ctx: CanvasRenderingContext2D, source: GraphNode, target: GraphNode, color: string, width: number, emphasized: boolean) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  const endRadius = nodeRadius(target, defaultGraphSettings) + 4;
  const x = target.x - Math.cos(angle) * endRadius;
  const y = target.y - Math.sin(angle) * endRadius;
  const size = 7 + width;
  ctx.fillStyle = color;
  ctx.globalAlpha = emphasized ? 0.74 : 0.14;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - Math.cos(angle - 0.45) * size, y - Math.sin(angle - 0.45) * size);
  ctx.lineTo(x - Math.cos(angle + 0.45) * size, y - Math.sin(angle + 0.45) * size);
  ctx.closePath();
  ctx.fill();
}

function graphNodeColor(type: GraphNodeType, colors: Record<string, string>) {
  const colorByType: Record<GraphNodeType, string> = {
    studio: colors.active,
    project: colors.success,
    deliverable: colors.pending,
    subdeliverable: colors.active,
    tag: colors.special,
    tool: colors.danger,
    user: colors.ink2,
    status: colors.special,
    phase: colors.danger,
    priority: colors.ink2,
  };
  return colorByType[type];
}

function graphNodeToken(type: GraphNodeType) {
  const tokenByType: Record<GraphNodeType, string> = {
    studio: 'var(--color-active)',
    project: 'var(--color-success)',
    deliverable: 'var(--color-pending)',
    subdeliverable: 'var(--color-active)',
    tag: 'var(--color-special)',
    tool: 'var(--color-danger)',
    user: 'var(--ink-2)',
    status: 'var(--color-special)',
    phase: 'var(--color-danger)',
    priority: 'var(--ink-2)',
  };
  return tokenByType[type];
}

function fitView(nodes: GraphNode[], size: { width: number; height: number }, viewRef: React.MutableRefObject<GraphView>) {
  if (nodes.length === 0) {
    viewRef.current = { x: 0, y: 0, scale: 1 };
    return;
  }
  const minX = Math.min(...nodes.map((node) => node.x));
  const maxX = Math.max(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxY = Math.max(...nodes.map((node) => node.y));
  const graphWidth = Math.max(1, maxX - minX + 120);
  const graphHeight = Math.max(1, maxY - minY + 120);
  const scale = clamp(Math.min(size.width / graphWidth, size.height / graphHeight), 0.35, 2);
  viewRef.current = {
    x: size.width / 2 - ((minX + maxX) / 2) * scale,
    y: size.height / 2 - ((minY + maxY) / 2) * scale,
    scale,
  };
}

function nodeRadius(node: GraphNode, settings: GraphSettings) {
  const base = node.type === 'studio' ? 11 : node.type === 'project' || node.type === 'deliverable' ? 9 : node.type === 'subdeliverable' ? 6 : 7;
  return base * settings.nodeSize;
}

function distance(point: { x: number; y: number }, node: GraphNode) {
  return Math.hypot(point.x - node.x, point.y - node.y);
}

function pickPosition(node: GraphNode) {
  return { x: node.x, y: node.y, vx: node.vx, vy: node.vy };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function css(styles: CSSStyleDeclaration, name: string, fallback = '#000000') {
  return styles.getPropertyValue(name).trim() || fallback;
}

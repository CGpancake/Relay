import React from 'react';
import { RotateCcw } from 'lucide-react';
import { phaseLabels, phases, projectTags, projectTools, statusLabels, statuses } from '../data/labels';
import type { ArchiveState, Person, ProjectTag, ProjectTool, TaskPhase, TaskStatus } from '../types';

type ArchiveFilters = {
  tag: 'all' | ProjectTag;
  tool: 'all' | ProjectTool;
  status: 'all' | TaskStatus;
  phase: 'all' | TaskPhase;
};

export function ArchiveView({
  archive,
  currentUser,
  onRestoreProject,
  onRestoreTask,
}: {
  archive: ArchiveState;
  currentUser: Person;
  onRestoreProject: (projectId: string) => void;
  onRestoreTask: (taskId: string) => void;
}) {
  const [filters, setFilters] = React.useState<ArchiveFilters>({ tag: 'all', tool: 'all', status: 'all', phase: 'all' });
  const archivedProjectIds = new Set(archive.projects.map((project) => project.id));
  const projectById = new Map(archive.projects.map((project) => [project.id, project]));
  const filteredProjects = archive.projects.filter(
    (project) =>
      (filters.tag === 'all' || project.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project.tools.includes(filters.tool)),
  );
  const filteredTasks = archive.tasks.filter((task) => {
    const project = projectById.get(task.projectId);
    return (
      (filters.status === 'all' || task.status === filters.status) &&
      (filters.phase === 'all' || task.phase === filters.phase) &&
      (filters.tag === 'all' || project?.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project?.tools.includes(filters.tool))
    );
  });
  const filteredSubtasks = archive.subtasks.filter((subtask) => {
    const project = projectById.get(subtask.projectId);
    const parentTask = archive.tasks.find((task) => task.id === subtask.taskId);
    return (
      (filters.status === 'all' || parentTask?.status === filters.status) &&
      (filters.phase === 'all' || parentTask?.phase === filters.phase) &&
      (filters.tag === 'all' || project?.tags.includes(filters.tag)) &&
      (filters.tool === 'all' || project?.tools.includes(filters.tool))
    );
  });
  const completedTaskCount = archive.tasks.filter((task) => task.status === 'done').length;
  const totalSubtasks = archive.tasks.reduce((sum, task) => sum + task.subtasks.length, 0) + archive.subtasks.length;
  const completedSubtasks =
    archive.tasks.reduce((sum, task) => sum + task.subtasks.filter((subtask) => subtask.done).length, 0) +
    archive.subtasks.filter((subtask) => subtask.done).length;

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Archive</p>
          <h1>archive</h1>
        </div>
        <div className="header-stats">
          <span>{archive.projects.length} projects</span>
          <span>{archive.tasks.length} tasks</span>
          <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>

      <section className="archive-layout">
        <section className="archive-summary" aria-label="Archive summary">
          <Stat label="Archived projects" value={archive.projects.length} />
          <Stat label="Archived tasks" value={archive.tasks.length} />
          <Stat label="Completed tasks" value={completedTaskCount} />
          <Stat label="Subtasks" value={`${completedSubtasks}/${totalSubtasks}`} />
          {projectTags.map((tag) => (
            <Stat key={tag} label={`${tag} projects`} value={archive.projects.filter((project) => project.tags.includes(tag)).length} />
          ))}
          {projectTools.map((tool) => (
            <Stat key={tool} label={tool} value={archive.projects.filter((project) => project.tools.includes(tool)).length} />
          ))}
        </section>

        <section className="filters archive-filters" aria-label="Archive filters">
          <label>
            Deliverable
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
            Tool
            <select value={filters.tool} onChange={(event) => setFilters((current) => ({ ...current, tool: event.target.value as ArchiveFilters['tool'] }))}>
              <option value="all">All tools</option>
              {projectTools.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
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
            Phase
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

        <section className="archive-table" aria-label="Archived projects">
          <h2>projects</h2>
          {filteredProjects.length === 0 ? (
            <p className="empty-row">No archived projects</p>
          ) : (
            filteredProjects.map((project) => (
              <article className="archive-row" data-testid={`archive-project-${project.id}`} key={project.id}>
                <strong>{project.code}</strong>
                <span>{project.name}</span>
                <small>{project.tags.join(', ')} / {project.tools.join(', ')}</small>
                <button className="secondary-action" onClick={() => onRestoreProject(project.id)} type="button">
                  <RotateCcw size={15} aria-hidden="true" />
                  Restore
                </button>
              </article>
            ))
          )}
        </section>

        <section className="archive-table" aria-label="Archived tasks">
          <h2>tasks and subtasks</h2>
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
          {filteredTasks.length === 0 && filteredSubtasks.length === 0 && <p className="empty-row">No archived tasks or subtasks</p>}
        </section>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

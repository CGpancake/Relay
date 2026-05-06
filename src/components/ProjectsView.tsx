import React from 'react';
import { Archive, ListPlus, Plus, Trash2 } from 'lucide-react';
import { phases, phaseLabels, priorities, priorityLabels, projectTags, projectTools } from '../data/labels';
import { canCreateProject } from '../lib/permissions';
import type { Person, Project, ProjectTag, ProjectTool, Task, TaskPhase, TaskPriority } from '../types';

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const reviewVersionsFor = (taskId: string, title: string) => [
  {
    id: `${taskId}-v001`,
    label: 'v001',
    date: todayIso(),
    kind: 'image' as const,
    summary: `${title} first review frame`,
  },
  {
    id: `${taskId}-v002`,
    label: 'v002',
    date: todayIso(),
    kind: 'video' as const,
    summary: `${title} updated review pass`,
  },
];

export function ProjectsView({
  currentUser,
  people,
  projects,
  setProjects,
  setTasks,
  tasks,
  onArchiveProject,
  onArchiveTask,
}: {
  currentUser: Person;
  people: Person[];
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
  onArchiveProject: (projectId: string) => void;
  onArchiveTask: (taskId: string, message?: string) => void;
}) {
  const editable = canCreateProject(currentUser);
  const [selectedProjectId, setSelectedProjectId] = React.useState(projects[0]?.id ?? '');
  const [projectName, setProjectName] = React.useState('');
  const [projectCode, setProjectCode] = React.useState('');
  const [newProjectTags, setNewProjectTags] = React.useState<ProjectTag[]>(['cg']);
  const [newProjectTools, setNewProjectTools] = React.useState<ProjectTool[]>(['Blender']);
  const [taskTitle, setTaskTitle] = React.useState('');
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [assignee, setAssignee] = React.useState(people[0]?.name ?? '');
  const [phase, setPhase] = React.useState<TaskPhase>('layout');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = React.useState(todayIso());
  const [clientVisible, setClientVisible] = React.useState(false);

  React.useEffect(() => {
    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? '');
    }
  }, [projects, selectedProjectId]);

  React.useEffect(() => {
    if (!people.some((person) => person.name === assignee)) {
      setAssignee(people[0]?.name ?? '');
    }
  }, [assignee, people]);

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const projectTasks = selectedProject ? tasks.filter((task) => task.projectId === selectedProject.id) : [];

  const addProject = () => {
    const name = projectName.trim();
    const code = projectCode.trim().toUpperCase();
    if (!editable || name.length === 0 || code.length === 0) {
      return;
    }

    const id = `${code.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project'}-${projects.length + 1}`;
    const nextProject = { id, name, code, tags: newProjectTags, tools: newProjectTools };
    setProjects((current) => [...current, nextProject]);
    setSelectedProjectId(id);
    setProjectName('');
    setProjectCode('');
  };

  const updateProject = (projectId: string, updater: (project: Project) => Project) => {
    if (!editable) {
      return;
    }
    setProjects((current) => current.map((project) => (project.id === projectId ? updater(project) : project)));
  };

  const addTask = () => {
    const title = taskTitle.trim();
    if (!editable || !selectedProject || title.length === 0) {
      return;
    }

    setTasks((current) => {
      const taskId = `task-local-${current.length + 1}`;
      return [
        ...current,
        {
          id: taskId,
          projectId: selectedProject.id,
          title,
          status: 'todo',
          phase,
          priority,
          dueDate,
          assignee,
          description: `${selectedProject.code} task created from Projects.`,
          clientVisible,
          subtasks: [],
          reviewVersions: reviewVersionsFor(taskId, title),
          comments: [],
          followers: [assignee],
        },
      ];
    });
    setTaskTitle('');
    setClientVisible(false);
  };

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Projects</p>
          <h1>project register</h1>
        </div>
        <div className="header-stats">
          <span>{projects.length} projects</span>
          <span>{editable ? 'create access' : 'read only'}</span>
        </div>
      </section>

      <section className="toolbar selection-toolbar" aria-label="Project actions">
        <button disabled={!selectedProject} onClick={() => selectedProject && onArchiveProject(selectedProject.id)} type="button">
          <Archive size={14} aria-hidden="true" />
          Archive project
        </button>
        <button disabled={!selectedTaskId} onClick={() => selectedTaskId && onArchiveTask(selectedTaskId, 'Task deleted')} type="button">
          <Trash2 size={14} aria-hidden="true" />
          Delete task
        </button>
      </section>

      <section className="projects-layout">
        <div className="projects-list" aria-label="Project list">
          {projects.map((project) => {
            const taskCount = tasks.filter((task) => task.projectId === project.id).length;
            return (
              <button
                className={project.id === selectedProject?.id ? 'is-selected' : ''}
                data-testid={`project-row-${project.id}`}
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                type="button"
              >
                <strong>{project.code}</strong>
                <span>{project.name}</span>
                <small>{taskCount} tasks</small>
                <small>{project.tags.join(', ')} / {project.tools.join(', ')}</small>
              </button>
            );
          })}
        </div>

        <section className="project-detail" aria-label="Project detail">
          {selectedProject && (
            <>
              <header>
                <p className="eyebrow">{selectedProject.code}</p>
                <h2>{selectedProject.name}</h2>
              </header>
              <section className="metadata-editor" aria-label="Project metadata">
                <MultiSelect
                  disabled={!editable}
                  label="Tags"
                  onChange={(value) => updateProject(selectedProject.id, (project) => ({ ...project, tags: value as ProjectTag[] }))}
                  options={projectTags}
                  values={selectedProject.tags}
                />
                <MultiSelect
                  disabled={!editable}
                  label="Tools"
                  onChange={(value) => updateProject(selectedProject.id, (project) => ({ ...project, tools: value as ProjectTool[] }))}
                  options={projectTools}
                  values={selectedProject.tools}
                />
              </section>
              <div className="project-task-list">
                {projectTasks.length === 0 ? (
                  <p className="empty-row">No tasks for this project</p>
                ) : (
                  projectTasks.map((task) => (
                    <article
                      key={task.id}
                      className={`project-task-row ${selectedTaskId === task.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedTaskId(task.id)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        setSelectedTaskId(task.id);
                      }}
                    >
                      <strong>{task.title}</strong>
                      <span>{task.assignee}</span>
                      <span>{phaseLabels[task.phase]}</span>
                      <span>{priorityLabels[task.priority]}</span>
                      <span>{task.dueDate}</span>
                    </article>
                  ))
                )}
              </div>
              <section className="task-create-form">
                <h3>create task</h3>
                <label>
                  Title
                  <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} disabled={!editable} />
                </label>
                <label>
                  Assignee
                  <select value={assignee} onChange={(event) => setAssignee(event.target.value)} disabled={!editable}>
                    {people.map((person) => (
                      <option key={person.id} value={person.name}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Phase
                  <select value={phase} onChange={(event) => setPhase(event.target.value as TaskPhase)} disabled={!editable}>
                    {phases.map((candidate) => (
                      <option key={candidate} value={candidate}>
                        {phaseLabels[candidate]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} disabled={!editable}>
                    {priorities.map((candidate) => (
                      <option key={candidate} value={candidate}>
                        {priorityLabels[candidate]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Due date
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} disabled={!editable} />
                </label>
                <label className="inline-check">
                  <input checked={clientVisible} onChange={(event) => setClientVisible(event.target.checked)} type="checkbox" disabled={!editable} />
                  Client visible
                </label>
                <button className="primary-action" disabled={!editable || taskTitle.trim().length === 0} onClick={addTask} type="button">
                  <ListPlus size={15} aria-hidden="true" />
                  Add task
                </button>
              </section>
            </>
          )}
        </section>

        <aside className="add-project">
          <h2>create project</h2>
          <label>
            Name
            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} disabled={!editable} />
          </label>
          <label>
            Code
            <input maxLength={8} value={projectCode} onChange={(event) => setProjectCode(event.target.value)} disabled={!editable} />
          </label>
          <MultiSelect disabled={!editable} label="Tags" options={projectTags} values={newProjectTags} onChange={(value) => setNewProjectTags(value as ProjectTag[])} />
          <MultiSelect disabled={!editable} label="Tools" options={projectTools} values={newProjectTools} onChange={(value) => setNewProjectTools(value as ProjectTool[])} />
          <button className="primary-action" disabled={!editable || projectName.trim().length === 0 || projectCode.trim().length === 0} onClick={addProject} type="button">
            <Plus size={15} aria-hidden="true" />
            Add project
          </button>
          {!editable && <p className="access-note">Project creation is limited to admins and managers.</p>}
        </aside>
      </section>
    </>
  );
}

function MultiSelect<T extends string>({
  disabled,
  label,
  options,
  values,
  onChange,
}: {
  disabled: boolean;
  label: string;
  options: readonly T[];
  values: readonly T[];
  onChange: (values: T[]) => void;
}) {
  const toggle = (value: T) => {
    const next = values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value];
    onChange(next.length > 0 ? next : [value]);
  };

  return (
    <fieldset className="multi-select">
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option}>
          <input checked={values.includes(option)} disabled={disabled} onChange={() => toggle(option)} type="checkbox" />
          {option}
        </label>
      ))}
    </fieldset>
  );
}

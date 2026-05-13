import { ProjectsView } from '../../components/ProjectsView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function ProjectsFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];
  const activeProjects = state.projects.filter((project) => !project.archivedAt);

  const archiveProject = (projectId: string) => {
    const project = state.projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      return;
    }
    const confirmed = window.confirm(`${project.name} will be moved to Archive with its tasks and allocations. It can be restored later.`);
    if (confirmed) {
      actions.archiveProject(projectId);
    }
  };

  return (
    <ProjectsView
      currentUser={currentUser}
      onArchiveProject={archiveProject}
      onArchiveTask={actions.archiveTask}
      people={state.people}
      projects={activeProjects}
      setProjects={actions.setProjects}
      setTasks={actions.setTasks}
      tasks={state.tasks}
    />
  );
}

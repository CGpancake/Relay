import { TaskView } from '../../components/TaskView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function TasksFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];
  const activeProjects = state.projects.filter((project) => !project.archivedAt);

  return (
    <TaskView
      currentUser={currentUser}
      onArchiveSubtask={actions.archiveSubtask}
      onArchiveTask={actions.archiveTask}
      onTaskUpdated={actions.notifyTaskFollowers}
      people={state.people}
      projects={activeProjects}
      setTasks={actions.setTasks}
      tasks={state.tasks}
    />
  );
}

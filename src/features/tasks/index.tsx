import React from 'react';
import { TaskView } from '../../components/TaskView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';
import { themes } from '../../themes';
import type { TaskReviewVersion } from '../../types';

type ElementsManifest = {
  versions: TaskReviewVersion[];
};

export function TasksFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];
  const activeProjects = state.projects.filter((project) => !project.archivedAt);
  const activeTheme = themes.find((theme) => theme.id === state.themeId) ?? themes[0];

  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/demo-review/elements/manifest.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Elements manifest unavailable: ${response.status}`);
        }
        return response.json() as Promise<ElementsManifest>;
      })
      .then((manifest) => {
        if (manifest.versions.length === 0) {
          return;
        }
        actions.setTasks((currentTasks) =>
          currentTasks.map((task) => ({
            ...task,
            reviewVersions: manifest.versions.map((version) => ({
              ...version,
              projectId: task.projectId,
              shotId: shotIdForTask(task.title),
            })),
          })),
        );
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.info('Using seeded review versions because the Elements demo manifest is unavailable.', error);
        }
      });

    return () => controller.abort();
  }, [actions]);

  return (
    <TaskView
      accentKey={state.accentKey}
      activeTheme={activeTheme}
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

function shotIdForTask(title: string) {
  return title.match(/\bSH[_-]?\d+\b/i)?.[0].replace('-', '_').toUpperCase() ?? 'ELEMENTS';
}

import { ArchiveView } from '../../components/ArchiveView';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function ArchiveFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];

  return <ArchiveView archive={state.archive} currentUser={currentUser} onRestoreProject={actions.restoreProject} onRestoreTask={actions.restoreTask} />;
}

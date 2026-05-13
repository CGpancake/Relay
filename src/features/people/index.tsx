import { PeopleView } from '../../components/PeopleSettings';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function PeopleFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];

  return <PeopleView currentUser={currentUser} people={state.people} setPeople={actions.setPeople} />;
}

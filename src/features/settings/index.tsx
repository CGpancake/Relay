import { SettingsView } from '../../components/PeopleSettings';
import { useAppState } from '../../app/AppStateContext';
import { useAppActions } from '../../app/useAppActions';

export function SettingsFeatureView() {
  const state = useAppState();
  const actions = useAppActions();
  const currentUser = state.people.find((person) => person.id === state.currentPersonId) ?? state.people[0];

  return (
    <SettingsView
      accentKey={state.accentKey}
      currentPersonId={state.currentPersonId}
      currentUser={currentUser}
      calendarOverlays={state.calendarOverlays}
      calendarDayWindow={state.calendarDayWindow}
      people={state.people}
      setAccentKey={actions.setAccentKey}
      setCalendarDayWindow={actions.setCalendarDayWindow}
      setCalendarOverlays={actions.setCalendarOverlays}
      setCurrentPersonId={actions.setCurrentPersonId}
      setThemeId={actions.setThemeId}
      setTimezone={actions.setTimezone}
      themeId={state.themeId}
      timezone={state.timezone}
    />
  );
}

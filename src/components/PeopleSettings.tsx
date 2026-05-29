import React from 'react';
import { Plus } from 'lucide-react';
import { permissionLevels, viewIds, viewLabels } from '../data/labels';
import { canAdminPeople, permissionsForPermissionLevel } from '../lib/permissions';
import { themeAccentChoices, themes, themeVariantForMode } from '../themes';
import type { CalendarDayWindowSettings, CalendarMode, CalendarOverlaySettings, PermissionLevel, Person } from '../types';
import type { ThemeAccentKey } from '../themes';
type PersonDraft = Pick<Person, 'role' | 'permissionLevel' | 'permissions'>;

export function PeopleView({
  currentUser,
  people,
  setPeople,
}: {
  currentUser: Person;
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
}) {
  const admin = canAdminPeople(currentUser);
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('Artist');
  const [permissionLevel, setPermissionLevel] = React.useState<PermissionLevel>('Artist');
  const [discipline, setDiscipline] = React.useState('Generalist');
  const [editingPersonId, setEditingPersonId] = React.useState<string | null>(null);
  const [personDraft, setPersonDraft] = React.useState<PersonDraft | null>(null);

  const addPerson = () => {
    const trimmedName = name.trim();
    if (!admin || trimmedName.length === 0) {
      return;
    }

    setPeople((current) => [
      ...current,
      {
        id: `person-local-${current.length + 1}`,
        name: trimmedName,
        role,
        permissionLevel,
        discipline,
        permissions: permissionsForPermissionLevel(permissionLevel),
      },
    ]);
    setName('');
  };

  const beginEditPerson = (person: Person) => {
    if (!admin) return;
    setEditingPersonId(person.id);
    setPersonDraft({ role: person.role, permissionLevel: person.permissionLevel, permissions: { ...person.permissions } });
  };

  const updatePersonDraft = (updater: (draft: PersonDraft) => PersonDraft) => {
    if (!admin) return;
    setPersonDraft((current) => (current ? updater(current) : current));
  };

  const savePerson = (personId: string) => {
    if (!admin || !personDraft) return;
    setPeople((current) => current.map((person) => (person.id === personId ? { ...person, ...personDraft } : person)));
    setEditingPersonId(null);
    setPersonDraft(null);
  };

  const removePerson = (personId: string) => {
    if (!admin || personId === currentUser.id) {
      return;
    }
    setPeople((current) => current.filter((person) => person.id !== personId));
    if (editingPersonId === personId) {
      setEditingPersonId(null);
      setPersonDraft(null);
    }
  };

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / People</p>
          <h1>people permissions</h1>
        </div>
        <div className="header-stats">
          <span>{people.length} people</span>
          <span>{admin ? 'admin controls' : 'read only'}</span>
        </div>
      </section>

      <section className="people-layout">
        <div className="people-table" data-testid="people-permissions">
          <div className="people-row people-head">
            <span>Name</span>
            <span>Role</span>
            <span>Permission level</span>
            <span>Views</span>
            <span>Action</span>
          </div>
          {people.map((person) => {
            const editing = admin && editingPersonId === person.id && personDraft;
            const rowValue = editing ? personDraft : person;
            return (
            <div className="people-row" key={person.id}>
              <span>
                <strong>{person.name}</strong>
                <small>{person.discipline}</small>
                {person.engagementStatus && <small>{formatEngagementStatus(person.engagementStatus)}</small>}
                {(person.email || person.phone) && <small>{[person.email, person.phone].filter(Boolean).join(' · ')}</small>}
                {person.notes && <small className="people-contact-notes" title={person.notes}>{person.notes}</small>}
              </span>
              <span>
                <input
                  aria-label={`Role for ${person.name}`}
                  disabled={!editing}
                  value={rowValue.role}
                  onChange={(event) =>
                    updatePersonDraft((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                />
              </span>
              <span>
                <select
                  aria-label={`Permission level for ${person.name}`}
                  disabled={!editing}
                  value={rowValue.permissionLevel}
                  onChange={(event) =>
                    updatePersonDraft((current) => ({
                      ...current,
                      permissionLevel: event.target.value as PermissionLevel,
                      permissions: permissionsForPermissionLevel(event.target.value as PermissionLevel),
                    }))
                  }
                >
                  {permissionLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </span>
              <span className="permission-grid">
                {viewIds.map((viewId) => (
                  <label key={viewId}>
                    <input
                      checked={rowValue.permissions[viewId]}
                      disabled={!editing}
                      onChange={(event) =>
                        updatePersonDraft((current) => ({
                          ...current,
                          permissions: { ...current.permissions, [viewId]: event.target.checked },
                        }))
                      }
                      type="checkbox"
                    />
                    {viewLabels[viewId]}
                  </label>
                ))}
              </span>
              <span className="people-row-actions">
                {admin && (
                  <button className="secondary-action" onClick={() => (editing ? savePerson(person.id) : beginEditPerson(person))} type="button">
                    {editing ? 'Save' : 'Edit'}
                  </button>
                )}
                <button className="secondary-action" disabled={!admin || person.id === currentUser.id} onClick={() => removePerson(person.id)} type="button">
                  Remove
                </button>
              </span>
            </div>
          );
          })}
        </div>

        <aside className="add-person">
          <h2>add person</h2>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} disabled={!admin} />
          </label>
          <label>
            Role
            <input value={role} onChange={(event) => setRole(event.target.value)} disabled={!admin} />
          </label>
          <label>
            Permission level
            <select value={permissionLevel} onChange={(event) => setPermissionLevel(event.target.value as PermissionLevel)} disabled={!admin}>
              {permissionLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label>
            Discipline
            <input value={discipline} onChange={(event) => setDiscipline(event.target.value)} disabled={!admin} />
          </label>
          <button className="primary-action" disabled={!admin} onClick={addPerson} type="button">
            <Plus size={15} aria-hidden="true" />
            Add person
          </button>
        </aside>
      </section>
    </>
  );
}

export function SettingsView({
  accentKey,
  calendarDayWindow,
  calendarOverlays,
  currentPersonId,
  currentUser,
  people,
  setAccentKey,
  setCalendarDayWindow,
  setCalendarOverlays,
  setCurrentPersonId,
  setThemeId,
  setTimezone,
  themeId,
  timezone,
}: {
  accentKey: ThemeAccentKey;
  calendarDayWindow: CalendarDayWindowSettings;
  calendarOverlays: CalendarOverlaySettings;
  currentPersonId: string;
  currentUser: Person;
  people: Person[];
  setAccentKey: (accentKey: string) => void;
  setCalendarDayWindow: (settings: CalendarDayWindowSettings) => void;
  setCalendarOverlays: (overlays: CalendarOverlaySettings) => void;
  setCurrentPersonId: (personId: string) => void;
  setThemeId: (themeId: string) => void;
  setTimezone: (timezone: string) => void;
  themeId: string;
  timezone: string;
}) {
  const lightTheme = themeVariantForMode(themeId, 'light');
  const darkTheme = themeVariantForMode(themeId, 'dark');
  const selectedTheme = themes.find((theme) => theme.id === themeId) ?? themes[0];

  return (
    <>
      <section className="view-header">
        <div>
          <p className="eyebrow">Relay / Settings</p>
          <h1>settings</h1>
        </div>
        <div className="header-stats">
          <span>{currentUser.name}</span>
          <span>{currentUser.role.toLowerCase()}</span>
        </div>
      </section>
      <section className="settings-page">
        <section>
          <h2>theme</h2>
          <div className="toggle-row" data-testid="theme-quick-toggle">
            <button
              className={lightTheme?.id === themeId ? 'is-active' : ''}
              disabled={!lightTheme}
              onClick={() => lightTheme && setThemeId(lightTheme.id)}
              type="button"
            >
              Light
            </button>
            <button
              className={darkTheme?.id === themeId ? 'is-active' : ''}
              disabled={!darkTheme}
              onClick={() => darkTheme && setThemeId(darkTheme.id)}
              type="button"
            >
              Dark
            </button>
          </div>
          <label>
            Theme
            <select aria-label="Theme" value={themeId} onChange={(event) => setThemeId(event.target.value)}>
              {(['Native', 'Community'] as const).map((group) => (
                <optgroup key={group} label={group}>
                  {themes
                    .filter((theme) => theme.group === group)
                    .map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <fieldset className="accent-picker">
            <legend>Main accent</legend>
            <div className="accent-swatch-grid">
              {themeAccentChoices(selectedTheme).map((choice) => (
                <button
                  aria-label={`Use ${choice.label} accent`}
                  className={choice.key === accentKey ? 'is-active' : ''}
                  key={choice.key}
                  onClick={() => setAccentKey(choice.key)}
                  style={{ '--swatch-color': choice.color } as React.CSSProperties}
                  title={choice.label}
                  type="button"
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
          </fieldset>
        </section>
        <section>
          <h2>prototype user</h2>
          <label>
            Current user
            <select aria-label="Current user" value={currentPersonId} onChange={(event) => setCurrentPersonId(event.target.value)}>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} - {person.role}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section>
          <h2>time planning</h2>
          <label>
            Timezone
            <input
              aria-label="Timezone"
              list="timezone-options"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
          </label>
          <datalist id="timezone-options">
            {['Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney', 'UTC'].map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <div className="time-input-grid">
            <label>
              Day past padding
              <input
                aria-label="Day past padding"
                min="0"
                max="24"
                onChange={(event) => setCalendarDayWindow({ ...calendarDayWindow, pastHours: Number(event.target.value) })}
                step="0.25"
                type="number"
                value={calendarDayWindow.pastHours}
              />
            </label>
            <label>
              Day upcoming padding
              <input
                aria-label="Day upcoming padding"
                min="1"
                max="24"
                onChange={(event) => setCalendarDayWindow({ ...calendarDayWindow, upcomingHours: Number(event.target.value) })}
                step="0.25"
                type="number"
                value={calendarDayWindow.upcomingHours}
              />
            </label>
          </div>
          <fieldset className="calendar-overlay-settings">
            <legend>Calendar overlays</legend>
            {(['allocation', 'time-off', 'milestones'] as CalendarMode[]).map((mode) => (
              <label key={mode}>
                <input
                  checked={calendarOverlays[mode]}
                  disabled={mode === 'milestones'}
                  onChange={(event) => setCalendarOverlays({ ...calendarOverlays, [mode]: event.target.checked, milestones: false })}
                  type="checkbox"
                />
                {calendarModeLabel(mode)}
              </label>
            ))}
          </fieldset>
        </section>
      </section>
    </>
  );
}

function formatEngagementStatus(status: NonNullable<Person['engagementStatus']>) {
  return status.replaceAll('_', ' ');
}

function calendarModeLabel(mode: CalendarMode) {
  if (mode === 'time-off') return 'Time Off';
  if (mode === 'milestones') return 'Milestones';
  return 'Allocation';
}

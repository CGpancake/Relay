import React from 'react';
import { Plus } from 'lucide-react';
import { permissionLevels, viewIds, viewLabels } from '../data/labels';
import { canAdminPeople, permissionsForPermissionLevel } from '../lib/permissions';
import { themes, themeVariantForMode } from '../themes';
import type { PermissionLevel, Person } from '../types';

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

  const updatePerson = (personId: string, updater: (person: Person) => Person) => {
    if (!admin) {
      return;
    }
    setPeople((current) => current.map((person) => (person.id === personId ? updater(person) : person)));
  };

  const removePerson = (personId: string) => {
    if (!admin || personId === currentUser.id) {
      return;
    }
    setPeople((current) => current.filter((person) => person.id !== personId));
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
          {people.map((person) => (
            <div className="people-row" key={person.id}>
              <span>
                <strong>{person.name}</strong>
                <small>{person.discipline}</small>
              </span>
              <span>
                <input
                  aria-label={`Role for ${person.name}`}
                  disabled={!admin}
                  value={person.role}
                  onChange={(event) =>
                    updatePerson(person.id, (current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                />
              </span>
              <span>
                <select
                  aria-label={`Permission level for ${person.name}`}
                  disabled={!admin}
                  value={person.permissionLevel}
                  onChange={(event) =>
                    updatePerson(person.id, (current) => ({
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
                      checked={person.permissions[viewId]}
                      disabled={!admin}
                      onChange={(event) =>
                        updatePerson(person.id, (current) => ({
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
              <span>
                <button className="secondary-action" disabled={!admin || person.id === currentUser.id} onClick={() => removePerson(person.id)} type="button">
                  Remove
                </button>
              </span>
            </div>
          ))}
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
  currentPersonId,
  currentUser,
  people,
  setCurrentPersonId,
  setThemeId,
  themeId,
}: {
  currentPersonId: string;
  currentUser: Person;
  people: Person[];
  setCurrentPersonId: (personId: string) => void;
  setThemeId: (themeId: string) => void;
  themeId: string;
}) {
  const lightTheme = themeVariantForMode(themeId, 'light');
  const darkTheme = themeVariantForMode(themeId, 'dark');

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
      </section>
    </>
  );
}

import type { Person } from '../../types';
import { apiRequest } from '../../shared/api/client';

export type PeoplePayload = Omit<Person, 'id'> & { id?: string };

export function listPeople(): Promise<Person[]> {
  return apiRequest<Person[]>('/people');
}

export function createPerson(person: PeoplePayload): Promise<Person> {
  return apiRequest<Person>('/people', { method: 'POST', body: JSON.stringify(person) });
}

export function updatePerson(personId: string, patch: Partial<PeoplePayload>): Promise<Person> {
  return apiRequest<Person>(`/people/${encodeURIComponent(personId)}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function updatePersonPermissions(personId: string, permissions: Person['permissions']): Promise<Person> {
  return apiRequest<Person>(`/people/${encodeURIComponent(personId)}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissions }) });
}

export function archivePerson(personId: string, currentPersonId?: string): Promise<void> {
  const query = currentPersonId ? `?current_person_id=${encodeURIComponent(currentPersonId)}` : '';
  return apiRequest<void>(`/people/${encodeURIComponent(personId)}${query}`, { method: 'DELETE' });
}

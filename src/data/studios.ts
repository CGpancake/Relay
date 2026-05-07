import type { Studio, StudioId } from '../types';

export const umbrellaBrand = {
  name: 'Alongside Global',
  logo: 'alongside',
} as const;

export const studios: Studio[] = [
  { id: 'bonfire', name: 'Bonfire', shortName: 'Bonfire', logo: 'bonfire' },
  { id: 'saddington-baynes', name: 'Saddington Baynes', shortName: 'S+B', logo: 'saddington-baynes' },
  { id: 'sombra-labs', name: 'Sombra Labs', shortName: 'Sombra', logo: 'sombra-labs' },
  { id: 'hero-next-door', name: 'Hero Next Door', shortName: 'HND', logo: 'hero-next-door' },
  { id: 'organs', name: 'Organs', shortName: 'Organs', logo: 'organs' },
];

export const studioIds = studios.map((studio) => studio.id);

export const studioLabels: Record<StudioId, string> = studios.reduce(
  (labels, studio) => ({ ...labels, [studio.id]: studio.name }),
  {} as Record<StudioId, string>,
);

export const studioById = (studioId: StudioId) => studios.find((studio) => studio.id === studioId) ?? studios[0];

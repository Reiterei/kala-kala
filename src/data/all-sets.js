import { honoluluSets } from './honolulu-sets';
import { kaalaSets } from './kaala-sets';

// Add new series imports above and append below to register them everywhere.
export const allSets = [...honoluluSets, ...kaalaSets];

export const SERIES_ORDER = [
  'Honolulu', 'Honolulu B', 'Honolulu Plus', 'Honolulu S', 'Honolulu²', 'Honolulu² B',
  'Kaala', 'Kaala B',
];

export const SERIES_SHORT = {
  'Honolulu': 'HONOLULU', 'Honolulu B': 'HONOLULU B', 'Honolulu Plus': 'HONOLULU+',
  'Honolulu S': 'HONOLULU S', 'Honolulu²': 'HONOLULU²', 'Honolulu² B': 'HONOLULU² B',
  'Kaala': 'KAALA', 'Kaala B': 'KAALA B',
};

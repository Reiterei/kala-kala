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

// Series badge colors: { bg, text }. Add an entry per series; falls back to
// the default in getSeriesBadgeColors below if a series is missing here.
export const SERIES_BADGE_COLORS = {
  'Honolulu':     { bg: '#bcf19d', text: '#3d6b28' },
  'Honolulu B':   { bg: '#bcf19d', text: '#3d6b28' },
  'Honolulu Plus':{ bg: '#bcf19d', text: '#3d6b28' },
  'Honolulu S':   { bg: '#bcf19d', text: '#3d6b28' },
  'Honolulu²':    { bg: '#bcf19d', text: '#3d6b28' },
  'Honolulu² B':  { bg: '#bcf19d', text: '#3d6b28' },
  'Kaala':        { bg: '#e2beff', text: '#6b3da3' },
  'Kaala B':      { bg: '#e2beff', text: '#6b3da3' },
  'Oahu':         { bg: '#ffe88b', text: '#8a6d10' },
  'Molokai':      { bg: '#b1e5f8', text: '#1d6e8a' },
  'Kauai':        { bg: '#def8ba', text: '#4d7a1f' },
  'Nalu':         { bg: '#ffd49c', text: '#9a5a10' },
};

const DEFAULT_BADGE_COLOR = { bg: '#fbe2c0', text: '#a8784a' };

export function getSeriesBadgeColors(series) {
  return SERIES_BADGE_COLORS[series] || DEFAULT_BADGE_COLOR;
}

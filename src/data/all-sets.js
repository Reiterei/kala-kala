import { honoluluSets } from './honolulu-sets';
import { kaalaSets } from './kaala-sets';
import { molokaiSets } from './molokai-sets';
import { naluSets } from './nalu-sets';

// Add new series imports above and append below to register them everywhere.
export const allSets = [...honoluluSets, ...kaalaSets, ...molokaiSets, ...naluSets,];

export const SERIES_ORDER = [
  'Honolulu', 'Honolulu B', 'Honolulu Plus', 'Honolulu S', 'Honolulu²', 'Honolulu² B',
  'Kaala', 'Kaala B','Molokai','Nalu',
];

export const SERIES_SHORT = {
  'Honolulu': 'HONOLULU', 'Honolulu B': 'HONOLULU B', 'Honolulu Plus': 'HONOLULU+',
  'Honolulu S': 'HONOLULU S', 'Honolulu²': 'HONOLULU²', 'Honolulu² B': 'HONOLULU² B',
  'Kaala': 'KAALA', 'Kaala B': 'KAALA B',
  'Molokai': 'MOLOKAI',
  'Nalu': 'NALU',
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

// Derives a near-white card tint + matching border/accent from a badge bg color.
// mix(): blends a hex color toward white by `amount` (0 = white, 1 = full color).
function mix(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const blend = (c) => Math.round(c * amount + 255 * (1 - amount));
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

export function getSeriesCardColors(series) {
  const { bg, text } = getSeriesBadgeColors(series);
  return {
    cardBg: mix(bg, 0.01),
    border: mix(bg, 0.45),
    accent: text,
    accentSoft: mix(text, 0.65),
    track: mix(bg, 0.30),
  };
}

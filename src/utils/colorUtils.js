// Display order for legacy sets
const LEGACY_SET_ORDER = ['honolulu', 'oahu', 'kaala', 'original'];
const LEGACY_SET_LABELS = { honolulu: 'Honolulu', oahu: 'Oahu', kaala: 'Kaala', original: 'Original' };

// Returns the best legacy code/name for display (Honolulu > Oahu > Kaala > Original)
export function getLegacyDisplay(color) {
  const legacy = color.legacy || {};
  for (const key of LEGACY_SET_ORDER) {
    if (legacy[key]) return legacy[key];
  }
  return null;
}

// Returns every populated legacy set for a color, in display order
// [{ set: 'honolulu', label: 'Honolulu', name, code }, ...]
export function getLegacyList(color) {
  const legacy = color.legacy || {};
  return LEGACY_SET_ORDER
    .filter((key) => legacy[key])
    .map((key) => ({ set: key, label: LEGACY_SET_LABELS[key], ...legacy[key] }));
}

// Returns series variants this color appears in across all loaded sets
export function getSeriesForColor(colorCode, allSets) {
  const found = [];
  for (const set of allSets) {
    if (set.colors.includes(colorCode)) {
      if (!found.find(s => s.series === set.series)) {
        found.push({ series: set.series, tipType: set.tipType });
      }
    }
  }
  return found;
}

// Search matching: a token matches if it's a prefix of any given code (case-insensitive),
// or a substring of the free-text haystack. Every token must match something.
export function matchesSearchTokens(tokens, codes, text) {
  if (!tokens.length) return true;
  const lowerCodes = codes.filter(Boolean).map(c => c.toLowerCase());
  const haystack = (text || '').toLowerCase();
  return tokens.every(t =>
    lowerCodes.some(code => code.startsWith(t)) || haystack.includes(t)
  );
}

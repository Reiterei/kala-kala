// Returns the best legacy code/name for display (Honolulu > Oahu > Kaala)
export function getLegacyDisplay(color) {
  const { honolulu, oahu, kaala } = color.legacy;
  return honolulu || oahu || kaala || null;
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

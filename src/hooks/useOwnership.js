import { useState, useCallback } from 'react';

const STORAGE_KEY = 'kala-kala-ownership';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ownership[colorCode][seriesName] = 'owned' | 'wishlist' | undefined
export function useOwnership() {
  const [ownership, setOwnership] = useState(load);

  const setStatus = useCallback((colorCode, seriesName, status) => {
    setOwnership(prev => {
      const next = { ...prev };
      if (!next[colorCode]) next[colorCode] = {};
      if (status === null || status === undefined) {
        delete next[colorCode][seriesName];
      } else {
        next[colorCode] = { ...next[colorCode], [seriesName]: status };
      }
      save(next);
      return next;
    });
  }, []);

  const getStatus = useCallback((colorCode, seriesName) => {
    if (seriesName) return ownership[colorCode]?.[seriesName] ?? null;
    // No series: return aggregate status
    const entries = Object.values(ownership[colorCode] || {});
    if (entries.includes('owned')) return 'owned';
    if (entries.includes('wishlist')) return 'wishlist';
    return null;
  }, [ownership]);

  const isOwned = useCallback((colorCode, seriesName) => {
    if (seriesName) return ownership[colorCode]?.[seriesName] === 'owned';
    return Object.values(ownership[colorCode] || {}).includes('owned');
  }, [ownership]);

  const isWishlist = useCallback((colorCode, seriesName) => {
    if (seriesName) return ownership[colorCode]?.[seriesName] === 'wishlist';
    return Object.values(ownership[colorCode] || {}).includes('wishlist');
  }, [ownership]);

  return { ownership, setStatus, getStatus, isOwned, isWishlist };
}

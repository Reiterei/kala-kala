import { useState, useCallback, useEffect } from 'react';

const CACHE_KEY = 'kk-ownership';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(ownership) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(ownership)); } catch {}
}

export function useOwnership() {
  const [ownership, setOwnership] = useState({});

  useEffect(() => {
    setOwnership(loadCache());
  }, []);

  const setStatus = useCallback((colorCode, seriesName, status) => {
    const normalizedStatus = status === undefined ? null : status;
    setOwnership(prev => {
      const next = { ...prev };
      next[colorCode] = { ...next[colorCode] };
      if (normalizedStatus === null) {
        delete next[colorCode][seriesName];
      } else {
        next[colorCode][seriesName] = normalizedStatus;
      }
      saveCache(next);
      return next;
    });
  }, []);

  const getStatus = useCallback((colorCode, seriesName) => {
    if (seriesName) return ownership[colorCode]?.[seriesName] ?? null;
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

  const clearAllWishlist = useCallback(() => {
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'wishlist'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }
      saveCache(next);
      return next;
    });
  }, []);

  const clearAllOwned = useCallback(() => {
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'owned'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }
      saveCache(next);
      return next;
    });
  }, []);

  return { ownership, setStatus, getStatus, isOwned, isWishlist, clearAllWishlist, clearAllOwned };
}

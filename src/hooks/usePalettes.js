import { useState, useCallback, useEffect } from 'react';

const CACHE_KEY = 'kk-palettes';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(palettes) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(palettes)); } catch {}
}

export function usePalettes() {
  const [palettes, setPalettes] = useState([]);

  useEffect(() => {
    setPalettes(loadCache());
  }, []);

  const savePalette = useCallback((codes) => {
    const entry = { id: `local-${Date.now()}`, codes, created_at: new Date().toISOString() };
    setPalettes(prev => {
      const next = [entry, ...prev];
      saveCache(next);
      return next;
    });
  }, []);

  const deletePalette = useCallback((id) => {
    setPalettes(prev => {
      const next = prev.filter(p => p.id !== id);
      saveCache(next);
      return next;
    });
  }, []);

  return { palettes, savePalette, deletePalette };
}

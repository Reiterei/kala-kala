import { useState, useCallback, useEffect } from 'react';

const DEFAULTS = { hideJapanese: false, hideUnavailable: false, hideDiscontinued: false, hideLegacy: false, hideColorlessBlender: false };
const STORAGE_KEY = 'kk-settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export const JAPANESE_EXCLUSIVE_CODES = new Set([
  'B04','BV45','BV39','BV515','YR214','YR01','G48','YG35',
  'YR54','R12','RV07','RV02','V016','RV32','BV18',
  'Y110','Y212','R14','Y56',
]);

export const DISCONTINUED_CODES = new Set(['GY163']);

export const COLORLESS_BLENDER_CODE = '0';

export function isUnavailableSet(set) {
  const l = set.urls || {};
  return !l.amazon && !l.walmart && !l.ohuhu && !l.michaels;
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  const setSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { settings, setSetting };
}

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'kala-kala-settings';
const DEFAULTS = { hideJapanese: false, hideUnavailable: false, hideDiscontinued: false };

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const JAPANESE_EXCLUSIVE_CODES = new Set([
  'B04','BV45','BV39','BV515','YR214','YR01','G48','YG35',
  'YR54','R12','RV07','RV02','V016','RV32','BV18',
  'Y110','Y212','R14','Y56',
]);

export const DISCONTINUED_CODES = new Set(['GY163']);

export function isUnavailableSet(set) {
  const l = set.urls || {};
  return !l.amazon && !l.walmart && !l.ohuhu && !l.michaels;
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const setSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      save(next);
      return next;
    });
  }, []);

  return { settings, setSetting };
}

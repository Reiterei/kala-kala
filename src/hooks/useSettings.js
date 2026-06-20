import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULTS = { hideJapanese: false, hideUnavailable: false, hideDiscontinued: false, hideLegacy: false, hideColorlessBlender: false };

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

export function useSettings(user) {
  const [settings, setSettings] = useState({ ...DEFAULTS });

  useEffect(() => {
    if (!user) {
      setSettings({ ...DEFAULTS });
      return;
    }
    supabase
      .from('user_settings')
      .select('hide_japanese, hide_unavailable, hide_discontinued, hide_legacy, hide_colorless_blender')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        setSettings({
          hideJapanese: data.hide_japanese,
          hideUnavailable: data.hide_unavailable,
          hideDiscontinued: data.hide_discontinued,
          hideLegacy: data.hide_legacy,
          hideColorlessBlender: data.hide_colorless_blender,
        });
      });
  }, [user?.id]);

  const setSetting = useCallback((key, value) => {
    if (!user) return;
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          hide_japanese: next.hideJapanese,
          hide_unavailable: next.hideUnavailable,
          hide_discontinued: next.hideDiscontinued,
          hide_legacy: next.hideLegacy,
          hide_colorless_blender: next.hideColorlessBlender,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .then(({ error }) => { if (error) console.error('Settings upsert error:', error); });
      return next;
    });
  }, [user]);

  return { settings, setSetting };
}

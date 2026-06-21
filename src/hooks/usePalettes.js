import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function usePalettes(user) {
  const [palettes, setPalettes] = useState([]);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) { setPalettes([]); return; }
    supabase
      .from('palettes')
      .select('id, codes, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error('Fetch palettes error:', error); return; }
        setPalettes(data || []);
      });
  }, [user?.id]);

  const savePalette = useCallback((codes) => {
    if (!userRef.current) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, codes, created_at: new Date().toISOString() };
    setPalettes(prev => [optimistic, ...prev]);

    supabase
      .from('palettes')
      .insert({ user_id: userRef.current.id, codes })
      .select('id, codes, created_at')
      .single()
      .then(({ data, error }) => {
        if (error) { console.error('Insert palette error:', error); return; }
        setPalettes(prev => prev.map(p => p.id === tempId ? data : p));
      });
  }, []);

  const deletePalette = useCallback((id) => {
    if (!userRef.current) return;
    setPalettes(prev => prev.filter(p => p.id !== id));
    supabase
      .from('palettes')
      .delete()
      .eq('id', id)
      .then(({ error }) => { if (error) console.error('Delete palette error:', error); });
  }, []);

  return { palettes, savePalette, deletePalette };
}

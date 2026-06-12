import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

function rowsToOwnership(rows) {
  const ownership = {};
  for (const row of rows) {
    if (!ownership[row.color_code]) ownership[row.color_code] = {};
    ownership[row.color_code][row.series_name] = row.status;
  }
  return ownership;
}

export function useOwnership(user) {
  const [ownership, setOwnership] = useState({});
  const [syncing, setSyncing] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!user) {
      setOwnership({});
      return;
    }
    setSyncing(true);
    supabase
      .from('ownership')
      .select('color_code, series_name, status')
      .then(({ data, error }) => {
        setSyncing(false);
        if (error) { console.error('Fetch ownership error:', error); return; }
        setOwnership(rowsToOwnership(data || []));
      });
  }, [user?.id]);

  const setStatus = useCallback((colorCode, seriesName, status) => {
    if (!userRef.current) return;
    setOwnership(prev => {
      const next = { ...prev };
      if (!next[colorCode]) next[colorCode] = {};
      if (status === null || status === undefined) {
        delete next[colorCode][seriesName];
      } else {
        next[colorCode] = { ...next[colorCode], [seriesName]: status };
      }

      if (status === null || status === undefined) {
        supabase
          .from('ownership')
          .delete()
          .eq('color_code', colorCode)
          .eq('series_name', seriesName)
          .then(({ error }) => { if (error) console.error('Delete error:', error); });
      } else {
        supabase
          .from('ownership')
          .upsert({
            user_id: userRef.current.id,
            color_code: colorCode,
            series_name: seriesName,
            status,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,color_code,series_name' })
          .then(({ error }) => { if (error) console.error('Upsert error:', error); });
      }

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

  return { ownership, setStatus, getStatus, isOwned, isWishlist, syncing };
}

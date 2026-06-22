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

function cacheKey(userId) {
  return `kk-ownership-${userId}`;
}

function queueKey(userId) {
  return `kk-ownership-queue-${userId}`;
}

function syncMetaKey(userId) {
  return `kk-ownership-synced-${userId}`;
}

function loadSyncedAt(userId) {
  try { return localStorage.getItem(syncMetaKey(userId)) || null; } catch { return null; }
}

function saveSyncedAt(userId, iso) {
  try { localStorage.setItem(syncMetaKey(userId), iso); } catch {}
}

function loadCache(userId) {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(userId, ownership) {
  try { localStorage.setItem(cacheKey(userId), JSON.stringify(ownership)); } catch {}
}

function loadQueue(userId) {
  try {
    const raw = localStorage.getItem(queueKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(userId, queue) {
  try { localStorage.setItem(queueKey(userId), JSON.stringify(queue)); } catch {}
}

// Apply queued mutations on top of server rows, latest write per (color, series) wins.
function applyQueue(ownership, queue) {
  let next = { ...ownership };
  for (const m of queue) {
    if (m.type === 'bulk_delete') {
      const filtered = {};
      for (const [code, series] of Object.entries(next)) {
        const f = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== m.status));
        if (Object.keys(f).length > 0) filtered[code] = f;
      }
      next = filtered;
      continue;
    }
    if (!next[m.colorCode]) next[m.colorCode] = {};
    next[m.colorCode] = { ...next[m.colorCode] };
    if (m.status === null) delete next[m.colorCode][m.seriesName];
    else next[m.colorCode][m.seriesName] = m.status;
  }
  return next;
}

async function sendMutation(m) {
  if (m.type === 'bulk_delete') {
    return supabase
      .from('ownership')
      .delete()
      .eq('user_id', m.userId)
      .eq('status', m.status);
  }
  if (m.status === null) {
    return supabase
      .from('ownership')
      .delete()
      .eq('user_id', m.userId)
      .eq('color_code', m.colorCode)
      .eq('series_name', m.seriesName);
  }
  return supabase
    .from('ownership')
    .upsert({
      user_id: m.userId,
      color_code: m.colorCode,
      series_name: m.seriesName,
      status: m.status,
      updated_at: m.updatedAt,
    }, { onConflict: 'user_id,color_code,series_name' });
}

export function useOwnership(user) {
  const [ownership, setOwnership] = useState({});
  const [syncing, setSyncing] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;

  const flushQueue = useCallback(async (userId) => {
    let queue = loadQueue(userId);
    if (queue.length === 0) return false;
    const remaining = [];
    for (const m of queue) {
      const { error } = await sendMutation(m);
      if (error) remaining.push(m);
    }
    saveQueue(userId, remaining);
    return true;
  }, []);

  useEffect(() => {
    if (!user) {
      setOwnership({});
      return;
    }
    const userId = user.id;
    const cached = loadCache(userId);
    const queued = loadQueue(userId);
    if (cached) setOwnership(applyQueue(cached, queued));

    setSyncing(true);
    flushQueue(userId).then(async () => {
      const syncedAt = loadSyncedAt(userId);
      const now = new Date().toISOString();

      if (!cached || !syncedAt) {
        // No usable local snapshot — full fetch.
        const { data, error } = await supabase
          .from('ownership')
          .select('color_code, series_name, status');
        setSyncing(false);
        if (error) { console.error('Fetch ownership error:', error); return; }
        const next = applyQueue(rowsToOwnership(data || []), loadQueue(userId));
        setOwnership(next);
        saveCache(userId, next);
        saveSyncedAt(userId, now);
        return;
      }

      // Cheap check: row count only, no data transferred.
      const { count, error: countError } = await supabase
        .from('ownership')
        .select('*', { count: 'exact', head: true });
      if (countError) { console.error('Count ownership error:', countError); setSyncing(false); return; }

      const localCount = Object.values(cached).reduce((n, s) => n + Object.keys(s).length, 0);

      if (count === localCount) {
        // Same row count — fetch only what changed since last sync (covers edits, not deletes).
        const { data, error } = await supabase
          .from('ownership')
          .select('color_code, series_name, status, updated_at')
          .gt('updated_at', syncedAt);
        setSyncing(false);
        if (error) { console.error('Delta fetch ownership error:', error); return; }
        if (!data || data.length === 0) { saveSyncedAt(userId, now); return; }
        const merged = { ...cached };
        for (const row of data) {
          if (!merged[row.color_code]) merged[row.color_code] = {};
          merged[row.color_code] = { ...merged[row.color_code], [row.series_name]: row.status };
        }
        const next = applyQueue(merged, loadQueue(userId));
        setOwnership(next);
        saveCache(userId, next);
        saveSyncedAt(userId, now);
        return;
      }

      // Count mismatch implies a deletion happened elsewhere — full fetch to stay correct.
      const { data, error } = await supabase
        .from('ownership')
        .select('color_code, series_name, status');
      setSyncing(false);
      if (error) { console.error('Fetch ownership error:', error); return; }
      const next = applyQueue(rowsToOwnership(data || []), loadQueue(userId));
      setOwnership(next);
      saveCache(userId, next);
      saveSyncedAt(userId, now);
    });
  }, [user?.id, flushQueue]);

  const setStatus = useCallback((colorCode, seriesName, status) => {
    if (!userRef.current) return;
    const userId = userRef.current.id;
    const normalizedStatus = status === undefined ? null : status;
    const mutation = {
      userId, colorCode, seriesName,
      status: normalizedStatus,
      updatedAt: new Date().toISOString(),
    };

    setOwnership(prev => {
      const next = { ...prev };
      if (!next[colorCode]) next[colorCode] = {};
      if (normalizedStatus === null) {
        delete next[colorCode][seriesName];
      } else {
        next[colorCode] = { ...next[colorCode], [seriesName]: normalizedStatus };
      }
      saveCache(userId, next);
      return next;
    });

    const queue = loadQueue(userId).filter(
      m => !(m.colorCode === colorCode && m.seriesName === seriesName)
    );
    queue.push(mutation);
    saveQueue(userId, queue);
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
    if (!userRef.current) return;
    const userId = userRef.current.id;
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'wishlist'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }
      saveCache(userId, next);
      return next;
    });
    const queue = loadQueue(userId).filter(m => m.status !== 'wishlist');
    queue.push({ type: 'bulk_delete', userId, status: 'wishlist' });
    saveQueue(userId, queue);
  }, []);

  const clearAllOwned = useCallback(() => {
    if (!userRef.current) return;
    const userId = userRef.current.id;
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'owned'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }
      saveCache(userId, next);
      return next;
    });
    const queue = loadQueue(userId).filter(m => m.status !== 'owned');
    queue.push({ type: 'bulk_delete', userId, status: 'owned' });
    saveQueue(userId, queue);
  }, []);

  return { ownership, setStatus, getStatus, isOwned, isWishlist, syncing, clearAllWishlist, clearAllOwned };
}

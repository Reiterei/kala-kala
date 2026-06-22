import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

function cacheKey(userId) {
  return `kk-palettes-${userId}`;
}

function queueKey(userId) {
  return `kk-palettes-queue-${userId}`;
}

function syncMetaKey(userId) {
  return `kk-palettes-synced-${userId}`;
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

function saveCache(userId, palettes) {
  try { localStorage.setItem(cacheKey(userId), JSON.stringify(palettes)); } catch {}
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

// Apply queued mutations on top of server rows. Inserts still pending real
// ids stay keyed by tempId; deletes against a tempId cancel the queued
// insert instead of reaching the server (nothing to delete there yet).
function applyQueue(palettes, queue) {
  let next = [...palettes];
  for (const m of queue) {
    if (m.type === 'insert') {
      next = [{ id: m.tempId, codes: m.codes, created_at: m.createdAt }, ...next];
    } else if (m.type === 'delete') {
      next = next.filter(p => p.id !== m.id);
    }
  }
  return next;
}

async function sendMutation(m, userId) {
  if (m.type === 'insert') {
    return supabase
      .from('palettes')
      .insert({ user_id: userId, codes: m.codes })
      .select('id, codes, created_at')
      .single();
  }
  return supabase.from('palettes').delete().eq('id', m.id);
}

export function usePalettes(user) {
  const [palettes, setPalettes] = useState([]);
  const userRef = useRef(user);
  userRef.current = user;

  // tempId -> real id, once an insert resolves, so later deletes against
  // the tempId can be redirected/cancelled correctly.
  const idMapRef = useRef({});

  const flushQueue = useCallback(async (userId) => {
    const queue = loadQueue(userId);
    if (queue.length === 0) return false;
    const remaining = [];
    for (const m of queue) {
      if (m.type === 'delete' && String(m.id).startsWith('temp-')) {
        // Real id never arrived (insert still queued or cancelled elsewhere) — skip.
        continue;
      }
      const { data, error } = await sendMutation(m, userId);
      if (error) { remaining.push(m); continue; }
      if (m.type === 'insert' && data) {
        idMapRef.current[m.tempId] = data.id;
        setPalettes(prev => prev.map(p => p.id === m.tempId ? data : p));
      }
    }
    saveQueue(userId, remaining);
    return true;
  }, []);

  useEffect(() => {
    if (!user) { setPalettes([]); return; }
    const userId = user.id;
    const cached = loadCache(userId);
    const queued = loadQueue(userId);
    if (cached) setPalettes(applyQueue(cached, queued));

    flushQueue(userId).then(async () => {
      const syncedAt = loadSyncedAt(userId);
      const now = new Date().toISOString();

      if (!cached || !syncedAt) {
        const { data, error } = await supabase
          .from('palettes')
          .select('id, codes, created_at')
          .order('created_at', { ascending: false });
        if (error) { console.error('Fetch palettes error:', error); return; }
        const next = applyQueue(data || [], loadQueue(userId));
        setPalettes(next);
        saveCache(userId, next);
        saveSyncedAt(userId, now);
        return;
      }

      // Cheap check: row count only, no data transferred.
      const { count, error: countError } = await supabase
        .from('palettes')
        .select('*', { count: 'exact', head: true });
      if (countError) { console.error('Count palettes error:', countError); return; }

      if (count === cached.length) {
        // Nothing added or removed elsewhere since last sync.
        saveSyncedAt(userId, now);
        return;
      }

      if (count > cached.length) {
        // Likely just new palettes added elsewhere — fetch only those created since last sync.
        const { data, error } = await supabase
          .from('palettes')
          .select('id, codes, created_at')
          .gt('created_at', syncedAt)
          .order('created_at', { ascending: false });
        if (error) { console.error('Delta fetch palettes error:', error); return; }
        if (data && data.length === count - cached.length) {
          const merged = applyQueue([...data, ...cached], loadQueue(userId));
          setPalettes(merged);
          saveCache(userId, merged);
          saveSyncedAt(userId, now);
          return;
        }
        // Counts didn't reconcile cleanly (a delete happened too) — fall through to full fetch.
      }

      // Deletion happened elsewhere, or delta didn't reconcile — full fetch to stay correct.
      const { data, error } = await supabase
        .from('palettes')
        .select('id, codes, created_at')
        .order('created_at', { ascending: false });
      if (error) { console.error('Fetch palettes error:', error); return; }
      const next = applyQueue(data || [], loadQueue(userId));
      setPalettes(next);
      saveCache(userId, next);
      saveSyncedAt(userId, now);
    });
  }, [user?.id, flushQueue]);

  const savePalette = useCallback((codes) => {
    if (!userRef.current) return;
    const userId = userRef.current.id;
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    setPalettes(prev => {
      const next = [{ id: tempId, codes, created_at: createdAt }, ...prev];
      saveCache(userId, next);
      return next;
    });

    const queue = loadQueue(userId);
    queue.push({ type: 'insert', tempId, codes, createdAt });
    saveQueue(userId, queue);
  }, []);

  const deletePalette = useCallback((id) => {
    if (!userRef.current) return;
    const userId = userRef.current.id;

    setPalettes(prev => {
      const next = prev.filter(p => p.id !== id);
      saveCache(userId, next);
      return next;
    });

    if (String(id).startsWith('temp-')) {
      // Cancel the queued insert outright — nothing was ever sent to the server.
      saveQueue(userId, loadQueue(userId).filter(m => !(m.type === 'insert' && m.tempId === id)));
      return;
    }

    const queue = loadQueue(userId);
    queue.push({ type: 'delete', id });
    saveQueue(userId, queue);
  }, []);

  return { palettes, savePalette, deletePalette };
}

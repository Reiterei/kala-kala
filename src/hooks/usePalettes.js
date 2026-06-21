import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

function cacheKey(userId) {
  return `kk-palettes-${userId}`;
}

function queueKey(userId) {
  return `kk-palettes-queue-${userId}`;
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
    if (queue.length === 0) return;
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
  }, []);

  useEffect(() => {
    if (!user) { setPalettes([]); return; }
    const userId = user.id;
    const cached = loadCache(userId);
    const queued = loadQueue(userId);
    if (cached) setPalettes(applyQueue(cached, queued));

    const sync = () => {
      flushQueue(userId).then(() =>
        supabase
          .from('palettes')
          .select('id, codes, created_at')
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) { console.error('Fetch palettes error:', error); return; }
            const stillQueued = loadQueue(userId);
            const next = applyQueue(data || [], stillQueued);
            setPalettes(next);
            saveCache(userId, next);
          })
      );
    };
    sync();

    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
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

    supabase
      .from('palettes')
      .insert({ user_id: userId, codes })
      .select('id, codes, created_at')
      .single()
      .then(({ data, error }) => {
        if (error) return; // stays queued, flushed on next mount/online
        idMapRef.current[tempId] = data.id;
        setPalettes(prev => {
          const next = prev.map(p => p.id === tempId ? data : p);
          saveCache(userId, next);
          return next;
        });
        saveQueue(userId, loadQueue(userId).filter(m => !(m.type === 'insert' && m.tempId === tempId)));
      });
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

    supabase
      .from('palettes')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) return; // stays queued, flushed on next mount/online
        saveQueue(userId, loadQueue(userId).filter(m => !(m.type === 'delete' && m.id === id)));
      });
  }, []);

  return { palettes, savePalette, deletePalette };
}

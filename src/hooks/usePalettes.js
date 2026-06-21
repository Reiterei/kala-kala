import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const GUEST_ID = 'guest';

function cacheKey(id) {
  return `kk-palettes-${id}`;
}

function queueKey(id) {
  return `kk-palettes-queue-${id}`;
}

function loadCache(id) {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCache(id, palettes) {
  try { localStorage.setItem(cacheKey(id), JSON.stringify(palettes)); } catch {}
}

function clearCache(id) {
  try { localStorage.removeItem(cacheKey(id)); } catch {}
}

function loadQueue(id) {
  try {
    const raw = localStorage.getItem(queueKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(id, queue) {
  try { localStorage.setItem(queueKey(id), JSON.stringify(queue)); } catch {}
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

// Palettes are independent snapshots with no natural conflict key, so guest
// palettes merge additively into the cloud as new inserts, preserving
// their original created_at.
async function mergeGuestIntoCloud(userId) {
  const guestPalettes = loadCache(GUEST_ID);
  if (guestPalettes.length === 0) return;

  for (const p of guestPalettes) {
    const { error } = await supabase
      .from('palettes')
      .insert({ user_id: userId, codes: p.codes, created_at: p.created_at });
    if (error) console.error('Merge insert error:', error);
  }

  clearCache(GUEST_ID);
  try { localStorage.removeItem(queueKey(GUEST_ID)); } catch {}
}

export function usePalettes(user) {
  const [palettes, setPalettes] = useState([]);
  const userRef = useRef(user);
  userRef.current = user;
  const prevUserIdRef = useRef(undefined);

  // tempId -> real id, once an insert resolves, so later deletes against
  // the tempId can be redirected/cancelled correctly.
  const idMapRef = useRef({});

  const flushQueue = useCallback(async (id) => {
    const queue = loadQueue(id);
    if (queue.length === 0) return;
    const remaining = [];
    for (const m of queue) {
      if (m.type === 'delete' && String(m.id).startsWith('temp-')) {
        // Real id never arrived (insert still queued or cancelled elsewhere) — skip.
        continue;
      }
      const { data, error } = await sendMutation(m, id);
      if (error) { remaining.push(m); continue; }
      if (m.type === 'insert' && data) {
        idMapRef.current[m.tempId] = data.id;
        setPalettes(prev => prev.map(p => p.id === m.tempId ? data : p));
      }
    }
    saveQueue(id, remaining);
  }, []);

  useEffect(() => {
    const justLoggedIn = !prevUserIdRef.current && user?.id;
    prevUserIdRef.current = user?.id;

    if (!user) {
      const cached = loadCache(GUEST_ID);
      const queued = loadQueue(GUEST_ID);
      setPalettes(applyQueue(cached, queued));
      return;
    }

    const userId = user.id;

    const loadFromCloud = () => {
      const cached = loadCache(userId);
      const queued = loadQueue(userId);
      setPalettes(applyQueue(cached, queued));

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

    if (justLoggedIn) {
      mergeGuestIntoCloud(userId).then(loadFromCloud);
    } else {
      loadFromCloud();
    }

    window.addEventListener('online', loadFromCloud);
    return () => window.removeEventListener('online', loadFromCloud);
  }, [user?.id, flushQueue]);

  const savePalette = useCallback((codes) => {
    const id = userRef.current ? userRef.current.id : GUEST_ID;
    const tempId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    setPalettes(prev => {
      const next = [{ id: tempId, codes, created_at: createdAt }, ...prev];
      saveCache(id, next);
      return next;
    });

    if (!userRef.current) return; // guest: cache write above is the only persistence

    const queue = loadQueue(id);
    queue.push({ type: 'insert', tempId, codes, createdAt });
    saveQueue(id, queue);

    supabase
      .from('palettes')
      .insert({ user_id: id, codes })
      .select('id, codes, created_at')
      .single()
      .then(({ data, error }) => {
        if (error) return; // stays queued, flushed on next mount/online
        idMapRef.current[tempId] = data.id;
        setPalettes(prev => {
          const next = prev.map(p => p.id === tempId ? data : p);
          saveCache(id, next);
          return next;
        });
        saveQueue(id, loadQueue(id).filter(m => !(m.type === 'insert' && m.tempId === tempId)));
      });
  }, []);

  const deletePalette = useCallback((paletteId) => {
    const id = userRef.current ? userRef.current.id : GUEST_ID;

    setPalettes(prev => {
      const next = prev.filter(p => p.id !== paletteId);
      saveCache(id, next);
      return next;
    });

    if (!userRef.current) return; // guest: cache write above is the only persistence

    if (String(paletteId).startsWith('temp-')) {
      // Cancel the queued insert outright — nothing was ever sent to the server.
      saveQueue(id, loadQueue(id).filter(m => !(m.type === 'insert' && m.tempId === paletteId)));
      return;
    }

    const queue = loadQueue(id);
    queue.push({ type: 'delete', id: paletteId });
    saveQueue(id, queue);

    supabase
      .from('palettes')
      .delete()
      .eq('id', paletteId)
      .then(({ error }) => {
        if (error) return; // stays queued, flushed on next mount/online
        saveQueue(id, loadQueue(id).filter(m => !(m.type === 'delete' && m.id === paletteId)));
      });
  }, []);

  return { palettes, savePalette, deletePalette };
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const GUEST_ID = 'guest';

function rowsToTimestamped(rows) {
  const map = {};
  for (const row of rows) {
    if (!map[row.color_code]) map[row.color_code] = {};
    map[row.color_code][row.series_name] = { status: row.status, updatedAt: row.updated_at };
  }
  return map;
}

function stripTimestamps(timestamped) {
  const plain = {};
  for (const [code, series] of Object.entries(timestamped)) {
    plain[code] = {};
    for (const [s, entry] of Object.entries(series)) plain[code][s] = entry.status;
  }
  return plain;
}

function cacheKey(id) {
  return `kk-ownership-${id}`;
}

function queueKey(id) {
  return `kk-ownership-queue-${id}`;
}

// Cache stores { [code]: { [series]: { status, updatedAt } } } so guest
// data and cloud data can be compared and merged by recency.
function loadCache(id) {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(id, timestamped) {
  try { localStorage.setItem(cacheKey(id), JSON.stringify(timestamped)); } catch {}
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

// Apply queued mutations on top of timestamped server rows, latest write per (color, series) wins.
function applyQueue(timestamped, queue) {
  let next = { ...timestamped };
  for (const m of queue) {
    if (m.type === 'bulk_delete') {
      const filtered = {};
      for (const [code, series] of Object.entries(next)) {
        const f = Object.fromEntries(Object.entries(series).filter(([, v]) => v.status !== m.status));
        if (Object.keys(f).length > 0) filtered[code] = f;
      }
      next = filtered;
      continue;
    }
    if (!next[m.colorCode]) next[m.colorCode] = {};
    next[m.colorCode] = { ...next[m.colorCode] };
    if (m.status === null) delete next[m.colorCode][m.seriesName];
    else next[m.colorCode][m.seriesName] = { status: m.status, updatedAt: m.updatedAt };
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

// One-time merge of guest localStorage data into a newly logged-in account.
// Most-recently-updated entry wins per (color, series).
async function mergeGuestIntoCloud(userId) {
  const guestTimestamped = loadCache(GUEST_ID);
  const guestEntries = Object.entries(guestTimestamped).flatMap(([code, series]) =>
    Object.entries(series).map(([seriesName, entry]) => ({ code, seriesName, ...entry }))
  );
  if (guestEntries.length === 0) return;

  const { data, error } = await supabase
    .from('ownership')
    .select('color_code, series_name, status, updated_at');
  if (error) { console.error('Merge fetch error:', error); return; }

  const cloudTimestamped = rowsToTimestamped(data || []);

  const upserts = [];
  for (const g of guestEntries) {
    const cloudEntry = cloudTimestamped[g.code]?.[g.seriesName];
    if (!cloudEntry || new Date(g.updatedAt) > new Date(cloudEntry.updatedAt)) {
      upserts.push({
        user_id: userId,
        color_code: g.code,
        series_name: g.seriesName,
        status: g.status,
        updated_at: g.updatedAt,
      });
    }
  }

  if (upserts.length > 0) {
    const { error: upsertError } = await supabase
      .from('ownership')
      .upsert(upserts, { onConflict: 'user_id,color_code,series_name' });
    if (upsertError) console.error('Merge upsert error:', upsertError);
  }

  clearCache(GUEST_ID);
  try { localStorage.removeItem(queueKey(GUEST_ID)); } catch {}
}

export function useOwnership(user) {
  const [ownership, setOwnership] = useState({});
  const [syncing, setSyncing] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;
  const prevUserIdRef = useRef(undefined);

  const flushQueue = useCallback(async (id) => {
    const queue = loadQueue(id);
    if (queue.length === 0) return;
    const remaining = [];
    for (const m of queue) {
      const { error } = await sendMutation(m);
      if (error) remaining.push(m);
    }
    saveQueue(id, remaining);
  }, []);

  useEffect(() => {
    const justLoggedIn = !prevUserIdRef.current && user?.id;
    prevUserIdRef.current = user?.id;

    if (!user) {
      const cached = loadCache(GUEST_ID);
      setOwnership(stripTimestamps(cached));
      return;
    }

    const userId = user.id;

    const loadFromCloud = () => {
      const queued = loadQueue(userId);
      const cached = applyQueue(loadCache(userId), queued);
      setOwnership(stripTimestamps(cached));

      setSyncing(true);
      flushQueue(userId).then(() =>
        supabase
          .from('ownership')
          .select('color_code, series_name, status, updated_at')
          .then(({ data, error }) => {
            setSyncing(false);
            if (error) { console.error('Fetch ownership error:', error); return; }
            const serverTimestamped = rowsToTimestamped(data || []);
            const stillQueued = loadQueue(userId);
            const next = applyQueue(serverTimestamped, stillQueued);
            setOwnership(stripTimestamps(next));
            saveCache(userId, next);
          })
      );
    };

    if (justLoggedIn) {
      setSyncing(true);
      mergeGuestIntoCloud(userId).then(loadFromCloud);
    } else {
      loadFromCloud();
    }

    const onOnline = () => {
      flushQueue(userId).then(() => {
        supabase
          .from('ownership')
          .select('color_code, series_name, status, updated_at')
          .then(({ data, error }) => {
            if (error) { console.error('Fetch ownership error:', error); return; }
            const serverTimestamped = rowsToTimestamped(data || []);
            const stillQueued = loadQueue(userId);
            const next = applyQueue(serverTimestamped, stillQueued);
            setOwnership(stripTimestamps(next));
            saveCache(userId, next);
          });
      });
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [user?.id, flushQueue]);

  const setStatus = useCallback((colorCode, seriesName, status) => {
    const normalizedStatus = status === undefined ? null : status;
    const updatedAt = new Date().toISOString();
    const id = userRef.current ? userRef.current.id : GUEST_ID;

    setOwnership(prev => {
      const next = { ...prev };
      if (!next[colorCode]) next[colorCode] = {};
      if (normalizedStatus === null) {
        delete next[colorCode][seriesName];
      } else {
        next[colorCode] = { ...next[colorCode], [seriesName]: normalizedStatus };
      }

      const cached = loadCache(id);
      if (!cached[colorCode]) cached[colorCode] = {};
      if (normalizedStatus === null) delete cached[colorCode][seriesName];
      else cached[colorCode] = { ...cached[colorCode], [seriesName]: { status: normalizedStatus, updatedAt } };
      saveCache(id, cached);

      return next;
    });

    if (!userRef.current) return; // guest: cache write above is the only persistence

    const mutation = { userId: id, colorCode, seriesName, status: normalizedStatus, updatedAt };

    const queue = loadQueue(id).filter(
      m => !(m.colorCode === colorCode && m.seriesName === seriesName)
    );
    queue.push(mutation);
    saveQueue(id, queue);

    sendMutation(mutation).then(({ error }) => {
      if (error) return; // stays queued, flushed on next mount/online
      const remaining = loadQueue(id).filter(
        m => !(m.colorCode === colorCode && m.seriesName === seriesName && m.updatedAt === mutation.updatedAt)
      );
      saveQueue(id, remaining);
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

  const clearAllWishlist = useCallback(() => {
    const id = userRef.current ? userRef.current.id : GUEST_ID;
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'wishlist'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }

      const cached = loadCache(id);
      const filteredCache = {};
      for (const [code, series] of Object.entries(cached)) {
        const f = Object.fromEntries(Object.entries(series).filter(([, v]) => v.status !== 'wishlist'));
        if (Object.keys(f).length > 0) filteredCache[code] = f;
      }
      saveCache(id, filteredCache);

      return next;
    });

    if (!userRef.current) return;

    const queue = loadQueue(id).filter(m => m.status !== 'wishlist');
    queue.push({ type: 'bulk_delete', userId: id, status: 'wishlist' });
    saveQueue(id, queue);
    sendMutation({ type: 'bulk_delete', userId: id, status: 'wishlist' }).then(({ error }) => {
      if (error) return;
      saveQueue(id, loadQueue(id).filter(m => !(m.type === 'bulk_delete' && m.status === 'wishlist')));
    });
  }, []);

  const clearAllOwned = useCallback(() => {
    const id = userRef.current ? userRef.current.id : GUEST_ID;
    setOwnership(prev => {
      const next = {};
      for (const [code, series] of Object.entries(prev)) {
        const filtered = Object.fromEntries(Object.entries(series).filter(([, v]) => v !== 'owned'));
        if (Object.keys(filtered).length > 0) next[code] = filtered;
      }

      const cached = loadCache(id);
      const filteredCache = {};
      for (const [code, series] of Object.entries(cached)) {
        const f = Object.fromEntries(Object.entries(series).filter(([, v]) => v.status !== 'owned'));
        if (Object.keys(f).length > 0) filteredCache[code] = f;
      }
      saveCache(id, filteredCache);

      return next;
    });

    if (!userRef.current) return;

    const queue = loadQueue(id).filter(m => m.status !== 'owned');
    queue.push({ type: 'bulk_delete', userId: id, status: 'owned' });
    saveQueue(id, queue);
    sendMutation({ type: 'bulk_delete', userId: id, status: 'owned' }).then(({ error }) => {
      if (error) return;
      saveQueue(id, loadQueue(id).filter(m => !(m.type === 'bulk_delete' && m.status === 'owned')));
    });
  }, []);

  return { ownership, setStatus, getStatus, isOwned, isWishlist, syncing, clearAllWishlist, clearAllOwned };
}

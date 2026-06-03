import { useState, useMemo } from 'react';
import { colors } from '../data/colors';
import { ColorSwatch } from '../components/ColorSwatch';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { getLegacyDisplay } from '../utils/colorUtils';
import { swipeConsumed } from '../App';

import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES } from '../hooks/useSettings';

const TABS = ['All', 'Owned', 'Unowned', 'Wishlist'];

export function MyColorsPage({ ownership, onSetStatus, settings }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
    return colors.filter(c => {
      // Japanese filter
      if (settings?.hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c.code)) return false;
      // Discontinued filter
      if (settings?.hideDiscontinued && DISCONTINUED_CODES.has(c.code)) return false;
      if (tokens.length) {
        const legacy = getLegacyDisplay(c);
        const haystack = [
          c.name,
          c.code,
          legacy?.name,
          legacy?.code,
          c.legacy?.honolulu?.name,
          c.legacy?.honolulu?.code,
          c.legacy?.oahu?.name,
          c.legacy?.oahu?.code,
          c.legacy?.kaala?.name,
          c.legacy?.kaala?.code,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!tokens.every(t => haystack.includes(t))) return false;
      }
      // Tab filter
      const entries = Object.values(ownership[c.code] || {});
      const owned = entries.includes('owned');
      const wish = entries.includes('wishlist');
      if (tab === 'Owned') return owned;
      if (tab === 'Wishlist') return wish;
      if (tab === 'Unowned') return !owned;
      return true;
    });
  }, [search, tab, ownership]);

  return (
    <div style={{ flex: 1, overflowY: 'scroll', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}>
      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: '#fff',
          borderRadius: 12, padding: '0 14px', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8aabab" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search colors, codes..."
            style={{
              flex: 1, border: 'none', background: 'transparent', padding: '12px 0',
              fontSize: 14, color: '#2a3a3a', outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8aabab', fontSize: 16, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', justifyContent: 'center' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: '1.5px solid',
              borderColor: tab === t ? '#1ab5b5' : '#dde8e8',
              background: tab === t ? '#1ab5b5' : '#fff',
              color: tab === t ? '#fff' : '#5a7a7a',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 100px' }}>
        {filtered.map(color => {
          const entries = Object.values(ownership[color.code] || {});
          const owned = entries.includes('owned');
          const wish = entries.includes('wishlist');
          const legacy = getLegacyDisplay(color);

          const badge = owned
            ? <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#1ab5b5', border: '1.5px solid #1ab5b5', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>OWNED</span>
            : wish
            ? <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#f48fb1', border: '1.5px solid #f48fb1', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>WISHLIST</span>
            : <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#aababa', border: '1.5px solid #dde8e8', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>UNOWNED</span>;

          return (
            <div
              key={color.code}
              onClick={() => { if (swipeConsumed) return; setSelected(color); }}
              style={{
                background: '#fff', borderRadius: 12,
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', 
                border: '1.5px solid',
                borderColor: owned ? '#d4f0f0' : wish ? '#ffccdd' : '#f0f4f4',
              }}
            >
              <ColorSwatch color={color} size="md" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'nowrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#1a2a2a', whiteSpace: 'nowrap' }}>{color.name}</span>
                    {legacy && legacy.name.toLowerCase() !== color.name.toLowerCase() && (
                      <span style={{ fontSize: 11, color: '#8aabab', whiteSpace: 'nowrap' }}>({legacy.name})</span>
                    )}
                  </div>
                </div>
                {badge}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ColorDetailModal
          color={selected}
          ownership={ownership}
          onSetStatus={onSetStatus}
          onClose={() => setSelected(null)}
          settings={settings}
        />
      )}
    </div>
  );
}

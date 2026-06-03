import { useState, useMemo } from 'react';
import { colors } from '../data/colors';
import { ColorSwatch } from '../components/ColorSwatch';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { getLegacyDisplay } from '../utils/colorUtils';
import { swipeConsumed } from '../App';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES } from '../hooks/useSettings';
import { C, RADIUS, scrollPage, pillActive, pillInactive } from '../styles/theme';

const TABS = ['All', 'Owned', 'Unowned', 'Wishlist'];

const BADGE = {
  owned:    { color: C.teal,    border: `1.5px solid ${C.teal}`,    label: 'OWNED'    },
  wishlist: { color: C.wish,    border: `1.5px solid ${C.wish}`,    label: 'WISHLIST' },
  unowned:  { color: '#aababa', border: '1.5px solid #dde8e8',      label: 'UNOWNED'  },
};

function Badge({ type }) {
  const s = BADGE[type];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      color: s.color, border: s.border,
      borderRadius: 6, padding: '2px 7px', flexShrink: 0,
    }}>{s.label}</span>
  );
}

export function MyColorsPage({ ownership, onSetStatus, settings }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
    return colors.filter(c => {
      if (settings?.hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c.code)) return false;
      if (settings?.hideDiscontinued && DISCONTINUED_CODES.has(c.code)) return false;
      if (tokens.length) {
        const legacy = getLegacyDisplay(c);
        const haystack = [
          c.name, c.code, legacy?.name, legacy?.code,
          c.legacy?.honolulu?.name, c.legacy?.honolulu?.code,
          c.legacy?.oahu?.name, c.legacy?.oahu?.code,
          c.legacy?.kaala?.name, c.legacy?.kaala?.code,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!tokens.every(t => haystack.includes(t))) return false;
      }
      const entries = Object.values(ownership[c.code] || {});
      const owned = entries.includes('owned');
      const wish = entries.includes('wishlist');
      if (tab === 'Owned') return owned;
      if (tab === 'Wishlist') return wish;
      if (tab === 'Unowned') return !owned;
      return true;
    });
  }, [search, tab, ownership, settings]);

  return (
    <div style={scrollPage}>
      {/* Search */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: C.white,
          borderRadius: RADIUS.lg, padding: '0 14px', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.tealDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search colors, codes..."
            style={{
              flex: 1, border: 'none', background: 'transparent', padding: '12px 0',
              fontSize: 14, color: C.textSub, outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 16, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', justifyContent: 'center' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? pillActive : pillInactive}>{t}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 100px' }}>
        {filtered.map(color => {
          const entries = Object.values(ownership[color.code] || {});
          const owned = entries.includes('owned');
          const wish = entries.includes('wishlist');
          const legacy = getLegacyDisplay(color);
          const badgeType = owned ? 'owned' : wish ? 'wishlist' : 'unowned';

          return (
            <div
              key={color.code}
              onClick={() => { if (swipeConsumed) return; setSelected(color); }}
              style={{
                background: C.white, borderRadius: RADIUS.lg,
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: owned ? '#d4f0f0' : wish ? '#ffccdd' : '#f0f4f4',
              }}
            >
              <ColorSwatch color={color} size="md" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'nowrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: C.text, whiteSpace: 'nowrap' }}>{color.name}</span>
                    {legacy && legacy.name.toLowerCase() !== color.name.toLowerCase() && (
                      <span style={{ fontSize: 11, color: C.tealDim, whiteSpace: 'nowrap' }}>({legacy.name})</span>
                    )}
                  </div>
                </div>
                <Badge type={badgeType} />
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

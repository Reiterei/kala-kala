import { useState, useMemo } from 'react';
import { honoluluSets } from '../data/honolulu-sets';
import { colors as allColors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { TipIcon, getTipIcon } from '../assets/TipIcons';
import { swipeConsumed } from '../App';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES } from '../hooks/useSettings';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, RADIUS, scrollPage, pillActive, pillInactive, chipBase, chipUnowned, chipWish } from '../styles/theme';

const TABS = ['All', 'Owned', 'Unowned', 'Wishlist'];
const colorMap = Object.fromEntries(allColors.map(c => [c.code, c]));

const SERIES_SHORT = {
  'Honolulu': 'HONOLULU', 'Honolulu B': 'HONOLULU B', 'Honolulu Plus': 'HONOLULU+',
  'Honolulu S': 'HONOLULU S', 'Honolulu²': 'HONOLULU²', 'Honolulu² B': 'HONOLULU² B',
};

function getSeriesGroups() {
  const seen = new Map();
  for (const set of honoluluSets) {
    if (!seen.has(set.series)) seen.set(set.series, { tipType1: set.tipType1, tipType2: set.tipType2 });
  }
  return [...seen.entries()].map(([series, { tipType1, tipType2 }]) => ({ series, tipType1, tipType2 }));
}

function getColorsForSeries(series) {
  const seen = new Set();
  for (const set of honoluluSets) {
    if (set.series === series) for (const code of set.colors) seen.add(code);
  }
  return [...seen].sort((a, b) => (colorMap[a]?.sort ?? 9999) - (colorMap[b]?.sort ?? 9999));
}

function ColorChip({ colorCode, status, onClick }) {
  const color = colorMap[colorCode];
  const hex = color ? `#${color.hex}` : '#ccc';

  if (status === 'owned') {
    const r = color ? parseInt(color.hex.substring(0, 2), 16) : 150;
    const g = color ? parseInt(color.hex.substring(2, 4), 16) : 150;
    const b = color ? parseInt(color.hex.substring(4, 6), 16) : 150;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return (
      <div onClick={onClick} style={{
        ...chipBase, cursor: 'pointer',
        background: hex, border: '2px solid rgba(0,0,0,0.08)',
        color: lum > 0.55 ? C.textSub : C.white,
      }}>{colorCode}</div>
    );
  }
  if (status === 'wishlist') {
    return <div onClick={onClick} style={chipWish}>{colorCode}</div>;
  }
  return <div onClick={onClick} style={chipUnowned}>{colorCode}</div>;
}

function SeriesCard({ series, tipType1, tipType2, ownership, onSetStatus, tab, hideJapanese, hideDiscontinued, settings }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const seriesColors = useMemo(() => {
    const all = getColorsForSeries(series);
    return all.filter(c =>
      !(hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c)) &&
      !(hideDiscontinued && DISCONTINUED_CODES.has(c))
    );
  }, [series, hideJapanese, hideDiscontinued]);

  const ownedCodes = useMemo(() => seriesColors.filter(c => ownership[c]?.[series] === 'owned'), [seriesColors, series, ownership]);
  const wishCodes  = useMemo(() => seriesColors.filter(c => ownership[c]?.[series] === 'wishlist'), [seriesColors, series, ownership]);

  const total = seriesColors.length;
  const owned = ownedCodes.length;
  const missing = total - owned;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  const displayColors = useMemo(() => {
    if (tab === 'Owned') return ownedCodes;
    if (tab === 'Wishlist') return wishCodes;
    if (tab === 'Unowned') return seriesColors.filter(c => ownership[c]?.[series] !== 'owned');
    return seriesColors;
  }, [tab, seriesColors, ownedCodes, wishCodes, series, ownership]);

  const getStatus = (code) => ownership[code]?.[series] ?? null;

  return (
    <div style={{ background: C.white, borderRadius: RADIUS.lg, border: `1.5px solid ${C.border}`, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 1, color: C.teal,
                background: '#e8fafa', borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
              }}>{SERIES_SHORT[series] || series}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{series}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.teal, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Complete</div>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.bgInput, borderRadius: RADIUS.sm, padding: '4px 10px', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: C.tealDeep }}>
            <TipIcon type={getTipIcon(tipType1)} size={22} />
            <TipIcon type={getTipIcon(tipType2)} size={22} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4a6a6a' }}>{tipType1} / {tipType2}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase' }}>Markers Owned</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.teal }}>{owned} Owned</span>
            {wishCodes.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.wish }}>{wishCodes.length} Wishlist</span>}
            <span style={{ fontSize: 11, fontWeight: 700, color: C.error }}>{missing} Missing</span>
          </div>
        </div>
      </div>

      <div style={{ height: 5, background: C.tealLight, margin: '0 16px', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #1ab5b5, #0fd4a0)', width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: C.bgCard, border: 'none',
          borderTop: `1px solid ${C.border}`, marginTop: 12, padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: C.tealDim, textTransform: 'uppercase' }}>
          <span style={{ fontSize: 13 }}>{expanded ? '▾' : '▸'}</span> Included Colors
        </span>
        <span style={{ fontSize: 10, color: '#aababa' }}>({displayColors.length})</span>
      </button>

      {expanded && (
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {displayColors.length === 0
            ? <span style={{ fontSize: 12, color: '#aababa' }}>None to show.</span>
            : displayColors.map(code => (
                <ColorChip key={code} colorCode={code} status={getStatus(code)}
                  onClick={() => { if (swipeConsumed) return; setSelectedColor(colorMap[code] || null); }} />
              ))
          }
        </div>
      )}
      {selectedColor && (
        <ColorDetailModal
          color={selectedColor}
          ownership={ownership}
          onSetStatus={onSetStatus}
          onClose={() => setSelectedColor(null)}
          settings={settings}
        />
      )}
    </div>
  );
}

export function MyMarkersPage({ ownership, onSetStatus, settings }) {
  const hideJapanese = settings?.hideJapanese ?? false;
  const hideDiscontinued = settings?.hideDiscontinued ?? false;
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const seriesGroups = useMemo(() => getSeriesGroups(), []);
  const windowWidth = useWindowWidth();
  const isWide = windowWidth >= 900;
  const px = isWide ? 20 : 16;
  const filteredGroups = useMemo(() => {
    let groups = seriesGroups;
    if (search.trim()) {
      const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
      groups = groups.filter(({ series }) => tokens.every(t => series.toLowerCase().includes(t)));
    }
    if (tab === 'Owned') {
      groups = groups.filter(({ series }) => getColorsForSeries(series).some(c => ownership[c]?.[series] === 'owned'));
    } else if (tab === 'Wishlist') {
      groups = groups.filter(({ series }) => getColorsForSeries(series).some(c => ownership[c]?.[series] === 'wishlist'));
    }
    return groups;
  }, [seriesGroups, search, tab, ownership]);

  return (
    <div style={scrollPage}>
      <div style={{ padding: `16px ${px}px 0` }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderRadius: RADIUS.lg, padding: '0 14px', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.tealDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search series..."
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 0', fontSize: 14, color: C.textSub, outline: 'none' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 16, padding: 0 }}>×</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: `12px ${px}px`, justifyContent: 'center' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? pillActive : pillInactive}>{t}</button>
        ))}
      </div>

      <div style={{ padding: `0 ${px}px 100px`, display: isWide ? 'grid' : 'block', gridTemplateColumns: isWide ? '1fr 1fr' : undefined, columnGap: isWide ? 16 : undefined }}>
        {filteredGroups.map(({ series, tipType1, tipType2 }) => (
          <SeriesCard
            key={series} series={series} tipType1={tipType1} tipType2={tipType2}
            ownership={ownership} onSetStatus={onSetStatus} tab={tab}
            hideJapanese={hideJapanese} hideDiscontinued={hideDiscontinued} settings={settings}
          />
        ))}
      </div>
    </div>
  );
}

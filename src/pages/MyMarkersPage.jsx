import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { allSets, SERIES_SHORT, getSeriesBadgeColors, getSeriesCardColors } from '../data/all-sets';
import { colors as allColors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { TipIcon, getTipIcon } from '../assets/TipIcons';
import { swipeConsumed } from '../App';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES } from '../hooks/useSettings';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, FONT, RADIUS, scrollPage, pillActive, pillInactive, chipBase, chipUnowned, chipWish } from '../styles/theme';

const TABS = ['All', 'Owned', 'Unowned', 'Wishlist'];
const colorMap = Object.fromEntries(allColors.map(c => [c.code, c]));

function getSeriesGroups() {
  const seen = new Map();
  for (const set of allSets) {
    if (!seen.has(set.series)) seen.set(set.series, { tipType1: set.tipType1, tipType2: set.tipType2 });
  }
  return [...seen.entries()].map(([series, { tipType1, tipType2 }]) => ({ series, tipType1, tipType2 }));
}

function getColorsForSeries(series) {
  const seen = new Set();
  for (const set of allSets) {
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
  const [confirming, setConfirming] = useState(false);

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
  const cc = getSeriesCardColors(series);

  const handleAddAll = (status) => {
    seriesColors.forEach(code => {
      if (status === 'wishlist' && ownership[code]?.[series] === 'owned') return;
      if (ownership[code]?.[series] !== status) onSetStatus(code, series, status);
    });
    setConfirming(false);
  };

  return (
    <>
      {confirming && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 32, fontFamily: FONT }} onClick={() => setConfirming(false)}>
          <div style={{ background: C.white, borderRadius: RADIUS.xl, padding: '24px 24px 20px', maxWidth: 320, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>Add all markers?</div>
            <div style={{ fontSize: 13, color: '#a8784a', marginBottom: 20 }}>Mark all {seriesColors.length} markers in <strong>{series}</strong> as:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => handleAddAll('owned')} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: 'none', background: C.teal, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add All to Owned</button>
              <button onClick={() => handleAddAll('wishlist')} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: `1.5px solid ${C.teal}`, background: C.white, color: C.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add All to Wishlist</button>
              <button onClick={() => setConfirming(false)} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: `1.5px solid ${C.borderMid}`, background: C.white, color: C.tealText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      , document.body)}

      <div style={{ background: cc.cardBg, borderRadius: RADIUS.lg, border: `1.5px solid ${cc.border}`, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1, lineHeight: 1.6, color: getSeriesBadgeColors(series).text,
                background: getSeriesBadgeColors(series).bg, borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
              }}>{SERIES_SHORT[series] || series}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{series}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: cc.accent, lineHeight: 1.2 }}>{pct}%</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: cc.accentSoft, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.6 }}>Complete</div>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cc.track, borderRadius: RADIUS.sm, padding: '4px 10px', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: cc.accent }}>
            <TipIcon type={getTipIcon(tipType1)} size={22} color={cc.accent} />
            <TipIcon type={getTipIcon(tipType2)} size={22} color={cc.accent} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: cc.accent }}>{tipType1} / {tipType2}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase', lineHeight: 1.6 }}>Markers Owned</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: cc.accent, lineHeight: 1.4 }}>{owned} Owned</span>
            {wishCodes.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.wish, lineHeight: 1.4 }}>{wishCodes.length} Wishlist</span>}
            <span style={{ fontSize: 11, fontWeight: 700, color: C.missingText, lineHeight: 1.4 }}>{missing} Missing</span>
          </div>
        </div>
      </div>

      <div style={{ height: 5, background: cc.track, margin: '0 16px', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: cc.accent, width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ display: 'flex', borderTop: `1px solid ${cc.border}`, marginTop: 12 }}>
        <button onClick={() => setConfirming(true)} style={{ padding: '8px 16px', background: 'none', border: 'none', borderRight: `1px solid ${cc.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: cc.accent, lineHeight: 1.4, whiteSpace: 'nowrap' }}>+ Add All</button>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            flex: 1, background: cc.cardBg, border: 'none',
            padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: cc.accent, textTransform: 'uppercase', lineHeight: 1.6 }}>
            <span style={{ fontSize: 13 }}>{expanded ? '▾' : '▸'}</span> Included Colors
          </span>
          <span style={{ fontSize: 10, color: cc.accentSoft }}>({displayColors.length})</span>
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {displayColors.length === 0
            ? <span style={{ fontSize: 12, color: cc.accentSoft }}>None to show.</span>
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
    </>
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

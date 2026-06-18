import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { honoluluSets } from '../data/honolulu-sets';
import { colors as allColors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { TipIcon, getTipIcon } from '../assets/TipIcons';
import { swipeConsumed } from '../App';
import ohuhuLogo from '../assets/ohuhu-logo.png';
import michaelsLogo from '../assets/michaels-logo.png';
import walmartLogo from '../assets/walmart-logo.png';
import amazonLogo from '../assets/amazon-logo.png';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES, isUnavailableSet } from '../hooks/useSettings';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, FONT, RADIUS, SHADOW, scrollPage, chipBase, chipUnowned, chipWish } from '../styles/theme';

const colorMap = Object.fromEntries(allColors.map(c => [c.code, c]));
const SERIES_ORDER = ['Honolulu', 'Honolulu B', 'Honolulu Plus', 'Honolulu S', 'Honolulu²', 'Honolulu² B'];
const SERIES_SHORT = {
  'Honolulu': 'HONOLULU', 'Honolulu B': 'HONOLULU B', 'Honolulu Plus': 'HONOLULU+',
  'Honolulu S': 'HONOLULU S', 'Honolulu²': 'HONOLULU²', 'Honolulu² B': 'HONOLULU² B',
};

function getMeta(set) { return [set.edition, set.version].filter(Boolean).join(' · '); }

function ColorChip({ colorCode, status, onClick }) {
  const color = colorMap[colorCode];
  const hex = color ? `#${color.hex}` : '#ccc';
  if (status === 'owned') {
    const r = color ? parseInt(color.hex.substring(0, 2), 16) : 150;
    const g = color ? parseInt(color.hex.substring(2, 4), 16) : 150;
    const b = color ? parseInt(color.hex.substring(4, 6), 16) : 150;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return <div onClick={onClick} style={{ ...chipBase, cursor: 'pointer', background: hex, border: '2px solid rgba(0,0,0,0.08)', color: lum > 0.55 ? C.textSub : C.white }}>{colorCode}</div>;
  }
  if (status === 'wishlist') return <div onClick={onClick} style={chipWish}>{colorCode}</div>;
  return <div onClick={onClick} style={chipUnowned}>{colorCode}</div>;
}

function SetCard({ set, ownership, colorMode, onSetStatus, settings }) {
  const [expanded, setExpanded] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const toggleExpanded = () => { setExpanded(e => !e); setBuyOpen(false); };
  const toggleBuyOpen  = () => { setBuyOpen(o => !o); setExpanded(false); };

  const getStatus = (code) => {
    if (colorMode === 'exact') return ownership[code]?.[set.series] ?? null;
    const vals = Object.values(ownership[code] || {});
    if (vals.includes('owned')) return 'owned';
    if (vals.includes('wishlist')) return 'wishlist';
    return null;
  };

  const owned    = useMemo(() => set.colors.filter(c => getStatus(c) === 'owned').length,    [set, ownership, colorMode]);
  const wishlist = useMemo(() => set.colors.filter(c => getStatus(c) === 'wishlist').length, [set, ownership, colorMode]);
  const total = set.colors.length;
  const missing = total - owned;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const meta = getMeta(set);

  const handleAddAll = (status) => {
    set.colors.forEach(code => {
      if (status === 'wishlist' && ownership[code]?.[set.series] === 'owned') return;
      if (ownership[code]?.[set.series] !== status) onSetStatus(code, set.series, status);
    });
    setConfirming(false);
  };

  const dropdownStyle = {
    background: C.white, border: `1.5px solid ${C.border}`, borderRadius: RADIUS.md,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '6px 0',
  };

  return (
    <>
      {confirming && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 32, fontFamily: FONT }} onClick={() => setConfirming(false)}>
          <div style={{ background: C.white, borderRadius: RADIUS.xl, padding: '24px 24px 20px', maxWidth: 320, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>Add all markers?</div>
            <div style={{ fontSize: 13, color: '#a8784a', marginBottom: 20 }}>Mark all {set.colors.length} markers in <strong>{set.name}</strong> as:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => handleAddAll('owned')} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: 'none', background: C.teal, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add All to Owned</button>
              <button onClick={() => handleAddAll('wishlist')} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: `1.5px solid ${C.teal}`, background: C.white, color: C.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add All to Wishlist</button>
              <button onClick={() => setConfirming(false)} style={{ width: '100%', padding: '10px', borderRadius: RADIUS.md, border: `1.5px solid ${C.borderMid}`, background: C.white, color: C.tealText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      , document.body)}

      <div style={{ background: C.white, borderRadius: RADIUS.lg, border: `1.5px solid ${C.border}`, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, lineHeight: 1.6, color: C.teal, background: '#fbe2c0', borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase' }}>
                  {SERIES_SHORT[set.series] || set.series}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{set.name}</div>
              {meta && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{meta}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.teal, lineHeight: 1.2 }}>{pct}%</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.6 }}>Complete</div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: C.tipBg, borderRadius: RADIUS.sm, padding: '4px 10px', marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', color: C.tealDeep }}>
              <TipIcon type={getTipIcon(set.tipType1)} size={22} />
              <TipIcon type={getTipIcon(set.tipType2)} size={22} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7a5430' }}>{set.tipType1} / {set.tipType2}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase', lineHeight: 1.6 }}>
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, lineHeight: 1.4 }}>{owned} Owned</span>
              {wishlist > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.wish, lineHeight: 1.4 }}>{wishlist} Wishlist</span>}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.error, lineHeight: 1.4 }}>{missing} Missing</span>
            </div>
          </div>
        </div>

        <div style={{ height: 5, background: C.tealLight, margin: '0 16px', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: pct === 100 ? C.teal : C.teal, width: `${pct}%`, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, marginTop: 12 }}>
          <button onClick={() => setConfirming(true)} style={{ padding: '8px 16px', background: 'none', border: 'none', borderRight: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.teal, lineHeight: 1.4, whiteSpace: 'nowrap' }}>+ Add All</button>
          <button onClick={toggleExpanded} style={{ flex: 1, background: C.bgCard, border: 'none', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: C.tealDim, textTransform: 'uppercase', lineHeight: 1.6 }}>
              <span style={{ fontSize: 13 }}>{expanded ? '▾' : '▸'}</span> Included Colors
            </span>
            <span style={{ fontSize: 10, color: '#c9a880' }}>({total})</span>
          </button>
          {set.urls && Object.values(set.urls).some(Boolean) && (
            <button onClick={toggleBuyOpen} style={{ background: C.bgCard, border: 'none', borderLeft: `1px solid ${C.border}`, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase' }}>
                <span style={{ fontSize: 13 }}>{buyOpen ? '▾' : '▸'}</span> Where to Buy
              </span>
            </button>
          )}
        </div>

        {buyOpen && set.urls && Object.values(set.urls).some(Boolean) && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 16px 12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { key: 'ohuhu', label: 'Ohuhu.com', logo: ohuhuLogo },
                { key: 'michaels', label: 'Michaels', logo: michaelsLogo },
                { key: 'walmart', label: 'Walmart', logo: walmartLogo },
                { key: 'amazon', label: 'Amazon', logo: amazonLogo },
              ].filter(({ key }) => set.urls[key]).map(({ key, label, logo }) => (
                <a key={key} href={set.urls[key]} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', borderRadius: RADIUS.sm, background: C.white, textDecoration: 'none' }}
                >
                  <img src={logo} alt={label} style={{ maxHeight: 28, maxWidth: '100%', objectFit: 'contain' }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {expanded && (
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {set.colors.map(code => (
              <ColorChip key={code} colorCode={code} status={getStatus(code)}
                onClick={() => { if (swipeConsumed) return; setSelectedColor(colorMap[code] || null); }} />
            ))}
          </div>
        )}
      </div>

      {selectedColor && (
        <ColorDetailModal
          color={selectedColor}
          ownership={ownership}
          onSetStatus={onSetStatus}
          onClose={() => setSelectedColor(null)}
          settings={settings}
        />
      )}
    </>
  );
}

export function RecommendedPage({ ownership, onSetStatus, settings }) {
  const hideJapanese    = settings?.hideJapanese    ?? false;
  const hideUnavailable = settings?.hideUnavailable ?? false;
  const hideDiscontinued = settings?.hideDiscontinued ?? false;
  const windowWidth = useWindowWidth();
  const isWide = windowWidth >= 900;
  const px = isWide ? 20 : 16;
  const [colorMode, setColorMode] = useState(() => localStorage.getItem('kk-rec-colorMode') ?? 'exact');
  const [seriesFilter, setSeriesFilter] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kk-rec-series') || '[]')); } catch { return new Set(); }
  });
  const [seriesDropdownOpen, setSeriesDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('kk-rec-sort') ?? 'Most New');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const seriesDropdownRef = useRef(null);
  const sortDropdownRef   = useRef(null);

  useEffect(() => { localStorage.setItem('kk-rec-colorMode', colorMode); }, [colorMode]);
  useEffect(() => { localStorage.setItem('kk-rec-series', JSON.stringify([...seriesFilter])); }, [seriesFilter]);
  useEffect(() => { localStorage.setItem('kk-rec-sort', sortBy); }, [sortBy]);

  useEffect(() => {
    if (!seriesDropdownOpen) return;
    const handler = e => { if (seriesDropdownRef.current && !seriesDropdownRef.current.contains(e.target)) setSeriesDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [seriesDropdownOpen]);

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handler = e => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortDropdownOpen]);

  const retailSets = useMemo(() => {
    let sets = honoluluSets.filter(s => !s.name.includes('Individual'));
    if (hideUnavailable) sets = sets.filter(s => !isUnavailableSet(s));
    if (hideJapanese || hideDiscontinued) {
      sets = sets
        .map(s => ({ ...s, colors: s.colors.filter(c => !(hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c)) && !(hideDiscontinued && DISCONTINUED_CODES.has(c))) }))
        .filter(s => s.colors.length > 0);
    }
    return sets;
  }, [hideJapanese, hideUnavailable, hideDiscontinued]);

  const allSeries = useMemo(() => {
    const seen = new Set(retailSets.map(s => s.series));
    return ['All Markers', ...SERIES_ORDER.filter(s => seen.has(s))];
  }, [retailSets]);

  const filtered = useMemo(() => {
    let sets = seriesFilter.size === 0 ? retailSets : retailSets.filter(s => seriesFilter.has(s.series));
    if (search.trim()) {
      const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
      sets = sets.filter(s => tokens.every(t => [s.name, s.edition].filter(Boolean).join(' ').toLowerCase().includes(t)));
    }
    sets = sets.map(s => {
      const owned    = colorMode === 'exact' ? s.colors.filter(c => ownership[c]?.[s.series] === 'owned').length    : s.colors.filter(c => Object.values(ownership[c] || {}).includes('owned')).length;
      const wishlist = colorMode === 'exact' ? s.colors.filter(c => ownership[c]?.[s.series] === 'wishlist').length : s.colors.filter(c => Object.values(ownership[c] || {}).includes('wishlist')).length;
      return { ...s, _owned: owned, _missing: s.colors.length - owned, _wishlist: wishlist };
    });
    if (sortBy === 'Most New')       sets = [...sets].sort((a, b) => b._missing - a._missing);
    else if (sortBy === '% New')     sets = [...sets].sort((a, b) => { const d = (b._missing / b.colors.length) - (a._missing / a.colors.length); return d !== 0 ? d : b._missing - a._missing; });
    else if (sortBy === 'Most Wishlist') sets = [...sets].sort((a, b) => b._wishlist - a._wishlist);
    else if (sortBy === 'Largest')   sets = [...sets].sort((a, b) => b.count - a.count);
    else if (sortBy === 'Smallest')  sets = [...sets].sort((a, b) => a.count - b.count);
    return sets;
  }, [retailSets, seriesFilter, sortBy, ownership, colorMode, search]);

  const dropdownMenu = {
    position: 'absolute', top: '100%', zIndex: 200, marginTop: 4,
    background: C.white, border: `1.5px solid ${C.border}`, borderRadius: RADIUS.md,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '6px 0',
  };

  return (
    <div style={{ ...scrollPage, background: C.bg }}>
      <div style={{ padding: `16px ${px}px 12px`, borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderRadius: RADIUS.lg, padding: '0 14px', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.tealDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sets..."
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 0', fontSize: 14, color: C.textSub, outline: 'none' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 16, padding: 0 }}>×</button>}
        </div>

        {/* Color mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', background: C.white, borderRadius: 24, padding: 3 }}>
            {['exact', 'colors'].map((mode, i) => (
              <button key={mode} onClick={() => setColorMode(mode)} style={{
                padding: '6px 16px', borderRadius: RADIUS.pill, border: 'none',
                background: colorMode === mode ? C.teal : 'transparent',
                color: colorMode === mode ? C.white : C.tealText,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>{i === 0 ? 'Exact Markers' : 'Colors Only'}</button>
            ))}
          </div>
        </div>

        {/* Series + Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          {/* Series dropdown */}
          <div style={{ position: 'relative' }} ref={seriesDropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.6 }}>Series</span>
              <button onClick={() => setSeriesDropdownOpen(o => !o)} style={{ fontSize: 12, fontWeight: 600, color: C.text, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                {seriesFilter.size === 0 ? 'All Markers' : seriesFilter.size === 1 ? [...seriesFilter][0] : `${seriesFilter.size} Selected`}
                <span style={{ fontSize: 10, color: C.textMuted }}>{seriesDropdownOpen ? '▲' : '▼'}</span>
              </button>
            </div>
            {seriesDropdownOpen && (
              <div style={{ ...dropdownMenu, left: 0, minWidth: 170 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.text, borderBottom: `1px solid ${C.border}` }}>
                  <input type="checkbox" checked={seriesFilter.size === 0} onChange={() => setSeriesFilter(new Set())} style={{ accentColor: C.teal, width: 15, height: 15 }} />
                  All Markers
                </label>
                {allSeries.filter(s => s !== 'All Markers').map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: C.textSub }}>
                    <input type="checkbox" checked={seriesFilter.has(s)} onChange={() => setSeriesFilter(prev => { const next = new Set(prev); if (next.has(s)) next.delete(s); else next.add(s); return next; })} style={{ accentColor: C.teal, width: 15, height: 15 }} />
                    {s}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }} ref={sortDropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.6 }}>Sort</span>
              <button onClick={() => setSortDropdownOpen(o => !o)} style={{ fontSize: 12, fontWeight: 600, color: C.text, border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                {sortBy}
                <span style={{ fontSize: 10, color: C.textMuted }}>{sortDropdownOpen ? '▲' : '▼'}</span>
              </button>
            </div>
            {sortDropdownOpen && (
              <div style={{ ...dropdownMenu, right: 0, minWidth: 140 }}>
                {['Most New', '% New', 'Most Wishlist', 'Largest', 'Smallest'].map(opt => (
                  <button key={opt} onClick={() => { setSortBy(opt); setSortDropdownOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 14px', border: 'none', background: sortBy === opt ? '#fbe2c0' : 'transparent', color: sortBy === opt ? C.teal : C.textSub, fontSize: 13, fontWeight: sortBy === opt ? 700 : 400, cursor: 'pointer' }}
                  >{opt}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: `12px ${px}px 100px`, display: isWide ? 'grid' : 'block', gridTemplateColumns: isWide ? '1fr 1fr' : undefined, columnGap: isWide ? 16 : undefined }}>
        {filtered.map(set => (
          <SetCard key={set.id} set={set} ownership={ownership} colorMode={colorMode} onSetStatus={onSetStatus} settings={settings} />
        ))}
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { allSets, SERIES_GROUPS, SERIES_SHORT, getSeriesBadgeColors, getSeriesCardColors } from '../data/all-sets';
import { colors as allColors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { SearchBar } from '../components/SearchBar';
import { FilterModal, FilterSection, FilterPillRow, SeriesFilterTree } from '../components/FilterModal';
import { TipIcon, getTipIcon, getTipLabel } from '../assets/TipIcons';
import { swipeConsumed } from '../App';
import ohuhuLogo from '../assets/ohuhu-logo.png';
import michaelsLogo from '../assets/michaels-logo.png';
import walmartLogo from '../assets/walmart-logo.png';
import amazonLogo from '../assets/amazon-logo.png';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES, COLORLESS_BLENDER_CODE, isUnavailableSet } from '../hooks/useSettings';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, FONT, RADIUS, SHADOW, scrollPage, chipBase, chipUnowned, chipWish } from '../styles/theme';

const colorMap = Object.fromEntries(allColors.map(c => [c.code, c]));

function getMeta(set) { return [set.edition, set.version].filter(Boolean).join(' · '); }

function ColorChip({ colorCode, status, onClick, cc }) {
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
  return (
    <div onClick={onClick} style={{
      ...chipUnowned,
      background: C.white,
      border: `2px dashed ${cc?.swatchEmptyBorder ?? C.tealMid}`,
      color: cc?.swatchEmptyText ?? C.tealDim,
    }}>{colorCode}</div>
  );
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
  const cc = getSeriesCardColors(set.series);

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

      <div style={{ background: cc.cardBg, borderRadius: RADIUS.lg, border: `1.5px solid ${cc.border}`, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, lineHeight: 1.6, color: getSeriesBadgeColors(set.series).text, background: getSeriesBadgeColors(set.series).bg, borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase' }}>
                  {SERIES_SHORT[set.series] || set.series}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{set.name}</div>
              {meta && <div style={{ fontSize: 11, color: cc.accentSoft, marginTop: 2 }}>{meta}</div>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: cc.accent, lineHeight: 1.2 }}>{pct}%</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: cc.accentSoft, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.6 }}>Complete</div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cc.track, borderRadius: RADIUS.sm, padding: '4px 10px', marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', color: cc.accent }}>
              <TipIcon type={getTipIcon(set.tipType1)} size={22} color={cc.accent} />
              {set.tipType2 && <TipIcon type={getTipIcon(set.tipType2)} size={22} color={cc.accent} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: cc.accent }}>{set.tipType2 ? `${getTipLabel(set.tipType1)} / ${getTipLabel(set.tipType2)}` : getTipLabel(set.tipType1)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase', lineHeight: 1.6 }}>
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cc.accent, lineHeight: 1.4 }}>{owned} Owned</span>
              {wishlist > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: C.wish, lineHeight: 1.4 }}>{wishlist} Wishlist</span>}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.error, lineHeight: 1.4 }}>{missing} Missing</span>
            </div>
          </div>
        </div>

        <div style={{ height: 5, background: cc.track, margin: '0 16px', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: cc.accent, width: `${pct}%`, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'flex', borderTop: `1px solid ${cc.border}`, marginTop: 12 }}>
          <button onClick={() => setConfirming(true)} style={{ padding: '8px 16px', background: 'none', border: 'none', borderRight: `1px solid ${cc.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: cc.accent, lineHeight: 1.4, whiteSpace: 'nowrap' }}>+ Add All</button>
          <button onClick={toggleExpanded} style={{ flex: 1, background: cc.cardBg, border: 'none', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: cc.accent, textTransform: 'uppercase', lineHeight: 1.6 }}>
              <span style={{ fontSize: 13 }}>{expanded ? '▾' : '▸'}</span> Included Colors
            </span>
            <span style={{ fontSize: 10, color: cc.accentSoft }}>({total})</span>
          </button>
          {set.urls && Object.values(set.urls).some(Boolean) && (
            <button onClick={toggleBuyOpen} style={{ background: cc.cardBg, border: 'none', borderLeft: `1px solid ${cc.border}`, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: cc.accentSoft, textTransform: 'uppercase' }}>
                <span style={{ fontSize: 13 }}>{buyOpen ? '▾' : '▸'}</span> Where to Buy
              </span>
            </button>
          )}
        </div>

        {buyOpen && set.urls && Object.values(set.urls).some(Boolean) && (
          <div style={{ borderTop: `1px solid ${cc.border}`, padding: '8px 16px 12px' }}>
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
              <ColorChip key={code} colorCode={code} status={getStatus(code)} cc={cc}
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
          colorList={set.colors.map(code => colorMap[code]).filter(Boolean)}
          onNavigate={setSelectedColor}
        />
      )}
    </>
  );
}

const SORT_OPTIONS = ['Most New', '% New', 'Most Wishlist', 'Largest', 'Smallest'];
const COLOR_MODE_OPTIONS = ['Exact Markers', 'Colors Only'];
const COLOR_MODE_TO_VALUE = { 'Exact Markers': 'exact', 'Colors Only': 'colors' };
const VALUE_TO_COLOR_MODE = { exact: 'Exact Markers', colors: 'Colors Only' };

export function RecommendedPage({ ownership, onSetStatus, settings }) {
  const hideJapanese    = settings?.hideJapanese    ?? false;
  const hideUnavailable = settings?.hideUnavailable ?? false;
  const hideDiscontinued = settings?.hideDiscontinued ?? false;
  const hideColorlessBlender = settings?.hideColorlessBlender ?? false;
  const windowWidth = useWindowWidth();
  const isWide = windowWidth >= 900;
  const px = isWide ? 20 : 16;
  const [colorMode, setColorMode] = useState(() => localStorage.getItem('kk-rec-colorMode') ?? 'exact');
  const [seriesFilter, setSeriesFilter] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kk-rec-series') || '[]')); } catch { return new Set(); }
  });
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('kk-rec-sort') ?? 'Most New');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const setColorModeAndSave = (mode) => { setColorMode(mode); localStorage.setItem('kk-rec-colorMode', mode); };
  const setSortByAndSave = (s) => { setSortBy(s); localStorage.setItem('kk-rec-sort', s); };
  const setSeriesAndSave = (next) => { setSeriesFilter(next); localStorage.setItem('kk-rec-series', JSON.stringify([...next])); };

  const retailSets = useMemo(() => {
    let sets = allSets.filter(s => !s.name.includes('Individual'));
    if (hideUnavailable) sets = sets.filter(s => !isUnavailableSet(s));
    if (hideJapanese || hideDiscontinued || hideColorlessBlender) {
      sets = sets
        .map(s => ({ ...s, colors: s.colors.filter(c =>
          !(hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c)) &&
          !(hideDiscontinued && DISCONTINUED_CODES.has(c)) &&
          !(hideColorlessBlender && c === COLORLESS_BLENDER_CODE)
        ) }))
        .filter(s => s.colors.length > 0);
    }
    return sets;
  }, [hideJapanese, hideUnavailable, hideDiscontinued, hideColorlessBlender]);

  const filterActive = seriesFilter.size > 0 || sortBy !== 'Most New' || colorMode !== 'exact';

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

  return (
    <div style={{ ...scrollPage, background: C.bg }}>
      <div style={{ padding: `16px ${px}px 12px`, borderBottom: `1px solid ${C.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search sets..."
          onFilterClick={() => setFilterOpen(true)}
          filterActive={filterActive}
        />
      </div>

      <div style={{ padding: `12px ${px}px 100px`, display: isWide ? 'grid' : 'block', gridTemplateColumns: isWide ? '1fr 1fr' : undefined, columnGap: isWide ? 16 : undefined }}>
        {filtered.map(set => (
          <SetCard key={set.id} set={set} ownership={ownership} colorMode={colorMode} onSetStatus={onSetStatus} settings={settings} />
        ))}
      </div>

      {filterOpen && (
        <FilterModal
          title="Filter Sets"
          onClose={() => setFilterOpen(false)}
          onReset={() => { setColorModeAndSave('exact'); setSeriesAndSave(new Set()); setSortByAndSave('Most New'); }}
        >
          <FilterSection label="Color Mode">
            <FilterPillRow
              options={COLOR_MODE_OPTIONS}
              value={VALUE_TO_COLOR_MODE[colorMode]}
              onChange={opt => setColorModeAndSave(COLOR_MODE_TO_VALUE[opt])}
            />
          </FilterSection>

          <FilterSection label="Sort">
            <FilterPillRow options={SORT_OPTIONS} value={sortBy} onChange={setSortByAndSave} />
          </FilterSection>

          <FilterSection label="Series">
            <SeriesFilterTree groups={SERIES_GROUPS} selected={seriesFilter} onChange={setSeriesAndSave} />
          </FilterSection>
        </FilterModal>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { colors } from '../data/colors';
import { allSets, SERIES_GROUPS, getSeriesBadgeColors } from '../data/all-sets';
import { ColorSwatch } from '../components/ColorSwatch';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { SearchBar } from '../components/SearchBar';
import { FilterModal, FilterSection, FilterToggleRow, SeriesFilterTree } from '../components/FilterModal';
import { getLegacyDisplay } from '../utils/colorUtils';
import { swipeConsumed } from '../App';
import { JAPANESE_EXCLUSIVE_CODES, DISCONTINUED_CODES, COLORLESS_BLENDER_CODE } from '../hooks/useSettings';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, RADIUS, scrollPage } from '../styles/theme';

const BADGE = {
  owned:    { color: C.teal,    border: `1.5px solid ${C.teal}`,    label: 'OWNED'    },
  wishlist: { color: C.wish,    border: `1.5px solid ${C.wish}`,    label: 'WISHLIST' },
  unowned:  { color: C.tealDim, border: `1.5px solid ${C.tealMid}`,  label: 'UNOWNED'  },
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
  const [showUnowned, setShowUnowned] = useState(() => localStorage.getItem('kk-mycolors-showUnowned') ?? 'show');
  const [showOwned, setShowOwned] = useState(() => localStorage.getItem('kk-mycolors-showOwned') ?? 'show');
  const [showWishlist, setShowWishlist] = useState(() => localStorage.getItem('kk-mycolors-showWishlist') ?? 'show');
  const [selected, setSelected] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kk-mycolors-series') || '[]')); } catch { return new Set(); }
  });
  const windowWidth = useWindowWidth();
  const isWide = windowWidth >= 900;

  const px = isWide ? 20 : 16;

  const setSeriesAndSave = (next) => {
    setSeriesFilter(next);
    localStorage.setItem('kk-mycolors-series', JSON.stringify([...next]));
  };
  const setShowUnownedAndSave = (v) => { setShowUnowned(v); localStorage.setItem('kk-mycolors-showUnowned', v); };
  const setShowOwnedAndSave = (v) => { setShowOwned(v); localStorage.setItem('kk-mycolors-showOwned', v); };
  const setShowWishlistAndSave = (v) => { setShowWishlist(v); localStorage.setItem('kk-mycolors-showWishlist', v); };

  const codeToSeries = useMemo(() => {
    const map = new Map();
    for (const set of allSets) {
      for (const code of set.colors) {
        if (!map.has(code)) map.set(code, new Set());
        map.get(code).add(set.series);
      }
    }
    return map;
  }, []);

  const filterActive = seriesFilter.size > 0 || showUnowned === 'hide' || showOwned === 'hide' || showWishlist === 'hide';

  const filtered = useMemo(() => {
    const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
    return colors.filter(c => {
      if (settings?.hideJapanese && JAPANESE_EXCLUSIVE_CODES.has(c.code)) return false;
      if (settings?.hideDiscontinued && DISCONTINUED_CODES.has(c.code)) return false;
      if (settings?.hideColorlessBlender && c.code === COLORLESS_BLENDER_CODE) return false;
      if (seriesFilter.size > 0) {
        const series = codeToSeries.get(c.code);
        if (!series || ![...seriesFilter].some(s => series.has(s))) return false;
      }
      if (tokens.length) {
        const legacy = getLegacyDisplay(c);
        const haystack = [
          c.name, c.code, legacy?.name, legacy?.code,
          c.legacy?.honolulu?.name, c.legacy?.honolulu?.code,
          c.legacy?.oahu?.name, c.legacy?.oahu?.code,
          c.legacy?.kaala?.name, c.legacy?.kaala?.code,
          c.legacy?.original?.name, c.legacy?.original?.code,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!tokens.every(t => haystack.includes(t))) return false;
      }
      const entries = Object.values(ownership[c.code] || {});
      const owned = entries.includes('owned');
      const wish = entries.includes('wishlist');
      if (owned && showOwned === 'hide') return false;
      if (wish && !owned && showWishlist === 'hide') return false;
      if (!owned && !wish && showUnowned === 'hide') return false;
      return true;
    });
  }, [search, ownership, settings, seriesFilter, codeToSeries, showUnowned, showOwned, showWishlist]);

  return (
    <div style={scrollPage}>
      {/* Search + Filter */}
      <div style={{ padding: `16px ${px}px 0` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search colors, codes..."
          onFilterClick={() => setFilterOpen(true)}
          filterActive={filterActive}
        />
      </div>

      {/* List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 8,
        padding: `16px ${px}px 100px`,
      }}>
        {filtered.map(color => {
          const entries = Object.values(ownership[color.code] || {});
          const owned = entries.includes('owned');
          const wish = entries.includes('wishlist');
          const badgeType = owned ? 'owned' : wish ? 'wishlist' : 'unowned';

          return (
            <div
              key={color.code}
              onClick={() => { if (swipeConsumed) return; setSelected(color); }}
              style={{
                background: C.white, borderRadius: RADIUS.lg,
                padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: owned ? '#f6cba0' : wish ? '#f0a8c0' : '#fbe8d3',
              }}
            >
              <ColorSwatch color={color} size="md" />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{color.name}</div>
                </div>
                <Badge type={badgeType} />
              </div>
            </div>
          );
        })}
      </div>

      {filterOpen && (
        <FilterModal
          title="Filter Colors"
          onClose={() => setFilterOpen(false)}
          onReset={() => { setShowUnownedAndSave('show'); setShowOwnedAndSave('show'); setShowWishlistAndSave('show'); setSeriesAndSave(new Set()); }}
        >
          <FilterSection label="Status">
            <FilterToggleRow label="Unowned Colors" value={showUnowned} onChange={setShowUnownedAndSave} />
            <FilterToggleRow label="Owned Colors" value={showOwned} onChange={setShowOwnedAndSave} />
            <FilterToggleRow label="Wishlist Colors" value={showWishlist} onChange={setShowWishlistAndSave} />
          </FilterSection>

          <FilterSection label="Series">
            <SeriesFilterTree groups={SERIES_GROUPS} selected={seriesFilter} onChange={setSeriesAndSave} getColors={getSeriesBadgeColors} />
          </FilterSection>
        </FilterModal>
      )}

      {selected && (
        <ColorDetailModal
          color={selected}
          ownership={ownership}
          onSetStatus={onSetStatus}
          onClose={() => setSelected(null)}
          settings={settings}
          colorList={filtered}
          onNavigate={setSelected}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getLegacyList, getSeriesForColor } from '../utils/colorUtils';
import { honoluluSets } from '../data/honolulu-sets';
import { TipIcon, getTipIcon } from '../assets/TipIcons';
import { isUnavailableSet } from '../hooks/useSettings';
import { C, FONT, RADIUS, SHADOW, statusOwned, statusOwnedOff, statusWish, statusWishOff } from '../styles/theme';

const ALL_SETS = honoluluSets;

function getDistinctSeries() {
  const seen = new Map();
  for (const set of ALL_SETS) {
    if (!seen.has(set.series)) seen.set(set.series, { tipType1: set.tipType1, tipType2: set.tipType2 });
  }
  return [...seen.entries()].map(([series, { tipType1, tipType2 }]) => ({ series, tipType1, tipType2 }));
}

export function ColorDetailModal({ color, ownership, onSetStatus, onClose, settings }) {
  const [foundOpen, setFoundOpen] = useState({});
  if (!color) return null;

  const legacyList = getLegacyList(color);
  const seriesInColor = getSeriesForColor(color.code, ALL_SETS);
  const allSeries = getDistinctSeries();
  const relevantSeries = allSeries.filter(s => seriesInColor.find(sc => sc.series === s.series));
  const retailSets = ALL_SETS.filter(s =>
    s.colors.includes(color.code) &&
    !(settings?.hideUnavailable && isUnavailableSet(s))
  );

  const bg = `#${color.hex}`;
  const r = parseInt(color.hex.substring(0, 2), 16);
  const g = parseInt(color.hex.substring(2, 4), 16);
  const b = parseInt(color.hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textCol = lum > 0.55 ? C.textSub : C.white;
  const textColSub = lum > 0.55 ? 'rgba(40,60,60,0.7)' : 'rgba(255,255,255,0.8)';

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.white, borderRadius: RADIUS.xl, width: '100%', maxWidth: 480,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: SHADOW.lg, fontFamily: FONT,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: bg, padding: '20px 20px 16px', position: 'relative', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%',
              width: 28, height: 28, cursor: 'pointer', fontSize: 16,
              color: textCol, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textCol }}>
            {color.name}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: textColSub }}>
            Color Code: <strong>{color.code}</strong>
          </p>
          {!settings?.hideLegacy && legacyList.length > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: textColSub }}>
              {legacyList.map((l, i) => (
                <span key={l.set}>
                  {i > 0 && <br />}
                  {l.label}: <strong>{l.code}</strong>&nbsp;&nbsp;{l.name}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '12px 0 8px' }}>
            {relevantSeries.map(({ series, tipType1, tipType2 }) => {
              const status = ownership[color.code]?.[series] ?? null;
              const isOwned = status === 'owned';
              const isWish = status === 'wishlist';
              const seriesSets = retailSets.filter(s => s.series === series).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
              return (
                <div key={series} style={{ borderBottom: '1px solid #fbe8d3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: C.tealDeep }}>
                      <TipIcon type={getTipIcon(tipType1)} size={22} />
                      <TipIcon type={getTipIcon(tipType2)} size={22} />
                    </div>
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{series}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{tipType1} / {tipType2}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onSetStatus(color.code, series, isOwned ? null : 'owned')}
                        style={isOwned ? statusOwned : statusOwnedOff}
                      >Own</button>
                      <button
                        onClick={() => onSetStatus(color.code, series, isWish ? null : 'wishlist')}
                        style={isWish ? statusWish : statusWishOff}
                      >Wish</button>
                    </div>
                  </div>
                  {seriesSets.length > 0 && (
                    <div style={{ padding: '0 20px 4px' }}>
                      <button
                        onClick={() => setFoundOpen(o => ({ ...o, [series]: !o[series] }))}
                        style={{
                          width: '100%', background: 'none', border: 'none', padding: '4px 0 8px',
                          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: C.textMuted, textTransform: 'uppercase' }}>
                          <span style={{ fontSize: 13 }}>{foundOpen[series] ? '▾' : '▸'}</span> Found In
                        </span>
                        <span style={{ fontSize: 10, color: '#c9a880' }}>({seriesSets.length})</span>
                      </button>
                      {foundOpen[series] && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, paddingBottom: 12 }}>
                          {seriesSets.map(s => {
                            const parts = [s.edition, s.version].filter(Boolean).join(' · ');
                            return (
                              <div key={s.id} style={{
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                padding: '8px 10px', borderRadius: RADIUS.sm, background: C.bgCard,
                              }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{s.name}</span>
                                {parts && (
                                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, marginTop: 2 }}>{parts}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {relevantSeries.length === 0 && (
              <p style={{ padding: '12px 20px', color: C.textMuted, fontSize: 13 }}>
                Not included in any known sets yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  , document.body);
}

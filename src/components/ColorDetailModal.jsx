import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getLegacyList, getSeriesForColor } from '../utils/colorUtils';
import { allSets } from '../data/all-sets';
import { TipIcon, getTipIcon, getTipLabel } from '../assets/TipIcons';
import { isUnavailableSet } from '../hooks/useSettings';
import { getSeriesCardColors } from '../data/all-sets';
import { C, FONT, RADIUS, SHADOW } from '../styles/theme';

const ALL_SETS = allSets;

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
  const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  const useLight = lum < 0.6 || (sat > 0.35 && lum < 0.75);
  const textCol = useLight ? C.white : '#1a1a1a';
  const textColSub = useLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.62)';

  const bodyBg = `rgb(${Math.round(r * 0.16 + 255 * 0.84)}, ${Math.round(g * 0.16 + 255 * 0.84)}, ${Math.round(b * 0.16 + 255 * 0.84)})`;

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
          {legacyList.length > 0 && (
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
        <style>{`
          .kk-modal-scroll-${color.code}::-webkit-scrollbar { width: 8px; }
          .kk-modal-scroll-${color.code}::-webkit-scrollbar-track { background: transparent; }
          .kk-modal-scroll-${color.code}::-webkit-scrollbar-thumb { background: ${bg}; border-radius: 4px; }
          .kk-modal-scroll-${color.code}::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
        `}</style>
        <div className={`kk-modal-scroll-${color.code}`} style={{ overflowY: 'auto', flex: 1, background: bodyBg }}>
          <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {relevantSeries.map(({ series, tipType1, tipType2 }) => {
              const status = ownership[color.code]?.[series] ?? null;
              const isOwned = status === 'owned';
              const isWish = status === 'wishlist';
              const cc = getSeriesCardColors(series);
              const btnBase = {
                padding: '6px 14px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
              };
              const ownBtn = { ...btnBase, background: isOwned ? cc.accent : cc.track, color: isOwned ? C.white : cc.accent };
              const wishBtn = { ...btnBase, background: isWish ? C.wish : cc.track, color: isWish ? C.white : cc.accent };
              const seriesSets = retailSets.filter(s => s.series === series).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
              return (
                <div key={series} style={{ background: cc.cardBg, borderRadius: RADIUS.lg, border: `1.5px solid ${cc.accentSoft}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TipIcon type={getTipIcon(tipType1)} size={22} color={cc.accent} />
                      {tipType2 && <TipIcon type={getTipIcon(tipType2)} size={22} color={cc.accent} />}
                    </div>
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: cc.accent }}>{series}</div>
                      <div style={{ fontSize: 11, color: cc.accentSoft }}>{tipType2 ? `${getTipLabel(tipType1)} / ${getTipLabel(tipType2)}` : getTipLabel(tipType1)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onSetStatus(color.code, series, isOwned ? null : 'owned')}
                        style={ownBtn}
                      >Own</button>
                      <button
                        onClick={() => onSetStatus(color.code, series, isWish ? null : 'wishlist')}
                        style={wishBtn}
                      >Wish</button>
                    </div>
                  </div>
                  {seriesSets.length > 0 && (
                    <div style={{ padding: '0 16px 12px' }}>
                      <button
                        onClick={() => setFoundOpen(o => ({ ...o, [series]: !o[series] }))}
                        style={{
                          width: '100%', background: 'none', border: 'none', padding: '4px 0 8px',
                          display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: cc.accentSoft, textTransform: 'uppercase' }}>
                          <span style={{ fontSize: 13 }}>{foundOpen[series] ? '▾' : '▸'}</span> Found In
                        </span>
                        <span style={{ fontSize: 10, color: cc.accentSoft }}>({seriesSets.length})</span>
                      </button>
                      {foundOpen[series] && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, paddingBottom: 12 }}>
                          {seriesSets.map(s => {
                            const parts = [s.edition, s.version].filter(Boolean).join(' · ');
                            return (
                              <div key={s.id} style={{
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                padding: '8px 10px', borderRadius: RADIUS.sm, background: cc.track,
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

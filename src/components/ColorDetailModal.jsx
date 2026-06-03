import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getLegacyDisplay, getSeriesForColor } from '../utils/colorUtils';
import { honoluluSets } from '../data/honolulu-sets';
import { TipIcon, getTipIcon } from '../assets/TipIcons';
import { isUnavailableSet } from '../hooks/useSettings';

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

  const legacy = getLegacyDisplay(color);
  const seriesInColor = getSeriesForColor(color.code, ALL_SETS);
  const allSeries = getDistinctSeries();
  const relevantSeries = allSeries.filter(s =>
    seriesInColor.find(sc => sc.series === s.series)
  );
  const retailSets = ALL_SETS.filter(s =>
    s.colors.includes(color.code) &&
    !(settings?.hideUnavailable && isUnavailableSet(s))
  );

  const bg = `#${color.hex}`;
  const r = parseInt(color.hex.substring(0, 2), 16);
  const g = parseInt(color.hex.substring(2, 4), 16);
  const b = parseInt(color.hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textCol = lum > 0.55 ? '#2a3a3a' : '#fff';
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
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — fixed */}
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
          {legacy && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: textColSub }}>
              Legacy Code: <strong>{legacy.code}</strong>&nbsp;&nbsp;Legacy Name: <strong>{legacy.name}</strong>
            </p>
          )}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Series / status + Found In grouped */}
          <div style={{ padding: '12px 0 8px' }}>
            {relevantSeries.map(({ series, tipType1, tipType2 }) => {
              const status = ownership[color.code]?.[series] ?? null;
              const isOwned = status === 'owned';
              const isWish = status === 'wishlist';
              const seriesSets = retailSets.filter(s => s.series === series).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
              return (
                <div key={series} style={{ borderBottom: '1px solid #f0f4f4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#4a7c7c' }}>
                      <TipIcon type={getTipIcon(tipType1)} size={22} />
                      <TipIcon type={getTipIcon(tipType2)} size={22} />
                    </div>
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2a2a' }}>{series}</div>
                      <div style={{ fontSize: 11, color: '#8a9a9a' }}>{tipType1} / {tipType2}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onSetStatus(color.code, series, isOwned ? null : 'owned')}
                        style={{
                          padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                          background: isOwned ? '#1ab5b5' : '#eef2f2',
                          color: isOwned ? '#fff' : '#5a7a7a', transition: 'all 0.15s',
                        }}
                      >Own</button>
                      <button
                        onClick={() => onSetStatus(color.code, series, isWish ? null : 'wishlist')}
                        style={{
                          padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 600,
                          background: isWish ? '#f48fb1' : '#eef2f2',
                          color: isWish ? '#fff' : '#5a7a7a', transition: 'all 0.15s',
                        }}
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
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#8a9a9a', textTransform: 'uppercase' }}>
                          <span style={{ fontSize: 13 }}>{foundOpen[series] ? '▾' : '▸'}</span> Found In
                        </span>
                        <span style={{ fontSize: 10, color: '#aababa' }}>({seriesSets.length})</span>
                      </button>
                      {foundOpen[series] && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, paddingBottom: 12 }}>
                          {seriesSets.map(s => {
                            const parts = [s.edition, s.version].filter(Boolean).join(' · ');
                            return (
                              <div key={s.id} style={{
                                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                padding: '8px 10px', borderRadius: 8, background: '#f8fbfb',
                              }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2a2a', lineHeight: 1.3 }}>{s.name}</span>
                                {parts && (
                                  <span style={{ fontSize: 10, color: '#8a9a9a', fontWeight: 500, marginTop: 2 }}>{parts}</span>
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
              <p style={{ padding: '12px 20px', color: '#8a9a9a', fontSize: 13 }}>
                Not included in any known sets yet.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  , document.body);
}

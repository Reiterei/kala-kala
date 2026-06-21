import { useState, useEffect, useMemo } from 'react';
import { colors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, FONT, RADIUS, SHADOW, scrollPage } from '../styles/theme';

function getOwnedCodes(ownership) {
  return colors.filter(c => Object.values(ownership[c.code] || {}).includes('owned'));
}

function textColorFor(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#3a2410' : '#ffffff';
}

function randomOwnedColor(ownedColors, excludeCode) {
  const pool = excludeCode ? ownedColors.filter(c => c.code !== excludeCode) : ownedColors;
  const useFrom = pool.length ? pool : ownedColors;
  if (!useFrom.length) return null;
  return useFrom[Math.floor(Math.random() * useFrom.length)];
}

function LockIcon({ locked, size = 13 }) {
  return locked ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 7.6-1.8"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}

function Swatch({ color, locked, onToggleLock, onClick, windowWidth }) {
  const bg = `#${color.hex}`;
  const text = textColorFor(color.hex);
  const scale = Math.max(0, Math.min(1, (windowWidth - 360) / (900 - 360)));
  const codeSize = 15 + (28 - 15) * scale;
  const nameSize = 9 + (13 - 9) * scale;
  const pad = 8 + (14 - 8) * scale;
  const lockBtn = 24 + (30 - 24) * scale;
  const lockIcon = 13 + (16 - 13) * scale;
  const lockOffset = 6 + (10 - 6) * scale;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', flex: 1, minWidth: 0,
        background: bg, borderRadius: RADIUS.lg,
        aspectRatio: '1 / 1.15', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: SHADOW.sm, padding: pad, paddingBottom: pad + lockBtn + 4, boxSizing: 'border-box',
        transition: 'background 0.2s',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
        style={{
          position: 'absolute', bottom: lockOffset, left: '50%', transform: 'translateX(-50%)',
          width: lockBtn, height: lockBtn, borderRadius: '50%',
          border: 'none', cursor: 'pointer',
          background: locked ? text : 'rgba(255,255,255,0.35)',
          color: locked ? bg : text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label={locked ? 'Unlock color' : 'Lock color'}
      >
        <LockIcon size={lockIcon} locked={locked} />
      </button>
      <span style={{ color: text, fontWeight: 800, fontSize: codeSize, lineHeight: 1.3, textAlign: 'center' }}>
        {color.code}
      </span>
      <span style={{ color: text, fontWeight: 600, fontSize: nameSize, lineHeight: 1.3, textAlign: 'center', opacity: 0.9 }}>
        {color.name}
      </span>
    </div>
  );
}

function SavedSwatch({ color, onClick, windowWidth }) {
  const text = textColorFor(color.hex);
  const scale = Math.max(0, Math.min(1, (windowWidth - 360) / (900 - 360)));
  const codeSize = 10.5 + (15 - 10.5) * scale;
  const nameSize = 11;
  const height = 40 + (64 - 40) * scale;
  const showName = scale > 0.4;
  return (
    <div
      onClick={onClick}
      title={`${color.code} ${color.name}`}
      style={{
        flex: 1, height, minWidth: 0, borderRadius: RADIUS.sm,
        background: `#${color.hex}`, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '2px 4px', boxSizing: 'border-box',
      }}
    >
      <span style={{ color: text, fontWeight: 800, fontSize: codeSize, letterSpacing: 0.2, lineHeight: 1.3 }}>
        {color.code}
      </span>
      {showName && (
        <span style={{ color: text, fontWeight: 600, fontSize: nameSize, opacity: 0.9, lineHeight: 1.3, textAlign: 'center' }}>
          {color.name}
        </span>
      )}
    </div>
  );
}

const actionBtn = {
  flex: 1, padding: '10px 0', borderRadius: RADIUS.pill,
  fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
  cursor: 'pointer', fontFamily: FONT, border: 'none',
};

export function PalettesPage({ ownership, onSetStatus, settings, user, palettes, onSavePalette, onDeletePalette }) {
  const windowWidth = useWindowWidth();
  const ownedColors = useMemo(() => getOwnedCodes(ownership), [ownership]);

  const [active, setActive] = useState(() => {
    const initial = [];
    for (let i = 0; i < 5; i++) initial.push(randomOwnedColor(ownedColors));
    return initial;
  });
  const [locked, setLocked] = useState([false, false, false, false, false]);

  // If owned colors change (e.g. first load resolves), fill any empty slots.
  useEffect(() => {
    if (!ownedColors.length) return;
    setActive(prev => prev.map(c => c || randomOwnedColor(ownedColors)));
  }, [ownedColors.length]);

  const toggleLock = (i) => setLocked(prev => prev.map((v, idx) => idx === i ? !v : v));

  const randomize = () => {
    if (!ownedColors.length) return;
    setActive(prev => prev.map((c, i) => locked[i] ? c : randomOwnedColor(ownedColors, c?.code)));
  };

  const save = () => {
    if (active.some(c => !c)) return;
    if (palettes.length >= 25) return;
    onSavePalette(active.map(c => c.code));
  };

  const atMax = palettes.length >= 25;

  const noOwned = ownedColors.length === 0;

  const [modal, setModal] = useState(null); // { color, list }
  const openModal = (color, list) => setModal({ color, list });
  const navigateModal = (color) => setModal(m => ({ ...m, color }));

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  return (
    <div style={scrollPage}>
      <div style={{ padding: '16px 16px 100px', maxWidth: 760, margin: '0 auto' }}>

        {noOwned ? (
          <div style={{
            background: C.bgCard, border: `1.5px dashed ${C.tealMid}`, borderRadius: RADIUS.lg,
            padding: '24px 16px', textAlign: 'center', color: C.textMuted, fontSize: 13, fontWeight: 600,
          }}>
            Mark some colors as &lsquo;Owned&rsquo; to build a palette.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {active.map((color, i) => color && (
              <Swatch
                key={i}
                color={color}
                locked={locked[i]}
                onToggleLock={() => toggleLock(i)}
                onClick={() => openModal(color, active.filter(Boolean))}
                windowWidth={windowWidth}
              />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={randomize}
            disabled={noOwned}
            style={{ ...actionBtn, background: C.teal, color: C.white, opacity: noOwned ? 0.5 : 1 }}
          >Randomize Colors</button>
          <button
            onClick={save}
            disabled={noOwned || atMax}
            style={{ ...actionBtn, background: C.white, color: C.tealText, border: `1.5px solid ${C.teal}`, opacity: (noOwned || atMax) ? 0.5 : 1 }}
          >{atMax ? 'Limit Reached' : 'Save Palette'}</button>
        </div>

        <div style={{ margin: '26px 0 18px' }} />

        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 10, marginLeft: 10 }}>
          Saved Palettes <span style={{ color: C.textMuted, fontWeight: 600, fontSize: 12 }}>({palettes.length}/25)</span>
        </div>

        {palettes.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
            No saved palettes yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {palettes.map(p => {
              const paletteColors = p.codes.map(code => colors.find(x => x.code === code)).filter(Boolean);
              const confirming = confirmDeleteId === p.id;
              return (
                <div key={p.id} style={{
                  background: C.white, borderRadius: RADIUS.lg, border: `1.5px solid ${confirming ? C.error : C.border}`,
                  padding: '10px 10px 10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {confirming ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.error }}>Delete this palette?</span>
                      <button
                        onClick={() => { onDeletePalette(p.id); setConfirmDeleteId(null); }}
                        style={{ padding: '6px 14px', borderRadius: RADIUS.sm, border: 'none', background: C.error, color: C.white, fontSize: 11, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT }}
                      >Delete</button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ padding: '6px 14px', borderRadius: RADIUS.sm, border: `1.5px solid ${C.tealMid}`, background: C.white, color: C.tealText, fontSize: 11, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: FONT }}
                      >Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 6, flex: 1, minWidth: 0 }}>
                        {paletteColors.map((c, i) => (
                          <SavedSwatch key={i} color={c} onClick={() => openModal(c, paletteColors)} windowWidth={windowWidth} />
                        ))}
                      </div>
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          border: 'none', background: '#fdeee8', color: C.error,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                        aria-label="Delete palette"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <ColorDetailModal
          color={modal.color}
          ownership={ownership}
          onSetStatus={onSetStatus}
          onClose={() => setModal(null)}
          settings={settings}
          colorList={modal.list}
          onNavigate={navigateModal}
        />
      )}
    </div>
  );
}

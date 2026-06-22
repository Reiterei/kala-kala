import { useState, useEffect, useMemo, useRef } from 'react';
import { colors } from '../data/colors';
import { ColorDetailModal } from '../components/ColorDetailModal';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { C, FONT, RADIUS, SHADOW, scrollPage } from '../styles/theme';

const EXCLUDED_PALETTE_CODES = new Set(['120', '0']);

function getOwnedCodes(ownership) {
  return colors.filter(c => !EXCLUDED_PALETTE_CODES.has(c.code) && Object.values(ownership[c.code] || {}).includes('owned'));
}

function textColorFor(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#3a2410' : '#ffffff';
}

// Fills `slots` (array of current colors or null) from ownedColors, keeping
// entries where keep[i] is true, replacing the rest with unique random picks
// (no duplicate codes among the final result, including kept ones).
function fillUniquePalette(slots, ownedColors, keep) {
  const used = new Set(slots.filter((c, i) => keep[i] && c).map(c => c.code));
  const result = slots.map((c, i) => (keep[i] && c) ? c : null);
  const shuffled = [...ownedColors].sort(() => Math.random() - 0.5);
  let pos = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i]) continue;
    while (pos < shuffled.length && used.has(shuffled[pos].code)) pos++;
    if (pos < shuffled.length) {
      result[i] = shuffled[pos];
      used.add(shuffled[pos].code);
      pos++;
    } else {
      result[i] = null;
    }
  }
  return result;
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

const NAME_BREAKS = {
  Pomegranate: 'Pome-granate',
  Bougainvillaea: 'Bougain-villaea',
  Coralessence: 'Coral-essence',
  Horseradish: 'Horse-radish',
  Hearthstone: 'Hearth-stone',
  Ultramarine: 'Ultra-marine',
  Aquamarine: 'Aqua-marine',
  Bluebonnet: 'Blue-bonnet',
  Cantaloupe: 'Cant-aloupe',
  Cappuccino: 'Cappu-ccino',
  Chartreuse: 'Char-treuse',
  Cornflower: 'Corn-flower',
  Cyberspace: 'Cyber-space',
  Grapefruit: 'Grape-fruit',
  Mignonette: 'Mignon-ette',
  Peppermint: 'Pepper-mint',
  Periwinkle: 'Peri-winkle',
  Sandalwood: 'Sandal-wood',
  Terracotta: 'Terra-cotta',
  Tumbleweed: 'Tumble-weed',
  Vermillion: 'Ver-million',
  Amaranth: 'Ama-ranth',
  Bluebell: 'Blue-bell',
  Chestnut: 'Chest-nut',
  Cinnamon: 'Cinna-mon',
  Eggplant: 'Egg-plant',
  Espresso: 'Espr-esso',
  Lavender: 'Lav-ender',
  Mulberry: 'Mul-berry',
  Wisteria: 'Wis-teria',
  Blueberry: 'Blue-berry',
  Bubblegum: 'Bubble-gum',
  Cranberry: 'Cran-berry',
  Goldenrod: 'Golden-rod',
  Guacamole: 'Guac-amole',
  Limestone: 'Lime-stone',
  Milkshake: 'Milk-shake',
  Persimmon: 'Per-simmon',
  Pineapple: 'Pine-apple',
  Porcelain: 'Por-celain',
  Raspberry: 'Rasp-berry',
  Rosewater: 'Rose-water',
  Sandstone: 'Sand-stone',
  Spearmint: 'Spear-mint',
  Sugarcane: 'Sugar-cane',
  Sunflower: 'Sun-flower',
  Turquoise: 'Tur-quoise',
  'Bright Lavender': 'Bright Lav-ender',
  'Burgundy Bark': 'Bur-gundy Bark',
  'Cashmere Grey': 'Cash-mere Grey',
  'Cerulean Blue': 'Cer-ulean Blue',
  'Charcoal Grey': 'Char-coal Grey',
  'Dark Charcoal': 'Dark Char-coal',
  'Dark Marigold': 'Dark Mari-gold',
  'Deep Cerulean': 'Deep Ceru-lean',
  'Dovetail Grey': 'Dove-tail Grey',
  'Eggshell Brown': 'Egg-shell Brown',
  'Electric Indigo': 'Elec-tric Indigo',
  'Graphite Grey': 'Grap-hite Grey',
  'Greyed Lavender': 'Greyed Lav-ender',
  'Gunmetal Blue': 'Gun-metal Blue',
  'Havelock Blue': 'Have-lock Blue',
  'Hazelnut Cocoa': 'Hazel-nut Cocoa',
  'Hibiscus Pink': 'Hib-iscus Pink',
  'Honeybee Yellow': 'Honey-bee Yellow',
  'Honeydew Melon': 'Honey-dew Melon',
  'Icy Lavender': 'Icy Lav-ender',
  'Lavender Fog': 'Lav-ender Fog',
  'Lavender Grey': 'Lav-ender Grey',
  'Lavender Indigo': 'Lav-ender Indigo',
  'Lavender Mist': 'Lav-ender Mist',
  'Lavender Silk': 'Lav-ender Silk',
  'Lavender Wisp': 'Lav-ender Wisp',
  'Light Cerulean': 'Light Ceru-lean',
  'Light Mahogany': 'Light Maho-gany',
  'Lite Lavender': 'Lite Lav-ender',
  'Marigold Orange': 'Mari-gold Orange',
  'Marigold Yellow': 'Mari-gold Yellow',
  'Military Olive': 'Mili-tary Olive',
  'Old Mahogany': 'Old Maho-gany',
  'Pale Cerulean Blue': 'Pale Ceru-lean Blue',
  'Pale Hyacinth': 'Pale Hya-cinth',
  'Pale Lavender': 'Pale Lav-ender',
  'Pink Lemonade': 'Pink Lemon-ade',
  'Platinum Grey': 'Plat-inum Grey',
  'Prussian Blue': 'Prus-sian Blue',
  'Purplish Pink': 'Purp-lish Pink',
  'Ripe Mulberry': 'Ripe Mul-berry',
  'Shamrock Green': 'Sham-rock Green',
  'Smoky Lavender': 'Smoky Lav-ender',
  'Tahitian Blue': 'Tahi-tian Blue',
  'Tropical Peach': 'Trop-ical Peach',
  'Amsterdam Rose': 'Amster-dam Rose',
  'Artichoke Green': 'Arti-choke Green',
  'Brilliant Blue': 'Brill-iant Blue',
  'Castleton Green': 'Castle-ton Green',
  'Chocolate Mocha': 'Choco-late Mocha',
  'Colorless Blender': 'Color-less Blender',
  'Cornforth White': 'Corn-forth White',
  'Dark Chocolate': 'Dark Choc-olate',
  'Deep Turquoise': 'Deep Tur-quoise',
  'Deep Vermilion': 'Deep Ver-milion',
  'Evergreen Fog': 'Ever-green Fog',
  'Gentleman Grey': 'Gentle-man Grey',
  'Golden Champagne': 'Golden Cham-pagne',
  'Heathered Grape': 'Heather-ed Grape',
  'Hot Pink Carnation': 'Hot Pink Car-nation',
  'Hydrangea Blue': 'Hyd-rangea Blue',
  'Muted Turquoise': 'Muted Tur-quoise',
  'Pavestone Grey': 'Pave-stone Grey',
  'Pink Carnation': 'Pink Car-nation',
  'Porcelain Blue': 'Por-celain Blue',
  'Rich Raspberry': 'Rich Rasp-berry',
  'Valentine Pink': 'Valen-tine Pink',
  'Deep Cornflower': 'Deep Corn-flower',
  'Deep Periwinkle': 'Deep Peri-winkle',
  'Distressed Denim': 'Dist-ressed Denim',
  'Dusty Periwinkle': 'Dusty Peri-winkle',
  'Icy Periwinkle': 'Icy Peri-winkle',
  'Light Cornflower': 'Light Corn-flower',
  'Pale Complexion': 'Pale Comp-lexion',
  'Peppercorn Grey': 'Pepper-corn Grey',
  'Rainforest Green': 'Rain-forest Green',
  'Unbleached Titanium': 'Un-bleach-ed Tita-nium',
  'Collingwood Grey': 'Colling-wood Grey',
  'Deep Ultramarine': 'Deep Ultra-marine',
  'Dragonfruit Pink': 'Dragon-fruit Pink',
  'Fluorescent Orange': 'Fluor-escent Orange',
  'Fluorescent Pink': 'Fluor-escent Pink',
  'Fluorescent Red': 'Fluor-escent Red',
  'Fluorescent Violet': 'Fluor-escent Violet',
  'Fluorescent Yellow': 'Fluor-escent Yellow',
  'French Ultramarine': 'French Ultra-marine',
  'Thundercloud Grey': 'Thunder-cloud Grey',
};
let _measureCanvas = null;
function textWidth(text, font) {
  if (!_measureCanvas) _measureCanvas = document.createElement('canvas');
  const ctx = _measureCanvas.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text).width;
}

// Returns an array of lines for the name: whole name if it fits, one word per
// line if each word fits but the full name doesn't, or the dashed version
// split into lines as a last resort.
function getNameLines(name, fontSize, fontWeight, maxWidth) {
  const font = `${fontWeight} ${fontSize}px ${FONT}`;
  if (textWidth(name, font) <= maxWidth) return [name];

  const words = name.split(' ');
  if (words.length > 1 && words.every(w => textWidth(w, font) <= maxWidth)) {
    return words;
  }

  const broken = NAME_BREAKS[name];
  if (broken) return broken.split(' ');

  return [name];
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
  const nameRef = useRef(null);
  const [shownLines, setShownLines] = useState([color.name]);
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const maxWidth = el.parentElement.clientWidth - pad * 2;
    setShownLines(getNameLines(color.name, nameSize, 600, maxWidth));
  }, [color.name, nameSize, pad, windowWidth]);
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', flex: '0 1 calc((100% - 32px) / 5)', minWidth: 0,
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
      <span ref={nameRef} style={{ color: text, fontWeight: 600, fontSize: nameSize, lineHeight: 1.15, textAlign: 'center', opacity: 0.9, maxWidth: '100%' }}>
        {shownLines.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
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
  const nameRef = useRef(null);
  const [shownLines, setShownLines] = useState([color.name]);
  useEffect(() => {
    const el = nameRef.current;
    if (!el || !showName) return;
    const maxWidth = el.parentElement.clientWidth - 8;
    setShownLines(getNameLines(color.name, nameSize, 600, maxWidth));
  }, [color.name, nameSize, showName, windowWidth]);
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
        <span ref={nameRef} style={{ color: text, fontWeight: 600, fontSize: nameSize, opacity: 0.9, lineHeight: 1.15, textAlign: 'center', maxWidth: '100%' }}>
          {shownLines.map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
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
    const initial = new Array(Math.min(5, ownedColors.length) || 5).fill(null);
    return fillUniquePalette(initial, ownedColors, initial.map(() => false));
  });
  const [locked, setLocked] = useState([false, false, false, false, false]);

  // If owned colors change (e.g. first load resolves, or owned count shrinks/grows), resync slots.
  useEffect(() => {
    if (!ownedColors.length) return;
    const count = Math.min(5, ownedColors.length);
    setActive(prev => {
      const trimmed = prev.slice(0, count);
      while (trimmed.length < count) trimmed.push(null);
      const keep = trimmed.map((c, i) => locked[i] && !!c);
      return fillUniquePalette(trimmed, ownedColors, keep);
    });
  }, [ownedColors.length]);

  const toggleLock = (i) => setLocked(prev => prev.map((v, idx) => idx === i ? !v : v));

  const randomize = () => {
    if (!ownedColors.length) return;
    setActive(prev => fillUniquePalette(prev, ownedColors, locked.slice(0, prev.length)));
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
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
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
          >Randomize</button>
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

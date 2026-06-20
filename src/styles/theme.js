// ─── Brand Colors ──────────────────────────────────────────────
export const C = {
  teal:      '#e8590c',
  tealLight: '#fdebd3',
  tealMid:   '#fbdcb0',
  tealDim:   '#e0a868',
  tealDeep:  '#8a3d10',
  tealText:  '#a8631f',

  text:      '#3a2410',
  textSub:   '#4a3018',
  textMuted: '#b08858',

  bg:        '#fef8ec',
  bgCard:    '#fff9ee',
  bgInput:   '#fdebd3',
  white:     '#fff',

  border:    '#fdebd3',
  borderMid: '#fbdcb0',

  headerBg:  '#ffd863',
  tipBg:     '#fff6d9',

  wish:      '#d6336c',
  wishText:  '#a8265a',
  error:     '#e0392b',

  missing:   '#b08858',
  missingText: '#8a6840',
};

// ─── Typography ────────────────────────────────────────────────
export const FONT = "'Montserrat', 'Segoe UI', sans-serif";

// ─── Border Radius ─────────────────────────────────────────────
export const RADIUS = {
  sm:   8,
  md:   10,
  lg:   12,
  xl:   16,
  xxl:  18,
  pill: 20,
  full: '50%',
};

// ─── Shadows ───────────────────────────────────────────────────
export const SHADOW = {
  sm:     '0 1px 3px rgba(0,0,0,0.12)',
  md:     '0 1px 4px rgba(0,0,0,0.06)',
  lg:     '0 8px 32px rgba(0,0,0,0.18)',
  xl:     '0 8px 40px rgba(0,0,0,0.18)',
  header: '0 1px 4px rgba(0,0,0,0.06)',
};

// ─── Common Style Objects ──────────────────────────────────────

/** Backdrop overlay for modals */
export const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
};

/** White modal card */
export const modalCardStyle = {
  background: C.white, borderRadius: RADIUS.xxl,
  width: '100%', maxWidth: 380,
  boxShadow: SHADOW.xl,
  display: 'flex', flexDirection: 'column', gap: 14,
  padding: 28,
};

/** Pill / chip button — active state */
export const pillActive = {
  padding: '6px 16px', borderRadius: RADIUS.pill,
  border: `1.5px solid ${C.teal}`,
  background: C.teal, color: C.white,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.15s', fontFamily: FONT,
};

/** Pill / chip button — inactive state */
export const pillInactive = {
  padding: '6px 16px', borderRadius: RADIUS.pill,
  border: `1.5px solid ${C.tealMid}`,
  background: C.white, color: C.tealText,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.15s', fontFamily: FONT,
};

/** Nav pill — active */
export const navPillActive = {
  padding: '8px 15px', borderRadius: 22,
  border: 'none', background: C.teal, color: C.white,
  fontSize: 11, fontWeight: 700, lineHeight: 1.4, cursor: 'pointer',
  transition: 'all 0.18s',
  display: 'flex', alignItems: 'center', gap: 5,
  letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: FONT,
};

/** Nav pill — inactive */
export const navPillInactive = {
  padding: '8px 15px', borderRadius: 22,
  border: `1.5px solid ${C.tealLight}`,
  background: C.bg, color: C.tealText,
  fontSize: 11, fontWeight: 700, lineHeight: 1.4, cursor: 'pointer',
  transition: 'all 0.18s',
  display: 'flex', alignItems: 'center', gap: 5,
  letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: FONT,
};

/** Status button — owned active */
export const statusOwned = {
  padding: '6px 14px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  background: C.teal, color: C.white,
};

/** Status button — owned inactive */
export const statusOwnedOff = {
  ...statusOwned,
  background: C.tealLight, color: C.tealText,
};

/** Status button — wish active */
export const statusWish = {
  padding: '6px 14px', borderRadius: RADIUS.pill, border: 'none', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  background: C.wish, color: C.white,
};

/** Status button — wish inactive */
export const statusWishOff = {
  ...statusWish,
  background: C.tealLight, color: C.tealText,
};

/** Segmented toggle (Settings show/hide) — active segment */
export const segmentActive = {
  padding: '6px 14px', border: 'none',
  background: C.teal, color: C.white,
  fontSize: 11, fontWeight: 800, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT,
};

/** Segmented toggle — inactive segment */
export const segmentInactive = {
  ...segmentActive,
  background: C.bg, color: C.tealText,
};

/** Color chip — unowned */
export const chipBase = {
  width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 9, fontWeight: 700, letterSpacing: 0.2,
  flexShrink: 0, transition: 'all 0.15s',
  boxSizing: 'border-box', textAlign: 'center',
  padding: 0, lineHeight: 1,
};

export const chipUnowned = {
  ...chipBase, cursor: 'pointer',
  background: C.white, border: `2px dashed ${C.tealMid}`, color: C.tealDim,
};

export const chipWish = {
  ...chipBase, cursor: 'pointer',
  background: C.white, border: `2px dashed ${C.wish}`, color: C.wishText,
};

/** Icon button (borderless, muted) */
export const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.tealDim,
};

/** Page scroll container */
export const scrollPage = {
  flex: 1, overflowY: 'scroll',
  WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain',
  touchAction: 'pan-y',
};

import { useState, useRef, useCallback, useEffect } from 'react';
import { MyColorsPage } from './pages/MyColorsPage';
import { MyMarkersPage } from './pages/MyMarkersPage';
import { RecommendedPage } from './pages/RecommendedPage';
import { useOwnership } from './hooks/useOwnership';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { useWindowWidth } from './hooks/useWindowWidth';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { C, FONT, SHADOW, navPillActive, navPillInactive, iconBtn } from './styles/theme';

const NAV = [
  {
    id: 'colors', label: 'My Colors',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12S6.75 21.5 12 21.5c.97 0 1.75-.78 1.75-1.75 0-.46-.18-.88-.46-1.19-.28-.3-.45-.71-.45-1.06 0-.97.78-1.75 1.75-1.75h2.06c3.04 0 5.5-2.46 5.5-5.5C22.65 6.89 17.85 2.5 12 2.5z"/>
        <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="12.5" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'markers', label: 'My Markers',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L15 8 L15 18 Q15 21 12 21 Q9 21 9 18 L9 8 Z"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
    ),
  },
  {
    id: 'recommended', label: 'Retail Sets',
    icon: (active) => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

const PAGE_COUNT = NAV.length;
const ANIM_DURATION = 320;
const MIN_SWIPE_PX = 50;

function Logo() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: C.teal, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.white, lineHeight: 1, userSelect: 'none' }}>K</span>
    </div>
  );
}

export let swipeConsumed = false;

export default function App() {
  const [pageIdx, setPageIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, loading, signIn, signUp, signOut, resetPassword } = useAuth();
  const windowWidth = useWindowWidth();
  const { ownership, setStatus, clearAllWishlist, clearAllOwned } = useOwnership(user);
  const { settings, setSetting } = useSettings(user);

  const pageIdxRef = useRef(0);
  pageIdxRef.current = pageIdx;

  const drag = useRef(null);
  const containerRef = useRef(null);

  const goTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(PAGE_COUNT - 1, idx));
    if (clamped === pageIdxRef.current) return;
    setAnimating(true);
    setPageIdx(clamped);
    setTimeout(() => setAnimating(false), ANIM_DURATION);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e) {
      swipeConsumed = false;
      const t = e.touches[0];
      drag.current = { startX: t.clientX, startY: t.clientY, axis: null };
    }

    function onTouchMove(e) {
      if (!drag.current) return;
      const t = e.touches[0];
      const dx = t.clientX - drag.current.startX;
      const dy = t.clientY - drag.current.startY;
      if (!drag.current.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        drag.current.axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      }
      if (drag.current.axis === 'h') e.preventDefault();
    }

    function onTouchEnd(e) {
      if (!drag.current) return;
      const { startX, axis } = drag.current;
      drag.current = null;
      if (axis !== 'h') return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < MIN_SWIPE_PX) return;
      swipeConsumed = true;
      goTo(pageIdxRef.current + (dx < 0 ? 1 : -1));
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', () => { drag.current = null; }, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [goTo]);

  function handlePointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    swipeConsumed = false;
    drag.current = { startX: e.clientX, startY: e.clientY, axis: null };
  }

  function handlePointerMove(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (!drag.current.axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      drag.current.axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
  }

  function handlePointerUp(e) {
    if (!drag.current) return;
    const { startX, axis } = drag.current;
    drag.current = null;
    if (axis !== 'h') return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) < MIN_SWIPE_PX) return;
    swipeConsumed = true;
    goTo(pageIdxRef.current + (dx < 0 ? 1 : -1));
  }

  const baseTranslate = -(pageIdx / PAGE_COUNT) * 100;

  const pages = [
    <MyColorsPage key="colors" ownership={ownership} onSetStatus={setStatus} settings={settings} />,
    <MyMarkersPage key="markers" ownership={ownership} onSetStatus={setStatus} settings={settings} />,
    <RecommendedPage key="recommended" ownership={ownership} onSetStatus={setStatus} settings={settings} />,
  ];

  if (loading) return null;

  return (
    <>
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: C.bg, fontFamily: FONT,
      maxWidth: 1000, margin: '0 auto', overflow: 'hidden',
    }}>
      <header style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: windowWidth < 380 ? '10px 8px' : '10px 16px',
        display: 'flex', alignItems: 'center', gap: windowWidth < 380 ? 4 : 10,
        flexShrink: 0, zIndex: 100, boxShadow: SHADOW.header,
      }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Logo />
          {windowWidth >= 380 && (
            <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.3, fontFamily: FONT }}>kala-kala</span>
          )}
        </div>

        {/* Nav — centered, fills remaining space */}
        <nav style={{ display: 'flex', gap: windowWidth < 380 ? 2 : 4, flex: 1, justifyContent: 'center', flexWrap: 'nowrap', minWidth: 0 }}>
          {NAV.map((n, i) => {
            const active = pageIdx === i;
            const compact = windowWidth < 380;
            const style = active ? navPillActive : navPillInactive;
            return (
              <button key={n.id} onClick={() => goTo(i)} style={compact ? { ...style, padding: '8px 9px', fontSize: 9, gap: 3 } : style}>
                {n.icon(active)}
                {n.label}
              </button>
            );
          })}
        </nav>

        {/* Settings gear */}
        <button onClick={() => setSettingsOpen(true)} style={{ ...iconBtn, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { drag.current = null; }}
      >
        <div
          style={{
            display: 'flex',
            width: `${PAGE_COUNT * 100}%`,
            height: '100%',
            transform: `translateX(${baseTranslate}%)`,
            transition: animating
              ? `transform ${ANIM_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
              : 'none',
            willChange: 'transform',
          }}
        >
          {pages.map((page, i) => (
            <div key={i} style={{ width: `${100 / PAGE_COUNT}%`, height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {page}
            </div>
          ))}
        </div>
      </div>
    </div>

    {!user && (
      <AuthModal
        onSignIn={signIn}
        onSignUp={signUp}
        onResetPassword={resetPassword}
        required
      />
    )}

    {settingsOpen && (
      <SettingsModal
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSetSetting={setSetting}
        onClearAllOwned={clearAllOwned}
        onClearAllWishlist={clearAllWishlist}
        user={user}
        onSignOut={signOut}
      />
    )}
    </>
  );
}

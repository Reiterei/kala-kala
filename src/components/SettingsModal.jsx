import { useState } from 'react';
import { C, FONT, RADIUS, SHADOW, overlayStyle, segmentActive, segmentInactive } from '../styles/theme';

export function SettingsModal({ onClose, settings, onSetSetting, onClearAllOwned, onClearAllWishlist, user, onSignOut }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmingWishlist, setConfirmingWishlist] = useState(false);

  function handleClearRequest() { setConfirming(true); }
  function handleConfirm() { onClearAllOwned(); setConfirming(false); onClose(); }
  function handleCancel() { setConfirming(false); }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.white, borderRadius: RADIUS.xl,
          width: '100%', maxWidth: 420,
          boxShadow: SHADOW.lg, fontFamily: FONT,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.2 }}>
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              background: C.bgInput, border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.tealText,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
            background: C.bgInput,
          }}>
            <div style={{ fontSize: 12, color: C.tealDim, fontWeight: 600 }}>
              Signed in as <span style={{ color: C.text, fontWeight: 700 }}>{user.email}</span>
            </div>
            <button
              onClick={() => { onSignOut(); onClose(); }}
              style={{
                background: 'none', border: `1.5px solid ${C.border}`,
                borderRadius: 8, padding: '4px 10px',
                color: C.tealDim, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: FONT, flexShrink: 0,
              }}
            >Sign out</button>
          </div>
        )}

        <div style={{ padding: '16px 20px' }}>
          <SettingRow
            label="Japanese Exclusive Colors"
            value={settings.hideJapanese ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideJapanese', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          <SettingRow
            label="Discontinued Colors"
            value={settings.hideDiscontinued ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideDiscontinued', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          <SettingRow
            label="Colorless Blender"
            value={settings.hideColorlessBlender ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideColorlessBlender', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          <SettingRow
            label="Unavailable Sets"
            value={settings.hideUnavailable ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideUnavailable', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          {!confirming ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Remove all colors from &lsquo;Owned&rsquo;</div>
              </div>
              <button
                onClick={handleClearRequest}
                style={{
                  padding: '6px 14px', borderRadius: RADIUS.pill,
                  border: `1.5px solid ${C.error}`, background: 'transparent',
                  color: C.error, fontSize: 11, fontWeight: 800,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8,
                  fontFamily: FONT, flexShrink: 0,
                }}
              >Clear</button>
            </div>
          ) : (
            <div style={{
              background: '#fdeee8', border: `1.5px solid ${C.error}`,
              borderRadius: RADIUS.md, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.error }}>Are you sure?</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
                This will remove all &lsquo;Owned&rsquo; statuses. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleConfirm} style={{ flex: 1, padding: '7px 0', borderRadius: RADIUS.sm, border: 'none', background: C.error, color: C.white, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>Yes, clear all</button>
                <button onClick={handleCancel} style={{ flex: 1, padding: '7px 0', borderRadius: RADIUS.sm, border: `1.5px solid ${C.tealMid}`, background: C.white, color: C.tealText, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          {!confirmingWishlist ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Remove all colors from &lsquo;Wishlist&rsquo;</div>
              </div>
              <button
                onClick={() => setConfirmingWishlist(true)}
                style={{
                  padding: '6px 14px', borderRadius: RADIUS.pill,
                  border: `1.5px solid ${C.error}`, background: 'transparent',
                  color: C.error, fontSize: 11, fontWeight: 800,
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8,
                  fontFamily: FONT, flexShrink: 0,
                }}
              >Clear</button>
            </div>
          ) : (
            <div style={{
              background: '#fdeee8', border: `1.5px solid ${C.error}`,
              borderRadius: RADIUS.md, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.error }}>Are you sure?</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
                This will remove all &lsquo;Wishlist&rsquo; statuses. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { onClearAllWishlist(); setConfirmingWishlist(false); onClose(); }} style={{ flex: 1, padding: '7px 0', borderRadius: RADIUS.sm, border: 'none', background: C.error, color: C.white, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>Yes, clear all</button>
                <button onClick={() => setConfirmingWishlist(false)} style={{ flex: 1, padding: '7px 0', borderRadius: RADIUS.sm, border: `1.5px solid ${C.tealMid}`, background: C.white, color: C.tealText, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONT }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div style={{
          margin: '0 20px 20px', padding: '12px 14px',
          background: C.bgInput, borderRadius: RADIUS.md,
          fontSize: 11, color: C.tealDim, textAlign: 'center',
          fontWeight: 600, letterSpacing: 0.2, lineHeight: 1.5,
        }}>
          Not affiliated or endorsed by Ohuhu Brands
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
      </div>
      <div style={{ display: 'flex', borderRadius: RADIUS.sm, overflow: 'hidden', border: `1.5px solid ${C.tealMid}`, flexShrink: 0 }}>
        {['show', 'hide'].map(opt => (
          <button key={opt} onClick={() => onChange(opt)} style={value === opt ? segmentActive : segmentInactive}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

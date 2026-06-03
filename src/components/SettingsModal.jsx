import { C, FONT, RADIUS, SHADOW, overlayStyle, segmentActive, segmentInactive } from '../styles/theme';

export function SettingsModal({ onClose, settings, onSetSetting }) {
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

        <div style={{ padding: '16px 20px' }}>
          <SettingRow
            label="Japanese Exclusive Colors"
            description="Hide colors only available in Japan"
            value={settings.hideJapanese ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideJapanese', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          <SettingRow
            label="Discontinued Colors"
            description="Hide colors no longer in production"
            value={settings.hideDiscontinued ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideDiscontinued', v === 'hide')}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, margin: '12px 0' }} />
          <SettingRow
            label="Unavailable Sets"
            description="Hide sets with no retail links"
            value={settings.hideUnavailable ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideUnavailable', v === 'hide')}
          />
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

function SettingRow({ label, description, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: C.tealDim, marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', borderRadius: RADIUS.sm, overflow: 'hidden', border: `1.5px solid ${C.tealMid}`, flexShrink: 0 }}>
        {['show', 'hide'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={value === opt ? segmentActive : segmentInactive}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

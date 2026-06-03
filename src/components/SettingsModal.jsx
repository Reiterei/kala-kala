export function SettingsModal({ onClose, settings, onSetSetting }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontFamily: "'Nunito', 'Segoe UI', sans-serif",
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #eef2f2',
        }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1a2a2a', letterSpacing: -0.2 }}>
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#f4f7f7', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#5a7a7a',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          <SettingRow
            label="Japanese Exclusive Colors"
            description="Hide colors only available in Japan"
            value={settings.hideJapanese ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideJapanese', v === 'hide')}
          />
          <div style={{ borderTop: '1px solid #eef2f2', margin: '12px 0' }} />
          <SettingRow
            label="Discontinued Colors"
            description="Hide colors no longer in production"
            value={settings.hideDiscontinued ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideDiscontinued', v === 'hide')}
          />
          <div style={{ borderTop: '1px solid #eef2f2', margin: '12px 0' }} />
          <SettingRow
            label="Unavailable Sets"
            description="Hide sets with no retail links"
            value={settings.hideUnavailable ? 'hide' : 'show'}
            onChange={v => onSetSetting('hideUnavailable', v === 'hide')}
          />
        </div>

        {/* Disclaimer */}
        <div style={{
          margin: '0 20px 20px',
          padding: '12px 14px',
          background: '#f4f7f7',
          borderRadius: 10,
          fontSize: 11,
          color: '#8aabab',
          textAlign: 'center',
          fontWeight: 600,
          letterSpacing: 0.2,
          lineHeight: 1.5,
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
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2a2a' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: '#8aabab', marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e0e8e8', flexShrink: 0 }}>
        {['show', 'hide'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '6px 14px',
              border: 'none',
              background: value === opt ? '#1ab5b5' : '#f7fafa',
              color: value === opt ? '#fff' : '#5a7a7a',
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: 0.8,
              fontFamily: "'Nunito', 'Segoe UI', sans-serif",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

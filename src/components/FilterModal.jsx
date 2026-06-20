import { C, FONT, RADIUS, SHADOW, overlayStyle } from '../styles/theme';

export function FilterModal({ title, onClose, onReset, children }) {
  return (
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.white, borderRadius: RADIUS.xl,
          width: '100%', maxWidth: 420, maxHeight: '85vh',
          boxShadow: SHADOW.lg, fontFamily: FONT,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: C.headerBg, flexShrink: 0,
        }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.2 }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.text,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {children}
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          {onReset && (
            <button onClick={onReset} style={{ flex: 1, padding: '10px', borderRadius: RADIUS.md, border: `1.5px solid ${C.borderMid}`, background: C.white, color: C.tealText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset</button>
          )}
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: RADIUS.md, border: 'none', background: C.teal, color: C.white, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Done</button>
        </div>
      </div>
    </div>
  );
}

export function FilterSection({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

export function FilterCheckRow({ checked, onChange, children, bold }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer', fontSize: 13, fontWeight: bold ? 700 : 500, color: bold ? C.text : C.textSub }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: C.teal, width: 16, height: 16 }} />
      {children}
    </label>
  );
}

export function FilterPillRow({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '7px 14px', borderRadius: RADIUS.pill,
            border: `1.5px solid ${value === opt ? C.teal : C.tealMid}`,
            background: value === opt ? C.teal : C.white,
            color: value === opt ? C.white : C.tealText,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >{opt}</button>
      ))}
    </div>
  );
}

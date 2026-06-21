import { useState } from 'react';
import { createPortal } from 'react-dom';
import { C, FONT, RADIUS, SHADOW, overlayStyle, segmentActive, segmentInactive } from '../styles/theme';

export function FilterModal({ title, onClose, onReset, children }) {
  return createPortal(
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
    </div>,
    document.body
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

export function FilterToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '7px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
      <div style={{ display: 'flex', borderRadius: RADIUS.sm, overflow: 'hidden', border: `1.5px solid ${C.tealMid}`, flexShrink: 0 }}>
        {['show', 'hide'].map(opt => (
          <button key={opt} onClick={() => onChange(opt)} style={value === opt ? segmentActive : segmentInactive}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

export function SeriesFilterTree({ groups, selected, onChange, getColors }) {
  const [rootOpen, setRootOpen] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());

  const toggleExpanded = (groupLabel) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(groupLabel) ? next.delete(groupLabel) : next.add(groupLabel);
      return next;
    });
  };

  const toggleOne = (series) => {
    const next = new Set(selected);
    next.has(series) ? next.delete(series) : next.add(series);
    onChange(next);
  };

  const toggleGroup = (seriesList) => {
    const allChecked = seriesList.every(s => selected.has(s));
    const next = new Set(selected);
    seriesList.forEach(s => allChecked ? next.delete(s) : next.add(s));
    onChange(next);
  };

  const summary = selected.size === 0 ? 'All Markers' : selected.size === 1 ? [...selected][0] : `${selected.size} Selected`;

  return (
    <div>
      <button
        onClick={() => setRootOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '10px 12px', borderRadius: RADIUS.md,
          border: `1.5px solid ${C.tealMid}`, background: C.white, cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: C.text,
        }}
      >
        {summary}
        <span style={{ fontSize: 10, color: C.textMuted }}>{rootOpen ? '▲' : '▼'}</span>
      </button>

      {rootOpen && (
        <div style={{ marginTop: 8, padding: '4px 4px 0' }}>
          <FilterCheckRow checked={selected.size === 0} onChange={() => onChange(new Set())} bold>
            All Markers
          </FilterCheckRow>
          {Object.entries(groups).map(([groupLabel, seriesList]) => {
            const allChecked = seriesList.every(s => selected.has(s));
            const someChecked = seriesList.some(s => selected.has(s));
            const isOpen = expanded.has(groupLabel);
            const groupColors = getColors ? getColors(seriesList[0]) : null;
            return (
              <div key={groupLabel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={() => toggleGroup(seriesList)}
                    style={{ accentColor: C.teal, width: 16, height: 16 }}
                  />
                  <span
                    onClick={() => seriesList.length > 1 && toggleExpanded(groupLabel)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 13, fontWeight: 600,
                      color: groupColors?.text ?? C.textSub,
                      cursor: seriesList.length > 1 ? 'pointer' : 'default',
                    }}
                  >
                    {groupColors && (
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: groupColors.bg, flexShrink: 0 }} />
                    )}
                    {groupLabel} Series
                    {seriesList.length > 1 && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textMuted }}>{isOpen ? '▲' : '▼'}</span>
                    )}
                  </span>
                </div>
                {seriesList.length > 1 && isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 26 }}>
                    {seriesList.map(s => {
                      const sc = getColors ? getColors(s) : null;
                      return (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: sc?.text ?? C.textSub }}>
                          <input type="checkbox" checked={selected.has(s)} onChange={() => toggleOne(s)} style={{ accentColor: C.teal, width: 16, height: 16 }} />
                          {sc && <span style={{ width: 10, height: 10, borderRadius: 3, background: sc.bg, flexShrink: 0 }} />}
                          {s}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

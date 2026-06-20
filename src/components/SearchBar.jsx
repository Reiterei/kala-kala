import { C, RADIUS } from '../styles/theme';

export function SearchBar({ value, onChange, placeholder, onFilterClick, filterActive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: C.white, borderRadius: RADIUS.lg, padding: '0 14px', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.tealDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 0', fontSize: 14, color: C.textSub, outline: 'none' }}
        />
        {value && <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 16, padding: 0 }}>×</button>}
      </div>
      <button
        onClick={onFilterClick}
        style={{
          flexShrink: 0, width: 44, height: 44, borderRadius: RADIUS.lg,
          border: filterActive ? `1.5px solid ${C.teal}` : `1.5px solid transparent`,
          background: C.white, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={filterActive ? C.teal : C.tealDim} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2" fill={filterActive ? C.teal : C.white}/>
          <line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2" fill={filterActive ? C.teal : C.white}/>
          <line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="18" r="2" fill={filterActive ? C.teal : C.white}/>
        </svg>
        {filterActive && (
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: C.teal }} />
        )}
      </button>
    </div>
  );
}

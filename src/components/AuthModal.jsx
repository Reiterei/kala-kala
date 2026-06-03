import { useState } from 'react';
<<<<<<< HEAD

const T = '#1a2a2a';
const TEAL = '#1ab5b5';
const MUTED = '#8aabab';
const BORDER = '#eef2f2';
const ERR = '#e57373';
=======
import { C, FONT, RADIUS, SHADOW, overlayStyle } from '../styles/theme';
>>>>>>> 4799ebb (Add centralized theme/style system)

function Input({ type, placeholder, value, onChange, disabled }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%', boxSizing: 'border-box',
<<<<<<< HEAD
        padding: '11px 14px', borderRadius: 10,
        border: `1.5px solid ${BORDER}`,
        fontSize: 14, fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        color: T, background: '#f7fafa', outline: 'none',
=======
        padding: '11px 14px', borderRadius: RADIUS.md,
        border: `1.5px solid ${C.border}`,
        fontSize: 14, fontFamily: FONT,
        color: C.text, background: C.bg, outline: 'none',
>>>>>>> 4799ebb (Add centralized theme/style system)
      }}
    />
  );
}

function Btn({ children, onClick, disabled, secondary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
<<<<<<< HEAD
        width: '100%', padding: '12px', borderRadius: 10,
        border: secondary ? `1.5px solid ${BORDER}` : 'none',
        background: secondary ? '#fff' : TEAL,
        color: secondary ? MUTED : '#fff',
        fontSize: 14, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
=======
        width: '100%', padding: '12px', borderRadius: RADIUS.md,
        border: secondary ? `1.5px solid ${C.border}` : 'none',
        background: secondary ? C.white : C.teal,
        color: secondary ? C.tealDim : C.white,
        fontSize: 14, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
        fontFamily: FONT, opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
>>>>>>> 4799ebb (Add centralized theme/style system)
      }}
    >
      {children}
    </button>
  );
}

export function AuthModal({ onSignIn, onSignUp, onResetPassword, onClose }) {
<<<<<<< HEAD
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
=======
  const [mode, setMode] = useState('signin');
>>>>>>> 4799ebb (Add centralized theme/style system)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
<<<<<<< HEAD
    setError('');
    setMessage('');
=======
    setError(''); setMessage('');
>>>>>>> 4799ebb (Add centralized theme/style system)
    if (!email) { setError('Email is required.'); return; }

    if (mode === 'reset') {
      setLoading(true);
      const err = await onResetPassword(email);
      setLoading(false);
      if (err) setError(err.message);
      else setMessage('Check your email for a reset link.');
      return;
    }

    if (!password) { setError('Password is required.'); return; }

    if (mode === 'signup') {
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      setLoading(true);
      const err = await onSignUp(email, password);
      setLoading(false);
      if (err) setError(err.message);
      else setMessage('Account created! Check your email to confirm, then sign in.');
      return;
    }

<<<<<<< HEAD
    // signin
=======
>>>>>>> 4799ebb (Add centralized theme/style system)
    setLoading(true);
    const err = await onSignIn(email, password);
    setLoading(false);
    if (err) setError(err.message);
    else onClose();
  }

  const titles = { signin: 'Sign In', signup: 'Create Account', reset: 'Reset Password' };

  return (
<<<<<<< HEAD
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18,
          padding: 28, width: '100%', maxWidth: 380,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
            {titles[mode]}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* Fields */}
=======
    <div onClick={onClose} style={overlayStyle}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.white, borderRadius: RADIUS.xxl,
          padding: 28, width: '100%', maxWidth: 380,
          boxShadow: SHADOW.xl,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: FONT }}>
            {titles[mode]}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

>>>>>>> 4799ebb (Add centralized theme/style system)
        <Input type="email" placeholder="Email" value={email} onChange={setEmail} disabled={loading} />
        {mode !== 'reset' && (
          <Input type="password" placeholder="Password" value={password} onChange={setPassword} disabled={loading} />
        )}
        {mode === 'signup' && (
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} disabled={loading} />
        )}

<<<<<<< HEAD
        {/* Error / Message */}
        {error && <div style={{ fontSize: 13, color: ERR, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>{error}</div>}
        {message && <div style={{ fontSize: 13, color: TEAL, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>{message}</div>}

        {/* Submit */}
=======
        {error && <div style={{ fontSize: 13, color: C.error, fontFamily: FONT }}>{error}</div>}
        {message && <div style={{ fontSize: 13, color: C.teal, fontFamily: FONT }}>{message}</div>}

>>>>>>> 4799ebb (Add centralized theme/style system)
        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : titles[mode]}
        </Btn>

<<<<<<< HEAD
        {/* Mode switchers */}
=======
>>>>>>> 4799ebb (Add centralized theme/style system)
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'signin' && (
            <>
              <Btn secondary onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>
                Create an account
              </Btn>
              <button
                onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
<<<<<<< HEAD
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 12, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}
=======
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 12, fontFamily: FONT }}
>>>>>>> 4799ebb (Add centralized theme/style system)
              >
                Forgot password?
              </button>
            </>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <Btn secondary onClick={() => { setMode('signin'); setError(''); setMessage(''); }}>
              Back to sign in
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}

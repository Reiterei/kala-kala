import { useState } from 'react';
import { C, FONT, RADIUS, SHADOW, overlayStyle } from '../styles/theme';

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
        padding: '11px 14px', borderRadius: RADIUS.md,
        border: `1.5px solid ${C.border}`,
        fontSize: 14, fontFamily: FONT,
        color: C.text, background: C.bg, outline: 'none',
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
        width: '100%', padding: '12px', borderRadius: RADIUS.md,
        border: secondary ? `1.5px solid ${C.border}` : 'none',
        background: secondary ? C.white : C.teal,
        color: secondary ? C.tealDim : C.white,
        fontSize: 14, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
        fontFamily: FONT, opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
}

export function AuthModal({ onSignIn, onSignUp, onResetPassword, onClose, required }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(''); setMessage('');
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

    setLoading(true);
    const err = await onSignIn(email, password);
    setLoading(false);
    if (err) setError(err.message);
    else if (onClose) onClose();
  }

  const titles = { signin: 'Sign In', signup: 'Create Account', reset: 'Reset Password' };

  return (
    <div
      onClick={required ? undefined : onClose}
      style={overlayStyle}
    >
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
          {!required && onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 20, lineHeight: 1 }}>×</button>
          )}
        </div>

        {required && mode === 'signin' && (
          <div style={{ fontSize: 13, color: C.tealDim, fontFamily: FONT }}>
            Sign in to track your markers.
          </div>
        )}

        <Input type="email" placeholder="Email" value={email} onChange={setEmail} disabled={loading} />
        {mode !== 'reset' && (
          <Input type="password" placeholder="Password" value={password} onChange={setPassword} disabled={loading} />
        )}
        {mode === 'signup' && (
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} disabled={loading} />
        )}

        {error && <div style={{ fontSize: 13, color: C.error, fontFamily: FONT }}>{error}</div>}
        {message && <div style={{ fontSize: 13, color: C.teal, fontFamily: FONT }}>{message}</div>}

        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : titles[mode]}
        </Btn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'signin' && (
            <>
              <Btn secondary onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>
                Create an account
              </Btn>
              <button
                onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.tealDim, fontSize: 12, fontFamily: FONT }}
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

import React, { useEffect, useState } from 'react';
import { Sparkles, User, ArrowRight, Lock, Mail, Briefcase } from 'lucide-react';
import { api } from '../api';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [roles, setRoles] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getRoles().then(data => {
      setRoles(data);
      if (data.length > 0) setRoleId(data[0].id);
    }).catch(() => setError('Could not load roles. Please start the backend and try again.'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = mode === 'register'
        ? await api.register(displayName, email, password, roleId)
        : await api.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Unable to continue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glow)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Adapt<span className="gradient-text">IQ</span></h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {mode === 'register' ? 'Create your learning profile' : 'Sign in to your learning profile'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          {['login', 'register'].map(tab => (
            <button key={tab} type="button" onClick={() => { setMode(tab); setError(''); }} className={`btn ${mode === tab ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '10px' }}>
              {tab === 'login' ? 'Sign In' : 'Create Profile'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {mode === 'register' && (
            <label style={labelStyle}>
              Full Name
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <User size={18} style={iconStyle} />
                <input value={displayName} onChange={event => setDisplayName(event.target.value)} required placeholder="Your name" style={inputStyle} />
              </div>
            </label>
          )}
          <label style={labelStyle}>
            Email
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Mail size={18} style={iconStyle} />
              <input type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </div>
          </label>
          <label style={labelStyle}>
            Password
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={18} style={iconStyle} />
              <input type="password" minLength={6} value={password} onChange={event => setPassword(event.target.value)} required placeholder="At least 6 characters" style={inputStyle} />
            </div>
          </label>
          {mode === 'register' && (
            <label style={labelStyle}>
              Choose your role
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <Briefcase size={18} style={iconStyle} />
                <select value={roleId} onChange={event => setRoleId(event.target.value)} required style={{ ...inputStyle, paddingLeft: '40px' }}>
                  {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>
            </label>
          )}
          {error && <div style={{ color: '#fb7185', fontSize: '0.85rem' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '5px' }}>
            <span>{loading ? 'Please wait...' : mode === 'register' ? 'Create Profile' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 };
const iconStyle = { position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' };
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px', borderRadius: 'var(--radius-sm)',
  background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.9rem', outline: 'none'
};

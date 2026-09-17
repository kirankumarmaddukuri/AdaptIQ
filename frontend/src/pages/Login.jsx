import React, { useEffect, useState } from 'react';
import { Sparkles, User, ArrowRight, Lock, Mail, Briefcase, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../api';

const DEFAULT_ROLES = [
  { id: 'role-frontend-engineer', name: 'Frontend Architect', category: 'Frontend Engineering' },
  { id: 'role-fullstack-cloud', name: 'Full Stack Cloud Developer', category: 'Software Engineering' },
  { id: 'role-ai-engineer', name: 'AI & Prompt Systems Engineer', category: 'Artificial Intelligence' },
  { id: 'role-backend-engineer', name: 'Backend Engineer', category: 'Software Engineering' },
  { id: 'role-java-developer', name: 'Java Developer', category: 'Software Engineering' },
  { id: 'role-devops-engineer', name: 'DevOps Engineer', category: 'Cloud Engineering' },
  { id: 'role-data-engineer', name: 'Data Engineer', category: 'Data Engineering' },
  { id: 'role-qa-engineer', name: 'QA Automation Engineer', category: 'Quality Engineering' },
  { id: 'role-security-engineer', name: 'Security Engineer', category: 'Security Engineering' },
  { id: 'role-product-engineer', name: 'Product Engineer', category: 'Product Engineering' }
];

export default function Login({ initialMode = 'login', onLoginSuccess, onModeChange }) {
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('role-frontend-engineer');

  const [showPassword, setShowPassword] = useState(false);

  // Validation states
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMode === 'register' || initialMode === 'login') {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Fetch live roles from backend with fallback
  useEffect(() => {
    let isMounted = true;
    api.getRoles()
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setRoles(data);
          setRoleId(prev => prev || data[0].id);
        }
      })
      .catch(err => {
        console.warn('Could not fetch dynamic roles from API, using default roles:', err);
      });
    return () => { isMounted = false; };
  }, [mode]);

  // Validation rules
  const validate = (fieldValues = { displayName, email, password, roleId }, currentMode = mode) => {
    const errs = {};

    // Email validation
    if (fieldValues.email !== undefined) {
      const emailTrim = fieldValues.email.trim();
      if (!emailTrim) {
        errs.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    }

    // Password validation
    if (fieldValues.password !== undefined) {
      if (!fieldValues.password) {
        errs.password = 'Password is required.';
      } else if (fieldValues.password.length < 6) {
        errs.password = 'Password must be at least 6 characters long.';
      } else if (currentMode === 'register') {
        const hasLetter = /[a-zA-Z]/.test(fieldValues.password);
        const hasNumber = /[0-9]/.test(fieldValues.password);
        if (!hasLetter || !hasNumber) {
          errs.password = 'Password must contain at least one letter and one number.';
        }
      }
    }

    // Register-only validations
    if (currentMode === 'register') {
      // Full Name
      if (fieldValues.displayName !== undefined) {
        const nameTrim = fieldValues.displayName.trim();
        if (!nameTrim) {
          errs.displayName = 'Full name is required.';
        } else if (nameTrim.length < 2) {
          errs.displayName = 'Name must be at least 2 characters.';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrim)) {
          errs.displayName = 'Name can only contain letters, spaces, and hyphens.';
        }
      }

      // Role selection
      if (fieldValues.roleId !== undefined) {
        if (!fieldValues.roleId) {
          errs.roleId = 'Please select a career track role.';
        }
      }
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldErrors = validate({ [field]: getFieldValue(field) });
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleChange = (field, value) => {
    switch (field) {
      case 'displayName': setDisplayName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'roleId': setRoleId(value); break;
    }

    if (serverError) setServerError('');

    if (touched[field]) {
      const fieldErrors = validate({
        displayName: field === 'displayName' ? value : displayName,
        email: field === 'email' ? value : email,
        password: field === 'password' ? value : password,
        roleId: field === 'roleId' ? value : roleId
      });
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const getFieldValue = (field) => {
    switch (field) {
      case 'displayName': return displayName;
      case 'email': return email;
      case 'password': return password;
      case 'roleId': return roleId;
      default: return '';
    }
  };

  // Password strength evaluation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#cbd5e1' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (score === 2 && /[^a-zA-Z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { score: 1, label: 'Weak', color: '#fb7185' };
      case 2: return { score: 2, label: 'Good', color: '#fbbf24' };
      case 3: return { score: 3, label: 'Strong', color: '#34d399' };
      default: return { score: 0, label: '', color: '#cbd5e1' };
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setServerError('');
    setErrors({});
    setTouched({});
    if (onModeChange) onModeChange(newMode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Mark relevant fields touched
    const allTouched = {
      email: true,
      password: true,
      ...(mode === 'register' ? { displayName: true, roleId: true } : {})
    };
    setTouched(allTouched);

    const validationErrors = validate({ displayName, email, password, roleId }, mode);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).some(k => validationErrors[k])) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const user = mode === 'register'
        ? await api.register(displayName.trim(), email.trim(), password, roleId)
        : await api.login(email.trim(), password);

      onLoginSuccess(user);
    } catch (err) {
      const msg = err.message === 'Failed to fetch'
        ? 'Could not reach the backend server. Please ensure Spring Boot is running on port 8080.'
        : (err.message || 'Unable to authenticate. Please check your credentials.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = mode === 'register' ? getPasswordStrength(password) : null;

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '36px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--shadow-glow)',
        background: 'rgba(24, 18, 33, 0.84)',
        backdropFilter: 'blur(24px)'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.45)'
          }}>
            <Sparkles size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Adapt<span className="gradient-text">IQ</span></h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {mode === 'register' ? 'Create your personalized engineering learning profile' : 'Sign in to your adaptive learning portal'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px' }}
          >
            Create Profile
          </button>
        </div>

        {/* Server Error Alert Banner */}
        {serverError && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name (Sign Up only) */}
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>
                Full Name <span style={{ color: 'var(--accent-primary)' }}>*</span>
              </label>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => handleChange('displayName', e.target.value)}
                  onBlur={() => handleBlur('displayName')}
                  placeholder="e.g. Alex Chen"
                  style={{
                    ...inputStyle,
                    border: touched.displayName && errors.displayName ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                    boxShadow: touched.displayName && errors.displayName ? '0 0 10px rgba(244, 63, 94, 0.25)' : 'none'
                  }}
                />
              </div>
              {touched.displayName && errors.displayName && (
                <div style={errorStyle}>
                  <AlertCircle size={13} />
                  <span>{errors.displayName}</span>
                </div>
              )}
            </div>
          )}

          {/* Email Address */}
          <div>
            <label style={labelStyle}>
              Email Address <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  ...inputStyle,
                  border: touched.email && errors.email ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                  boxShadow: touched.email && errors.email ? '0 0 10px rgba(244, 63, 94, 0.25)' : 'none'
                }}
              />
            </div>
            {touched.email && errors.email && (
              <div style={errorStyle}>
                <AlertCircle size={13} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>
                Password <span style={{ color: 'var(--accent-primary)' }}>*</span>
              </label>
              {mode === 'register' && pwdStrength?.label && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pwdStrength.color }}>
                  Strength: {pwdStrength.label}
                </span>
              )}
            </div>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={18} style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder={mode === 'register' ? 'At least 6 characters (letter & number)' : 'Your password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                style={{
                  ...inputStyle,
                  paddingRight: '40px',
                  border: touched.password && errors.password ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                  boxShadow: touched.password && errors.password ? '0 0 10px rgba(244, 63, 94, 0.25)' : 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter in Register mode */}
            {mode === 'register' && password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                  {[1, 2, 3].map(bar => (
                    <div
                      key={bar}
                      style={{
                        flex: 1,
                        background: bar <= pwdStrength.score ? pwdStrength.color : 'rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {touched.password && errors.password && (
              <div style={errorStyle}>
                <AlertCircle size={13} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Choose Role Track (Sign Up only) */}
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>
                Target Career Track <span style={{ color: 'var(--accent-primary)' }}>*</span>
              </label>
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <Briefcase size={18} style={iconStyle} />
                <select
                  value={roleId}
                  onChange={e => handleChange('roleId', e.target.value)}
                  onBlur={() => handleBlur('roleId')}
                  style={{
                    ...inputStyle,
                    paddingLeft: '40px',
                    background: '#1a1524',
                    color: '#ffffff',
                    border: touched.roleId && errors.roleId ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                    boxShadow: touched.roleId && errors.roleId ? '0 0 10px rgba(244, 63, 94, 0.25)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id} style={{ background: '#1a1524', color: '#ffffff', padding: '8px' }}>
                      {role.name} ({role.category})
                    </option>
                  ))}
                </select>
              </div>
              {touched.roleId && errors.roleId && (
                <div style={errorStyle}>
                  <AlertCircle size={13} />
                  <span>{errors.roleId}</span>
                </div>
              )}
            </div>
          )}

          {/* Demo Credentials Quick-Fill (Sign In Mode) */}
          {mode === 'login' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <span>Demo Account: <strong>demo@adaptiq.io</strong></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@adaptiq.io');
                  setPassword('demo1234');
                  setTouched({ email: true, password: true });
                  setErrors({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '1rem' }}
          >
            <span>{loading ? 'Validating credentials...' : mode === 'register' ? 'Create My Profile' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, display: 'block' };
const iconStyle = { position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', pointerEvents: 'none' };
const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  top: '10px',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px 12px 40px',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid var(--border-subtle)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none'
};
const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#fb7185',
  fontSize: '0.78rem',
  fontWeight: 500,
  marginTop: '5px'
};

import React from 'react';
import { AlertTriangle, Compass, BookOpen, Award, ArrowRight, Home, LogIn, Sparkles, HelpCircle } from 'lucide-react';

export default function NotFound({ invalidPath, currentUser, onNavigate }) {
  // Smart suggestions for common typos or near-matches
  const getSmartSuggestion = (path = '') => {
    const clean = path.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (clean === 'role' || clean === 'track' || clean === 'tracks' || clean === 'career') {
      return { path: '/roles', label: 'Career Tracks (/roles)', tab: 'roles' };
    }
    if (clean === 'dash' || clean === 'home' || clean === 'stats' || clean === 'overview') {
      return { path: '/dashboard', label: 'Dashboard (/dashboard)', tab: 'dashboard' };
    }
    if (clean === 'learn' || clean === 'path' || clean === 'roadmap' || clean === 'curriculum') {
      return { path: '/learning-path', label: 'Learning Path (/learning-path)', tab: 'learning-path' };
    }
    if (clean === 'test' || clean === 'exam' || clean === 'assess' || clean === 'assessment') {
      return { path: '/quiz', label: 'Diagnostic Assessment (/quiz)', tab: 'quiz' };
    }
    if (clean === 'signin' || clean === 'signup' || clean === 'auth' || clean === 'log') {
      return { path: '/login', label: 'Sign In / Register (/login)', tab: 'login' };
    }
    return null;
  };

  const suggestion = getSmartSuggestion(invalidPath);

  const validEndpoints = [
    { path: '/dashboard', label: 'Dashboard', desc: 'KPI matrix, competency scores & next modules', tab: 'dashboard', icon: Award },
    { path: '/roles', label: 'Career Tracks', desc: 'Select your engineering competency track', tab: 'roles', icon: Compass },
    { path: '/learning-path', label: 'Learning Path', desc: 'Adaptive micro-learning modules roadmap', tab: 'learning-path', icon: BookOpen },
    { path: '/login', label: 'Sign In', desc: 'Log in or create a learner profile', tab: 'login', icon: LogIn }
  ];

  return (
    <div style={{
      maxWidth: '780px',
      margin: '60px auto',
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(244, 63, 94, 0.35)',
        boxShadow: '0 0 40px rgba(244, 63, 94, 0.15)',
        textAlign: 'center'
      }}>
        {/* Error Badge & Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 25px rgba(244, 63, 94, 0.25)'
        }}>
          <AlertTriangle size={38} color="#f43f5e" />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            HTTP 404 • Invalid Endpoint
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
          Page Not Found
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          The URL endpoint <code style={{ color: '#fb7185', background: 'rgba(244, 63, 94, 0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>{invalidPath || window.location.pathname}</code> does not exist or is not a valid route on this application.
        </p>

        {/* Smart Suggestion Banner if applicable */}
        {suggestion && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16) 0%, rgba(137, 106, 189, 0.1) 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#c084fc" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                  Smart Suggestion
                </div>
                <div style={{ fontSize: '0.92rem', color: '#fff' }}>
                  Did you mean <strong>{suggestion.label}</strong>?
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate(suggestion.tab)}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <span>Take Me There</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            <Home size={18} />
            <span>{currentUser ? 'Return to Dashboard' : 'Go to Sign In'}</span>
          </button>

          <button
            onClick={() => onNavigate('roles')}
            className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Compass size={18} />
            <span>Browse Career Tracks</span>
          </button>
        </div>

        {/* Valid Endpoints Directory */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px', textAlign: 'center' }}>
            Available Valid Endpoints in AdaptIQ
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {validEndpoints.map((ep) => {
              const IconComp = ep.icon;
              return (
                <div
                  key={ep.path}
                  onClick={() => onNavigate(ep.tab)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={16} color="#c084fc" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{ep.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ep.path}</div>
                    </div>
                  </div>
                  <ArrowRight size={15} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

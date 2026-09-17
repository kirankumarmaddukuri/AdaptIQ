import React, { useState } from 'react';
import { Compass, BookOpen, Award, User, Sparkles, ChevronDown, LogOut, Home, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, modelName, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getLevelBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'EXPERT':
        return <span className="badge badge-expert">Expert</span>;
      case 'INTERMEDIATE':
        return <span className="badge badge-intermediate">Intermediate</span>;
      case 'NOVICE':
        return <span className="badge badge-novice">Novice</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>Unassessed</span>;
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(18, 15, 23, 0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Brand */}
      <div 
        onClick={() => setActiveTab(currentUser ? 'dashboard' : 'landing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 18px rgba(168, 85, 247, 0.45)'
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Adapt<span className="gradient-text">IQ</span>
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.22)', color: '#c084fc', fontWeight: 700 }}>
              {modelName || 'gemini-3.1-flash-lite'}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Competency-Based Adaptive Learning
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Home / Landing link is always available */}
        <button
          onClick={() => setActiveTab('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: activeTab === 'landing' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            color: activeTab === 'landing' ? '#d8b4fe' : 'var(--text-secondary)',
            border: activeTab === 'landing' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        {currentUser ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'dashboard' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: activeTab === 'dashboard' ? '#d8b4fe' : 'var(--text-secondary)',
                border: activeTab === 'dashboard' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Award size={16} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'roles' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: activeTab === 'roles' ? '#d8b4fe' : 'var(--text-secondary)',
                border: activeTab === 'roles' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Compass size={16} />
              <span>Career Tracks</span>
            </button>

            <button
              onClick={() => setActiveTab('learning-path')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === 'learning-path' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: activeTab === 'learning-path' ? '#d8b4fe' : 'var(--text-secondary)',
                border: activeTab === 'learning-path' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <BookOpen size={16} />
              <span>Learning Path</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('roles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: activeTab === 'roles' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === 'roles' ? '#d8b4fe' : 'var(--text-secondary)',
              border: activeTab === 'roles' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Compass size={16} />
            <span>Career Tracks</span>
          </button>
        )}
      </nav>

      {/* Right Side: Profile Dropdown (Logged in) OR Auth Buttons (Guest) */}
      <div>
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--bg-card)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px 6px 8px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-glass-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} color="#c084fc" />
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser.displayName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {currentUser.roleName || 'Target Role'}
                </span>
              </div>
              {getLevelBadge(currentUser.overallLevel)}
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '240px',
                background: 'rgba(22, 18, 29, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {currentUser.displayName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {currentUser.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveTab('dashboard');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Award size={16} />
                  <span>My Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-coral)',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('login')}
              className="btn btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="btn btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} />
              <span>Get Started</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

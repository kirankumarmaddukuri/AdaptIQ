import React, { useState } from 'react';
import { Compass, BookOpen, Award, User, Sparkles, ChevronDown, LogOut } from 'lucide-react';

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
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
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
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Adapt<span className="gradient-text">IQ</span>
            </span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 700 }}>
              {modelName || 'AI model'}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Competency-Based Adaptive Learning
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'dashboard' ? '#a5b4fc' : 'var(--text-secondary)',
            border: activeTab === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Award size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'roles' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'roles' ? '#a5b4fc' : 'var(--text-secondary)',
            border: activeTab === 'roles' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <Compass size={18} />
          <span>Career Tracks</span>
        </button>

        <button
          onClick={() => setActiveTab('learning-path')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: activeTab === 'learning-path' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeTab === 'learning-path' ? '#a5b4fc' : 'var(--text-secondary)',
            border: activeTab === 'learning-path' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <BookOpen size={18} />
          <span>Learning Path</span>
        </button>
      </nav>

      {/* User Switcher / Profile Badge */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px 6px 8px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c7d2fe'
          }}>
            <User size={16} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {currentUser?.displayName || 'Learner'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentUser?.roleName || 'Frontend Architect'}
            </div>
          </div>
          {getLevelBadge(currentUser?.overallLevel)}
          <ChevronDown size={14} color="var(--text-secondary)" />
        </button>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '48px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glow)',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '240px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 60,
          }}>
            <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Account
            </div>
            <button type="button" onClick={() => { onLogout(); setDropdownOpen(false); }} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 12px' }}>
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, ArrowRight, Layers, Code, Brain, Target, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function RoleSelection({ currentUser, modelName, onSelectRole }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState(currentUser?.roleId || 'role-frontend-engineer');

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        const data = await api.getRoles();
        setRoles(data);
        if (!currentUser?.roleId && data.length > 0) {
          setSelectedRoleId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load roles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, [currentUser]);

  const getRoleIcon = (iconName) => {
    switch (iconName) {
      case 'Layers': return <Layers size={28} color="#a855f7" />;
      case 'Brain': return <Brain size={28} color="#c084fc" />;
      default: return <Code size={28} color="#896abd" />;
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const attempted = currentUser?.assessmentHistory?.slice().reverse().find(item => item.roleName === selectedRole?.name);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c4b5fd', marginBottom: '12px' }}>
          Phase 2: Competency Alignment
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Select Your <span className="gradient-text">Career Engineering Track</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
          {modelName || 'The configured AI model'} will generate a dynamic, high-precision baseline assessment tailored specifically to the competencies of your chosen track.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading career competencies from backend...
        </div>
      ) : (
        <>
          <label style={{ display: 'block', maxWidth: '520px', margin: '0 auto 28px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Choose your role
            <select
              value={selectedRoleId}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              style={{ display: 'block', width: '100%', marginTop: '8px', padding: '12px 14px', borderRadius: '10px', background: '#1a1524', color: '#fff', border: '1px solid var(--border-subtle)', fontSize: '1rem', colorScheme: 'dark' }}
            >
              {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {roles.map(role => {
            const isSelected = selectedRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className="glass-panel"
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--gradient-card)' : 'var(--bg-card)',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-smooth)',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'var(--accent-primary)',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex'
                  }}>
                    <CheckCircle2 size={16} color="#fff" />
                  </div>
                )}

                <div>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {getRoleIcon(role.icon)}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {role.category}
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>
                    {role.name}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                    {role.description}
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Core Competencies Evaluated:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {role.competencies?.map((comp, i) => (
                        <span key={i} className="badge badge-comp" style={{ fontSize: '0.7rem' }}>
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isSelected ? '#a5b4fc' : 'var(--text-muted)'
                }}>
                  <span>{isSelected ? 'Selected Track' : 'Click to select'}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Selected Role Action Panel */}
      {selectedRole && (
        <div className="glass-panel" style={{
          padding: '30px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(38, 28, 56, 0.85) 0%, rgba(18, 15, 23, 0.95) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={20} color="#34d399" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                {attempted ? 'Assessment Completed for This Track' : 'Ready to Initiate Stage A: Dynamic Baseline'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>
              {selectedRole.name} Diagnostic Assessment
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {attempted
                ? `${attempted.overallScore}% score, ${attempted.resultLevel} level. Review your attempted questions and answers.`
                : `6 role-specific questions covering ${selectedRole.competencies?.length} competencies.`}
            </p>
          </div>

          <button
            onClick={() => onSelectRole(selectedRole, attempted)}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <span>{attempted ? 'Review Attempt' : 'Start Baseline Diagnostic Quiz'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

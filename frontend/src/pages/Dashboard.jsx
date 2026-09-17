import React, { useState, useEffect } from 'react';
import { Award, Flame, CheckCircle, Clock, ArrowRight, Play, RefreshCw, Sparkles, BookOpen, Layers, Target } from 'lucide-react';
import RadarChart from '../components/RadarChart';
import { api } from '../api';

export default function Dashboard({ currentUser, onNavigate, onTriggerCheckpoint, onOpenModule }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await api.getDashboard(currentUser?.id || 'user-demo-1');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
        <Sparkles size={36} className="animate-spin-slow" color="#a855f7" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Loading Employee Dashboard...</div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'EXPERT': return '#34d399';
      case 'INTERMEDIATE': return '#a855f7';
      default: return '#fbbf24';
    }
  };

  const levelColor = getLevelColor(stats?.overallLevel);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '36px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        background: 'linear-gradient(135deg, rgba(38, 28, 56, 0.85) 0%, rgba(18, 15, 23, 0.95) 100%)',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge" style={{ background: `${levelColor}20`, color: levelColor, border: `1px solid ${levelColor}40` }}>
              {stats?.overallLevel || 'Unassessed'} Level
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {stats?.roleName}</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            Welcome back, <span className="gradient-text">{stats?.displayName}</span>
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '550px' }}>
            {stats?.overallLevel === 'UNASSESSED'
              ? 'Begin by taking your baseline diagnostic assessment to generate your personalized learning roadmap.'
              : 'Continuous adaptive learning journey. Progress through tailored micro-modules and level up via competency checkpoints.'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div>
          {stats?.overallLevel === 'UNASSESSED' ? (
            <button
              onClick={() => onNavigate('roles')}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>Take Baseline Assessment</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('learning-path')}
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <BookOpen size={18} />
              <span>Continue Learning Path</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Curriculum Progress</span>
            <Target size={20} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {stats?.overallProgressPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {stats?.completedModulesCount || 0} of {stats?.totalModulesCount || 0} modules done
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Learning Streak</span>
            <Flame size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats?.learningStreakDays || 0} {stats?.learningStreakDays === 1 ? 'Day' : 'Days'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active daily engagement
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skill Mastery Points</span>
            <Award size={20} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
            {stats?.skillPoints || 0} XP
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Earned via quizzes & exercises
          </div>
        </div>
      </div>

      {stats?.assessmentHistory?.length > 0 && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Assessment History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.assessmentHistory.slice().reverse().map((item, index) => (
              <div key={`${item.quizId}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{item.roleName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assessment track</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ color: '#fff' }}>{item.overallScore}%</strong>
                  <span className={`badge badge-${item.resultLevel?.toLowerCase()}`}>{item.resultLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout: Radar Chart + Competencies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        {/* Radar Spider Chart */}
        <div className="glass-panel" style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Competency Skill Matrix
          </div>
          <RadarChart scores={stats?.competencyRadarScores} size={300} />
          <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Benchmark rings: Novice (33%) • Intermediate (66%) • Expert (100%)
          </div>
        </div>

        {/* Competencies Breakdown with Checkpoints */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Track Competencies
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous Promotion</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(stats?.competencyRadarScores || {}).map(([compName, score]) => {
              const compLevel = stats?.competencyLevels?.[compName] || 'NOVICE';
              return (
                <div key={compName} style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{compName}</span>
                      <span className={`badge badge-${compLevel.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                        {compLevel}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${score}%`,
                        height: '100%',
                        background: getLevelColor(compLevel),
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>

                  <button
                    onClick={() => onTriggerCheckpoint(compName)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >
                    Checkpoint
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Micro-Modules */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Next Up in Your Curriculum
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tailored micro-learning modules waiting for you
            </p>
          </div>

          <button onClick={() => onNavigate('learning-path')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            View Full Roadmap
            <ArrowRight size={16} />
          </button>
        </div>

        {stats?.upcomingModules && stats.upcomingModules.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {stats.upcomingModules.slice(0, 3).map((m) => (
              <div
                key={m.id}
                onClick={() => onOpenModule(m.id)}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span className="badge badge-comp" style={{ fontSize: '0.65rem' }}>{m.competency}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~{m.estimatedMinutes || 15} min</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '6px' }}>{m.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {m.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Play size={14} />
                  <span>Start Module</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            No pending modules. You're up to date! Take a checkpoint to unlock higher-tier modules.
          </div>
        )}
      </div>
    </div>
  );
}

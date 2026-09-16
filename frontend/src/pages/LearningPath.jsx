import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Lock, Play, Clock, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function LearningPath({ currentUser, onOpenModule }) {
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState(null);

  useEffect(() => {
    async function fetchPath() {
      try {
        setLoading(true);
        const data = await api.getLearningPath(currentUser?.id || 'user-demo-1');
        setLearningPath(data);
      } catch (err) {
        console.error('Failed to load learning path:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPath();
  }, [currentUser]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return (
          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'AVAILABLE':
      case 'IN_PROGRESS':
        return (
          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
            <Play size={12} /> Ready to Learn
          </span>
        );
      default:
        return (
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <Lock size={12} /> Locked
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
        <Sparkles size={36} className="animate-spin-slow" color="#818cf8" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Loading Adaptive Curriculum...</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Organizing micro-learning modules based on your baseline competency categorization.
        </p>
      </div>
    );
  }

  const modules = learningPath?.modules || [];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        marginBottom: '36px',
        background: 'var(--gradient-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', marginBottom: '8px' }}>
              Adaptive Roadmap
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              Personalized Learning Path
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {learningPath?.pathSummary || 'Curriculum dynamically weighted towards competencies requiring reinforcement.'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
              {learningPath?.progressPercentage || 0}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {learningPath?.completedModules || 0} of {learningPath?.totalModules || modules.length} completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${learningPath?.progressPercentage || 0}%`,
            height: '100%',
            background: 'var(--gradient-emerald)',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Sequential Modules Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {modules.map((module, idx) => {
          const isCompleted = module.status?.toUpperCase() === 'COMPLETED';
          const isAvailable = module.status?.toUpperCase() === 'AVAILABLE' || module.status?.toUpperCase() === 'IN_PROGRESS';
          const isLocked = !isCompleted && !isAvailable;

          return (
            <div
              key={module.id}
              className="glass-panel"
              style={{
                padding: '24px 28px',
                borderRadius: 'var(--radius-md)',
                border: isAvailable
                  ? '1.5px solid var(--accent-primary)'
                  : isCompleted
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : '1px solid var(--border-subtle)',
                background: isAvailable
                  ? 'rgba(20, 28, 52, 0.85)'
                  : isLocked
                  ? 'rgba(12, 17, 29, 0.5)'
                  : 'var(--bg-card)',
                boxShadow: isAvailable ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                transition: 'var(--transition-smooth)',
                opacity: isLocked ? 0.65 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: 1, minWidth: '280px' }}>
                {/* Step Circle */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isCompleted
                    ? 'var(--gradient-emerald)'
                    : isAvailable
                    ? 'var(--gradient-primary)'
                    : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  flexShrink: 0
                }}>
                  {isCompleted ? <CheckCircle size={22} /> : isLocked ? <Lock size={18} /> : idx + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="badge badge-comp">{module.competency}</span>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                      {module.level}
                    </span>
                    {getStatusBadge(module.status)}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    {module.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                    {module.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> ~{module.estimatedMinutes || 15} mins
                    </span>
                    <span>•</span>
                    <span>{module.learningObjectives?.length || 3} key concepts</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  disabled={isLocked}
                  onClick={() => onOpenModule(module.id)}
                  className={`btn ${isCompleted ? 'btn-secondary' : isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
                >
                  {isCompleted ? (
                    <>
                      <span>Review Content</span>
                      <ArrowRight size={16} />
                    </>
                  ) : isAvailable ? (
                    <>
                      <span>Start Learning</span>
                      <Play size={16} />
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Locked</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

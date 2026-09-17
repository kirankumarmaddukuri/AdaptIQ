import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, Sparkles, BookOpen, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import RadarChart from '../components/RadarChart';
import { api } from '../api';

export default function AssessmentResult({ result, currentUser, modelName, onPathGenerated }) {
  const [generatingPath, setGeneratingPath] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'EXPERT': return '#34d399';
      case 'INTERMEDIATE': return '#a855f7';
      default: return '#fbbf24';
    }
  };

  const handleGeneratePath = async () => {
    try {
      setGeneratingPath(true);
      const path = await api.generateLearningPath(currentUser?.id || result.userId);
      onPathGenerated(path);
    } catch (err) {
      console.error('Failed to generate learning path:', err);
    } finally {
      setGeneratingPath(false);
    }
  };

  const levelColor = getLevelColor(result.overallLevel);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Top Banner */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c4b5fd', marginBottom: '12px' }}>
          Diagnostic Assessment Complete
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px' }}>
          Baseline Skill Categorization: <span style={{ color: levelColor }}>{result.overallLevel}</span>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Assessed for the role of <strong>{result.roleName}</strong>
        </p>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* Overall Score Card */}
        <div className="glass-panel" style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          border: `1px solid ${levelColor}40`,
          background: 'var(--gradient-card)'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: `4px solid ${levelColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: `0 0 25px ${levelColor}40`
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {result.overallScorePercentage}%
            </span>
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: levelColor, marginBottom: '6px' }}>
            {result.overallLevel} Level
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {result.correctAnswers} of {result.totalQuestions} questions correct
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            Thresholds: 0-40% Novice • 41-70% Intermediate • 71-100% Expert
          </div>
        </div>

        {/* Competency Radar Chart */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Competency Mastery Radar
          </div>
          <RadarChart scores={result.scoreByCompetency} size={280} />
        </div>
      </div>

      {/* AI Coach Feedback */}
      <div className="glass-panel" style={{
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        marginBottom: '36px',
        background: 'rgba(26, 21, 35, 0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Brain size={24} color="#a855f7" />
          <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{modelName || 'AI'} Adaptive Evaluation & Growth Feedback</h3>
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {result.aiFeedback}
        </div>
      </div>

      {/* Primary Action CTA: Generate Learning Path */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        background: 'var(--gradient-card)',
        textAlign: 'center',
        marginBottom: '36px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 0 25px rgba(168, 85, 247, 0.5)'
        }}>
          <BookOpen size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          Stage B: Generate Personalized Adaptive Curriculum
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
          {modelName || 'The configured AI model'} will now synthesize a custom micro-learning roadmap, prioritizing modules on competencies where your baseline identified growth opportunities.
        </p>
        <button
          onClick={handleGeneratePath}
          disabled={generatingPath}
          className="btn btn-primary"
          style={{ padding: '14px 32px', fontSize: '1.05rem' }}
        >
          <Sparkles size={20} />
          <span>{generatingPath ? `${modelName || 'AI'} Synthesizing Roadmap...` : 'Generate My Adaptive Learning Path'}</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Expandable Question Reviews */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <button
          onClick={() => setShowReviews(!showReviews)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <span>Review Detailed Question Responses ({result.questionReviews?.length} questions)</span>
          {showReviews ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showReviews && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.questionReviews?.map((q, idx) => (
              (() => {
                const isCorrect = q.isCorrect ?? q.correct ?? (q.selectedIndex === q.correctIndex && q.selectedIndex >= 0);
                return (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {isCorrect ? <CheckCircle2 size={18} color="#34d399" /> : <XCircle size={18} color="#fb7185" />}
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    Q{idx + 1}: {q.text}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '28px', marginBottom: '6px' }}>
                  Your answer: <strong>{q.options?.[q.selectedIndex] || 'None'}</strong> | Correct answer: <strong>{q.options?.[q.correctIndex]}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', paddingLeft: '28px' }}>
                  💡 {q.explanation}
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

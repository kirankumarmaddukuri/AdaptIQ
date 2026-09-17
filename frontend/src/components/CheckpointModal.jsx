import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Award, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function CheckpointModal({ userId, competency, modelName, onClose, onPromoted }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadCheckpoint() {
      try {
        setLoading(true);
        const data = await api.generateCheckpoint(userId, competency);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to load checkpoint:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCheckpoint();
  }, [userId, competency]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await api.submitCheckpoint({
        quizId: quiz.id,
        userId: userId,
        answers: answers
      });

      setResult(res);

      if (res.passed) {
        // Fire celebration confetti!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#896abd', '#c084fc', '#34d399']
        });
        if (onPromoted) onPromoted(res);
      }
    } catch (err) {
      console.error('Failed to submit checkpoint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgba(22, 17, 30, 0.96)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Skill Promotion Checkpoint
            </div>
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>{competency}</h2>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader2 size={36} className="animate-spin-slow" color="#a855f7" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{modelName || 'AI model'} synthesizing checkpoint quiz...</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Validating practical comprehension criteria
            </div>
          </div>
        ) : result ? (
          /* Checkpoint Result View */
          <div>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              background: result.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${result.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              marginBottom: '24px'
            }}>
              {result.passed ? (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--gradient-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Sparkles size={32} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: '#34d399', marginBottom: '6px' }}>
                    Skill Promoted! Level Up!
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    You scored <strong>{result.scorePercentage}%</strong> ({result.correctAnswers}/{result.totalQuestions} correct)
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '14px' }}>
                    <span className="badge badge-novice">{result.oldLevel}</span>
                    <ArrowRight size={18} color="var(--text-muted)" />
                    <span className="badge badge-expert">{result.newLevel}</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={48} color="#f43f5e" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.3rem', color: '#f87171', marginBottom: '6px' }}>
                    Needs More Reinforcement
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    You scored <strong>{result.scorePercentage}%</strong> ({result.correctAnswers}/{result.totalQuestions} correct). Minimum 66% required for promotion.
                  </p>
                </>
              )}
            </div>

            {/* Question Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {result.reviews?.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${r.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                    {r.isCorrect ? <CheckCircle size={16} color="#34d399" /> : <AlertCircle size={16} color="#f87171" />}
                    Q{i+1}: {r.text}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '24px' }}>
                    💡 {r.explanation}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          /* Quiz Taking View */
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Answer these 3 targeted questions correctly to validate your competency and level up to the next tier.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
              {quiz?.questions?.map((q, idx) => (
                <div key={q.id} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}>#{idx + 1}</span>
                    {q.text}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options?.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: isSelected ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            color: isSelected ? '#fff' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'}`,
                            background: isSelected ? 'var(--accent-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn btn-emerald"
                disabled={Object.keys(answers).length < (quiz?.questions?.length || 3) || submitting}
                onClick={handleSubmit}
                style={{ flex: 2 }}
              >
                {submitting ? 'Submitting & Grading...' : 'Submit Checkpoint'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

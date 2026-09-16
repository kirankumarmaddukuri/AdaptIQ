import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Brain, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function QuizView({ currentUser, activeRole, modelName, onAssessmentComplete }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  useEffect(() => {
    async function initQuiz() {
      try {
        setLoading(true);
        const roleId = activeRole?.id || currentUser?.roleId || 'role-frontend-engineer';
        const userId = currentUser?.id || 'user-demo-1';
        const data = await api.generateAssessment(userId, roleId);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to generate diagnostic quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [activeRole, currentUser]);

  // Timer countdown
  useEffect(() => {
    if (loading || !quiz) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, quiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const result = await api.submitAssessment({
        quizId: quiz.id,
        userId: currentUser?.id || 'user-demo-1',
        answers: answers
      });
      onAssessmentComplete(result);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 0 35px rgba(99, 102, 241, 0.4)'
        }}>
          <Brain size={36} color="#fff" className="animate-pulse-glow" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
          {modelName || 'AI model'} Generating Diagnostic Assessment...
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6 }}>
          Synthesizing competency benchmarks for <strong>{activeRole?.name || 'Frontend Architect'}</strong> across applied scenarios and technical fundamentals.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Loader2 size={16} className="animate-spin-slow" />
          Structuring high-precision questions & scoring keys...
        </div>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isSelected = (optIdx) => answers[currentQ?.id] === optIdx;

  const getDifficultyBadge = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'HARD': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>Hard</span>;
      case 'MEDIUM': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' }}>Medium</span>;
      default: return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>Easy</span>;
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Quiz Top bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            Diagnostic Assessment
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {quiz?.roleName}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Progress Pill */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Answered: <strong style={{ color: '#fff' }}>{answeredCount} / {questions.length}</strong>
          </div>

          {/* Countdown Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: timeLeft < 120 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${timeLeft < 120 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
            color: timeLeft < 120 ? '#fb7185' : '#fff',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Question Stepper Indicator */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {questions.map((q, idx) => {
          const isDone = answers[q.id] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: isCurrent
                  ? 'var(--accent-primary)'
                  : isDone
                  ? 'var(--accent-emerald)'
                  : 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none'
              }}
            />
          );
        })}
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="glass-panel" style={{
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glow)',
          marginBottom: '24px'
        }}>
          {/* Tags */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-comp">{currentQ.competency}</span>
              {getDifficultyBadge(currentQ.difficulty)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Question Text */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: '28px' }}>
            {currentQ.text}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {currentQ.options?.map((optionText, optIdx) => {
              const selected = isSelected(optIdx);
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: selected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1.5px solid ${selected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'var(--transition-smooth)',
                    boxShadow: selected ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: selected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                    color: selected ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: selected ? '#fff' : 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>
                    {optionText}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIndex(prev => prev + 1)}
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                className="btn btn-emerald"
                disabled={answeredCount < questions.length || submitting}
                onClick={handleSubmit}
                style={{ padding: '12px 28px' }}
              >
                {submitting ? 'Submitting...' : 'Submit & Analyze'}
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

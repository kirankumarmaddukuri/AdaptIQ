import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, Clock, Sparkles, Check, X, HelpCircle, Loader2, Lock, RotateCcw } from 'lucide-react';
import { api } from '../api';

export default function ModuleViewer({ moduleId, currentUser, modelName, onBack, onModuleCompleted }) {
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [selectedExerciseOpt, setSelectedExerciseOpt] = useState(null);
  const [exerciseChecked, setExerciseChecked] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadModule() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await api.getModule(moduleId);
        setModule(data);

        // If module is already completed and had an exercise
        if (data?.status?.toUpperCase() === 'COMPLETED' && data?.exercise) {
          setSelectedExerciseOpt(data.exercise.correctOptionIndex);
          setExerciseChecked(true);
        } else {
          setSelectedExerciseOpt(null);
          setExerciseChecked(false);
        }
      } catch (err) {
        console.error('Failed to load module:', err);
        setErrorMessage('Failed to load module details.');
      } finally {
        setLoading(false);
      }
    }
    loadModule();
  }, [moduleId]);

  const handleCheckExercise = () => {
    if (selectedExerciseOpt !== null) {
      setExerciseChecked(true);
      setErrorMessage(null);
    }
  };

  const handleRetryExercise = () => {
    setExerciseChecked(false);
    setSelectedExerciseOpt(null);
    setErrorMessage(null);
  };

  const exercise = module?.exercise;
  const isAlreadyCompleted = module?.status?.toUpperCase() === 'COMPLETED';
  const isCorrect = exerciseChecked && selectedExerciseOpt === exercise?.correctOptionIndex;
  const hasExercise = Boolean(exercise);
  const isQuizPassed = isAlreadyCompleted || isCorrect;
  const canComplete = !hasExercise || isQuizPassed;

  const handleMarkComplete = async () => {
    if (!canComplete || isAlreadyCompleted) {
      return;
    }
    try {
      setCompleting(true);
      setErrorMessage(null);
      const res = await api.completeModule(
        moduleId,
        currentUser?.id || 'user-demo-1',
        selectedExerciseOpt !== null ? selectedExerciseOpt : -1,
        180
      );
      if (onModuleCompleted) {
        onModuleCompleted(res, module?.competency);
      }
    } catch (err) {
      console.error('Failed to mark module complete:', err);
      setErrorMessage(err.message || 'Failed to complete module. Please ensure the quiz is completed correctly.');
    } finally {
      setCompleting(false);
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
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.45)'
        }}>
          <Sparkles size={32} color="#fff" className="animate-spin-slow" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          {modelName || 'AI model'} Synthesizing Educational Study Kit...
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
          Crafting personalized micro-learning content tailored to your skill depth with real-world analogies and practice exercises.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Top Bar with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Roadmap</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-comp">{module?.competency}</span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
            Level: {module?.level}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> ~{module?.estimatedMinutes || 15} min
          </span>
        </div>
      </div>

      {/* Module Content Glass Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glow)',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.3 }}>
          {module?.title}
        </h1>

        {/* Learning Objectives Pill List */}
        {module?.learningObjectives && (
          <div style={{
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', marginBottom: '8px' }}>
              🎯 Module Learning Objectives
            </div>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {module.learningObjectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Synthesized Educational Text Content */}
        <div style={{
          color: '#e2e8f0',
          fontSize: '1rem',
          lineHeight: 1.75,
          whiteSpace: 'pre-line'
        }}>
          <ModuleMarkdown content={module?.content} />
        </div>
      </div>

      {/* Mini-Practice Exercise Card */}
      {exercise && (
        <div id="exercise-section" className="glass-panel" style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          border: isCorrect
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid var(--border-subtle)',
          marginBottom: '32px',
          background: isCorrect ? 'rgba(20, 35, 30, 0.9)' : 'rgba(26, 21, 35, 0.9)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCorrect ? '#34d399' : 'var(--accent-cyan)'
              }}>
                {isCorrect ? <CheckCircle size={20} /> : <HelpCircle size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? '#34d399' : 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  Knowledge Check Quiz
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Validate Your Understanding</h3>
              </div>
            </div>

            <span className="badge" style={{
              background: isQuizPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isQuizPassed ? '#34d399' : '#fbbf24',
              border: `1px solid ${isQuizPassed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isQuizPassed ? (
                <>
                  <Check size={12} />
                  <span>Quiz Passed</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>Required to Submit</span>
                </>
              )}
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600, marginBottom: '16px' }}>
            {exercise.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {exercise.options?.map((opt, idx) => {
              const isSelected = selectedExerciseOpt === idx;
              let bg = isSelected ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.03)';
              let border = isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)';

              if (exerciseChecked) {
                if (idx === exercise.correctOptionIndex) {
                  bg = 'rgba(16, 185, 129, 0.2)';
                  border = '#34d399';
                } else if (isSelected) {
                  bg = 'rgba(244, 63, 94, 0.2)';
                  border = '#fb7185';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => (!exerciseChecked && !isAlreadyCompleted) && setSelectedExerciseOpt(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: bg,
                    border: `1px solid ${border}`,
                    cursor: (exerciseChecked || isAlreadyCompleted) ? 'default' : 'pointer',
                    fontSize: '0.9rem',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </div>
              );
            })}
          </div>

          {!exerciseChecked && !isAlreadyCompleted ? (
            <button
              disabled={selectedExerciseOpt === null}
              onClick={handleCheckExercise}
              className="btn btn-primary"
              style={{ width: '100%', opacity: selectedExerciseOpt === null ? 0.6 : 1 }}
            >
              Verify Quiz Answer
            </button>
          ) : (
            <div style={{
              padding: '14px 18px',
              borderRadius: '8px',
              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {isCorrect ? <Check size={20} color="#34d399" /> : <X size={20} color="#fb7185" />}
                <div>
                  <div style={{ fontWeight: 700, color: isCorrect ? '#34d399' : '#fb7185', fontSize: '0.9rem' }}>
                    {isCorrect
                      ? 'Correct! You have passed the quiz checkpoint and unlocked module completion.'
                      : 'Incorrect answer. Please review the explanation below and try again to complete the module:'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {exercise.explanation}
                  </div>
                </div>
              </div>

              {!isCorrect && !isAlreadyCompleted && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={handleRetryExercise}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={14} />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#fb7185',
          fontSize: '0.88rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <X size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Completion Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '22px 26px',
        borderRadius: 'var(--radius-md)',
        background: canComplete ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.06)',
        border: canComplete ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-glow)'
      }}>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAlreadyCompleted ? (
              <>
                <CheckCircle size={18} color="#34d399" />
                <span>Module Completed</span>
              </>
            ) : canComplete ? (
              <>
                <CheckCircle size={18} color="#34d399" />
                <span>Quiz Passed! Ready to Complete Module</span>
              </>
            ) : (
              <>
                <Lock size={18} color="#f59e0b" />
                <span>Quiz Checkpoint Required</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isAlreadyCompleted
              ? 'You have already completed this module and demonstrated competency mastery.'
              : canComplete
              ? 'Click below to submit your progress and unlock the next module on your roadmap.'
              : 'You must answer and pass the knowledge check quiz above before submitting this module.'}
          </div>
          {!canComplete && (
            <button
              onClick={() => document.getElementById('exercise-section')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'none',
                border: 'none',
                color: '#c084fc',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: '4px 0 0',
                display: 'inline-block'
              }}
            >
              Scroll up to Quiz ↑
            </button>
          )}
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={completing || !canComplete || isAlreadyCompleted}
          className={`btn ${isAlreadyCompleted ? 'btn-secondary' : canComplete ? 'btn-emerald' : 'btn-secondary'}`}
          style={{
            padding: '12px 28px',
            opacity: canComplete && !isAlreadyCompleted ? 1 : 0.6,
            cursor: canComplete && !isAlreadyCompleted ? 'pointer' : 'not-allowed'
          }}
          title={!canComplete ? "Complete the quiz above to submit" : ""}
        >
          {isAlreadyCompleted ? (
            <>
              <CheckCircle size={18} />
              <span>Completed</span>
            </>
          ) : completing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Updating Progress...</span>
            </>
          ) : canComplete ? (
            <>
              <CheckCircle size={18} />
              <span>Mark Module as Complete</span>
            </>
          ) : (
            <>
              <Lock size={18} />
              <span>Quiz Required to Submit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ModuleMarkdown({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const blocks = [];
  let codeLines = [];
  let inCode = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCode) blocks.push(<pre key={`code-${index}`} style={{ overflowX: 'auto', padding: '14px', borderRadius: '8px', background: '#080c14', color: '#c4b5fd', margin: '12px 0' }}><code>{codeLines.join('\n')}</code></pre>);
      inCode = !inCode;
      codeLines = [];
    } else if (inCode) {
      codeLines.push(line);
    } else if (line.startsWith('# ')) {
      blocks.push(<h1 key={index} style={{ margin: '0 0 16px', color: '#fff' }}>{line.slice(2)}</h1>);
    } else if (line.startsWith('### ')) {
      blocks.push(<h3 key={index} style={{ margin: '20px 0 8px', color: '#fff' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      blocks.push(<h2 key={index} style={{ margin: '20px 0 8px', color: '#fff' }}>{line.slice(3)}</h2>);
    } else if (line.trim().startsWith('- ')) {
      blocks.push(<div key={index} style={{ paddingLeft: '16px', margin: '4px 0' }}>• {line.trim().slice(2)}</div>);
    } else if (line.trim()) {
      blocks.push(<p key={index} style={{ margin: '8px 0' }}>{line}</p>);
    }
  });

  return blocks;
}

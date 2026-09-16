import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ArrowLeft, Clock, Sparkles, Check, X, HelpCircle, Loader2 } from 'lucide-react';
import { api } from '../api';

export default function ModuleViewer({ moduleId, currentUser, modelName, onBack, onModuleCompleted }) {
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [selectedExerciseOpt, setSelectedExerciseOpt] = useState(null);
  const [exerciseChecked, setExerciseChecked] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function loadModule() {
      try {
        setLoading(true);
        const data = await api.getModule(moduleId);
        setModule(data);
      } catch (err) {
        console.error('Failed to load module:', err);
      } finally {
        setLoading(false);
      }
    }
    loadModule();
  }, [moduleId]);

  const handleCheckExercise = () => {
    setExerciseChecked(true);
  };

  const handleMarkComplete = async () => {
    try {
      setCompleting(true);
      const res = await api.completeModule(
        moduleId,
        currentUser?.id || 'user-demo-1',
        selectedExerciseOpt !== null ? selectedExerciseOpt : 0,
        180
      );
      if (onModuleCompleted) {
        onModuleCompleted(res, module?.competency);
      }
    } catch (err) {
      console.error('Failed to mark module complete:', err);
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
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
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

  const exercise = module?.exercise;
  const isCorrect = exerciseChecked && selectedExerciseOpt === exercise?.correctOptionIndex;

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
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '8px' }}>
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
        <div className="glass-panel" style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Knowledge Check Mini-Exercise
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Validate Your Understanding</h3>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600, marginBottom: '16px' }}>
            {exercise.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {exercise.options?.map((opt, idx) => {
              const isSelected = selectedExerciseOpt === idx;
              let bg = isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)';
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
                  onClick={() => !exerciseChecked && setSelectedExerciseOpt(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: bg,
                    border: `1px solid ${border}`,
                    cursor: exerciseChecked ? 'default' : 'pointer',
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

          {!exerciseChecked ? (
            <button
              disabled={selectedExerciseOpt === null}
              onClick={handleCheckExercise}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Verify Exercise Answer
            </button>
          ) : (
            <div style={{
              padding: '14px 18px',
              borderRadius: '8px',
              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              {isCorrect ? <Check size={20} color="#34d399" /> : <X size={20} color="#fb7185" />}
              <div>
                <div style={{ fontWeight: 700, color: isCorrect ? '#34d399' : '#fb7185', fontSize: '0.9rem' }}>
                  {isCorrect ? 'Correct! Excellent comprehension.' : 'Not quite. Check the feedback below:'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {exercise.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid var(--border-glow)'
      }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
            Finished reading and exercises?
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Marking this module complete updates your mastery percentage and unlocks the next module.
          </div>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={completing}
          className="btn btn-emerald"
          style={{ padding: '12px 28px' }}
        >
          <CheckCircle size={18} />
          <span>{completing ? 'Updating Progress...' : 'Mark Module as Complete'}</span>
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

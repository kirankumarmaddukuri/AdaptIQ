import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Compass, 
  Target, 
  Award, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Code, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  Cpu, 
  GraduationCap 
} from 'lucide-react';

export default function LandingPage({ currentUser, onNavigate, onSelectRole }) {
  const CAREER_TRACKS = [
    {
      id: 'role-fullstack-cloud',
      name: 'Full Stack Cloud Developer',
      category: 'Software Engineering',
      icon: 'Layers',
      description: 'End-to-end cloud architectures, resilient Spring Boot APIs, and responsive React web applications.',
      competencies: ['React & State Architecture', 'Cloud APIs & Microservices', 'JavaScript & TypeScript', 'Web Performance']
    },
    {
      id: 'role-ai-engineer',
      name: 'AI & Prompt Systems Engineer',
      category: 'Artificial Intelligence',
      icon: 'Brain',
      description: 'Generative AI integration, LLM agent workflows, vector embeddings, and autonomous enterprise systems.',
      competencies: ['AI Engineering & LLM Integration', 'Cloud APIs & Microservices', 'JavaScript & TypeScript']
    },
    {
      id: 'role-frontend-engineer',
      name: 'Frontend Architect',
      category: 'Frontend Engineering',
      icon: 'Code',
      description: 'Modern component systems, web performance tuning, accessibility, and high-framerate interactive UIs.',
      competencies: ['React & State Architecture', 'HTML5 & Modern CSS', 'Web Performance & Core Web Vitals', 'JavaScript & TypeScript']
    },
    {
      id: 'role-java-developer',
      name: 'Java Developer',
      category: 'Software Engineering',
      icon: 'Code',
      description: 'Enterprise Java backends, Spring Boot microservices, persistence optimization, and production resilience.',
      competencies: ['Cloud APIs & Microservices', 'JavaScript & TypeScript', 'Web Performance & Core Web Vitals']
    },
    {
      id: 'role-devops-engineer',
      name: 'DevOps & SRE Engineer',
      category: 'Cloud Engineering',
      icon: 'Layers',
      description: 'Continuous delivery pipelines, cloud infrastructure as code, observability, and container orchestration.',
      competencies: ['Cloud APIs & Microservices', 'Web Performance & Core Web Vitals', 'AI Engineering & LLM Integration']
    },
    {
      id: 'role-data-engineer',
      name: 'Data & Analytics Engineer',
      category: 'Data Engineering',
      icon: 'Layers',
      description: 'Scalable data pipelines, analytical architectures, cloud storage models, and ETL automation.',
      competencies: ['Cloud APIs & Microservices', 'AI Engineering & LLM Integration', 'JavaScript & TypeScript']
    }
  ];

  const getRoleIcon = (name) => {
    switch (name) {
      case 'Layers': return <Layers size={22} color="#a855f7" />;
      case 'Brain': return <Brain size={22} color="#c084fc" />;
      default: return <Code size={22} color="#d8b4fe" />;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 80px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '60px 0 50px', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(168, 85, 247, 0.16)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          color: '#d8b4fe',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '24px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 24px rgba(168, 85, 247, 0.2)'
        }}>
          <Sparkles size={16} color="#c084fc" />
          <span>Next-Generation Adaptive Learning Ecosystem</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.12,
          margin: '0 auto 20px',
          maxWidth: '920px',
          color: '#ffffff'
        }}>
          Accelerate Your Engineering Career with <span className="gradient-text">AI-Driven Competency</span> Synthesis
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '740px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Eliminate static, repetitive tutorials. AdaptIQ dynamically diagnoses your exact skill baseline across 
          10 engineering career tracks and synthesizes level-aware, personalized micro-modules in real-time.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {currentUser ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn btn-primary"
              style={{
                fontSize: '1.05rem',
                padding: '14px 32px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '12px'
              }}
            >
              <span>Welcome Back, {currentUser.displayName}! Go to Dashboard</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('register')}
                className="btn btn-primary"
                style={{
                  fontSize: '1.05rem',
                  padding: '14px 32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '12px',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.45)'
                }}
              >
                <span>Start Free Diagnostic Assessment</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onNavigate('roles')}
                className="btn btn-secondary"
                style={{
                  fontSize: '1.05rem',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Compass size={18} />
                <span>Explore 10 Career Tracks</span>
              </button>
            </>
          )}
        </div>

        {/* Metric Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          maxWidth: '850px',
          margin: '60px auto 0'
        }}>
          {[
            { label: 'Engineering Tracks', value: '10 Roles', sub: 'Industry-standard profiles' },
            { label: 'Technical Benchmarks', value: '40+ Skills', sub: 'Fine-grained matrix' },
            { label: 'Generative AI Engine', value: 'gemini-3.1-flash-lite', sub: 'Zero static question banks' },
            { label: 'Persistent Cloud', value: 'MongoDB Atlas', sub: 'Seamless state persistence' },
          ].map((metric, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                background: 'rgba(26, 20, 36, 0.65)',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}
            >
              <div style={{
                fontSize: metric.value.length > 10 ? '1.25rem' : '1.7rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                wordBreak: 'break-word'
              }}>
                {metric.value}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#c084fc', marginTop: '4px' }}>
                {metric.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {metric.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c4b5fd', marginBottom: '10px' }}>
            Adaptive Workflow
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
            How <span className="gradient-text">AdaptIQ</span> Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '8px auto 0' }}>
            A personalized, dynamic learning loop built to elevate you from beginner to production-ready expert.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              step: '01',
              title: 'Adaptive Diagnostic Assessment',
              icon: Target,
              desc: 'Select a career role and take a real-time AI-synthesized diagnostic test. Our evaluation engine pinpoints your strengths and deficiencies across discrete competencies.'
            },
            {
              step: '02',
              title: 'Level-Aware Learning Roadmap',
              icon: Zap,
              desc: 'Skip what you already know. AdaptIQ synthesizes a tailored curriculum of micro-modules calibrated to your level—Novice (fundamentals), Intermediate (tradeoffs), or Expert (internals).'
            },
            {
              step: '03',
              title: 'Interactive Checkpoint Mastery',
              icon: Award,
              desc: 'Complete modules and challenge yourself on targeted checkpoint questions. Score 80%+ to dynamically promote competencies on your live skill radar chart.'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="glass-card"
              style={{
                padding: '36px 28px',
                position: 'relative',
                background: 'rgba(26, 20, 36, 0.72)',
                border: '1px solid rgba(168, 85, 247, 0.22)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(168, 85, 247, 0.18)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc'
                }}>
                  <item.icon size={24} />
                </div>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(168, 85, 247, 0.25)', letterSpacing: '-0.05em' }}>
                  {item.step}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {item.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, flex: 1 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Career Tracks Preview Section */}
      <section id="career-tracks" style={{ padding: '60px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.18)', color: '#c4b5fd', marginBottom: '10px' }}>
              Targeted Career Tracks
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
              Built for Modern <span className="gradient-text">Software Engineering</span>
            </h2>
          </div>

          <button
            onClick={() => onNavigate('roles')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>View All 10 Tracks</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {CAREER_TRACKS.map((track) => (
            <div
              key={track.id}
              className="glass-card"
              style={{
                padding: '28px',
                background: 'rgba(26, 20, 36, 0.65)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getRoleIcon(track.icon)}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a855f7', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {track.category}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {track.name}
                    </h4>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  {track.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {track.competencies.map((comp, i) => (
                    <span 
                      key={i} 
                      style={{
                        fontSize: '0.72rem',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#d8b4fe'
                      }}
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentUser) {
                    onSelectRole(track);
                  } else {
                    onNavigate('register');
                  }
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  gap: '8px'
                }}
              >
                <span>{currentUser ? 'Select This Track' : 'Sign Up to Take Diagnostic'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Differentiators */}
      <section style={{ padding: '60px 0' }}>
        <div className="glass-card" style={{
          padding: '48px 40px',
          background: 'linear-gradient(135deg, rgba(30, 20, 48, 0.85) 0%, rgba(18, 15, 23, 0.95) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              Why Engineers Choose <span className="gradient-text">AdaptIQ</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
              Built specifically to overcome the limitations of traditional MOOCs and static courseware.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: Brain,
                title: 'Zero Static MCQs',
                desc: 'Diagnostic questions are generated dynamically using Google Gemini based on live competency benchmarks.'
              },
              {
                icon: Zap,
                title: 'No Wasted Time',
                desc: 'If you already know JavaScript closures, you skip straight to distributed architectures and microservices.'
              },
              {
                icon: Database,
                title: 'Cloud MongoDB Persistence',
                desc: 'Your assessment history, radar chart scores, and module milestones are securely persisted in MongoDB Atlas.'
              },
              {
                icon: TrendingUp,
                title: 'Visual Competency Radar',
                desc: 'Track your growth multi-dimensionally across technical competencies with live radar visualization.'
              }
            ].map((diff, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                  flexShrink: 0
                }}>
                  <diff.icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    {diff.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                    {diff.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section style={{ textAlign: 'center', padding: '60px 0 20px' }}>
        <div style={{
          padding: '50px 32px',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2) 0%, rgba(18, 15, 23, 0.6) 70%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          maxWidth: '850px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Ready to Discover Your <span className="gradient-text">True Competency Level</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            Take your adaptive diagnostic assessment in under 5 minutes and get a personalized roadmap designed for your exact career goals.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {currentUser ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-primary"
                style={{ fontSize: '1.05rem', padding: '14px 36px', borderRadius: '12px' }}
              >
                Go to Dashboard &rarr;
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="btn btn-primary"
                  style={{
                    fontSize: '1.05rem',
                    padding: '14px 36px',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.45)'
                  }}
                >
                  Create Your Free Profile
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="btn btn-secondary"
                  style={{ fontSize: '1.05rem', padding: '14px 32px', borderRadius: '12px' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

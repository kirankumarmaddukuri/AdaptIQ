import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CheckpointModal from './components/CheckpointModal';
import AeroShards from './components/AeroShards';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import QuizView from './pages/QuizView';
import AssessmentResult from './pages/AssessmentResult';
import LearningPath from './pages/LearningPath';
import ModuleViewer from './pages/ModuleViewer';
import Dashboard from './pages/Dashboard';
import NotFound from './components/NotFound';
import { api } from './api';

// Route matching and resolution helper
const parseRoute = (rawPath, hasUser = false) => {
  const clean = rawPath.replace(/\/+$/, '') || '/';
  
  if (clean === '/' || clean === '') {
    return { tab: hasUser ? 'dashboard' : 'login', mode: 'login', path: clean };
  }
  if (clean === '/login') {
    return { tab: 'login', mode: 'login', path: clean };
  }
  if (clean === '/register' || clean === '/signup') {
    return { tab: 'login', mode: 'register', path: clean };
  }
  if (clean === '/dashboard') {
    return { tab: 'dashboard', path: clean };
  }
  if (clean === '/roles') {
    return { tab: 'roles', path: clean };
  }
  if (clean === '/learning-path') {
    return { tab: 'learning-path', path: clean };
  }
  if (clean === '/quiz') {
    return { tab: 'quiz', path: clean };
  }
  if (clean === '/result') {
    return { tab: 'result', path: clean };
  }
  if (clean === '/module' || clean.startsWith('/module/')) {
    const parts = clean.split('/').filter(Boolean);
    const modId = parts.length > 1 ? parts[1] : null;
    return { tab: 'module', moduleId: modId, path: clean };
  }

  // Any other route (e.g. /role, /users, /admin, /test) is an invalid endpoint
  return { tab: '404', invalidPath: rawPath, path: clean };
};

export default function App() {
  // Restore user from localStorage if present
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adaptiq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const initialRoute = parseRoute(window.location.pathname, !!currentUser);
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [loginInitialMode, setLoginInitialMode] = useState(initialRoute.mode || 'login');
  const [activeModuleId, setActiveModuleId] = useState(initialRoute.moduleId || null);

  const [activeRole, setActiveRole] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);
  const [checkpointCompetency, setCheckpointCompetency] = useState(null);
  const [systemInfo, setSystemInfo] = useState({});

  // Initial load: Fetch system metadata
  useEffect(() => {
    api.getSystemInfo().then(setSystemInfo).catch(err => {
      console.warn('Could not load system information:', err);
    });
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute(window.location.pathname, !!currentUser);
      setCurrentPath(window.location.pathname);
      setActiveTab(route.tab);
      if (route.mode) setLoginInitialMode(route.mode);
      if (route.moduleId) setActiveModuleId(route.moduleId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Central navigation handler that updates tab and pushes URL history
  const handleNavigate = (tab, explicitPath = null, replace = false) => {
    const tabToPath = {
      'login': '/login',
      'register': '/register',
      'dashboard': '/dashboard',
      'roles': '/roles',
      'learning-path': '/learning-path',
      'quiz': '/quiz',
      'result': '/result',
      'module': activeModuleId ? `/module/${activeModuleId}` : '/module',
      '404': window.location.pathname
    };

    let targetPath = explicitPath || tabToPath[tab] || `/${tab}`;
    if (tab === 'register') {
      tab = 'login';
      setLoginInitialMode('register');
    } else if (tab === 'login') {
      setLoginInitialMode('login');
    }

    if (window.location.pathname !== targetPath && tab !== '404') {
      if (replace) {
        window.history.replaceState({ tab }, '', targetPath);
      } else {
        window.history.pushState({ tab }, '', targetPath);
      }
    }

    setCurrentPath(targetPath);
    setActiveTab(tab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setLastQuizResult(null);
    setActiveModuleId(null);
    try {
      localStorage.removeItem('adaptiq_user');
    } catch {}
    handleNavigate('login', '/login');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('adaptiq_user', JSON.stringify(user));
    } catch {}

    if (user.overallLevel === 'UNASSESSED') {
      handleNavigate('roles', '/roles');
    } else {
      handleNavigate('dashboard', '/dashboard');
    }
  };

  const handleSelectRole = (role, attempted) => {
    setActiveRole(role);
    if (currentUser) {
      const updated = {
        ...currentUser,
        roleId: role.id,
        roleName: role.name
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem('adaptiq_user', JSON.stringify(updated));
      } catch {}
    }
    if (attempted) {
      setLastQuizResult({
        userId: currentUser?.id,
        roleName: attempted.roleName,
        overallScorePercentage: attempted.overallScore,
        overallLevel: attempted.resultLevel,
        correctAnswers: attempted.correctAnswers,
        totalQuestions: attempted.totalQuestions,
        questionReviews: attempted.questionReviews || [],
        scoreByCompetency: {},
        aiFeedback: 'This is your saved result for this career track.'
      });
      handleNavigate('result', '/result');
    } else {
      handleNavigate('quiz', '/quiz');
    }
  };

  const handleAssessmentComplete = (result) => {
    setLastQuizResult(result);
    if (currentUser) {
      const updated = {
        ...currentUser,
        overallLevel: result.overallLevel,
        competencyLevels: result.levelByCompetency,
        competencyScores: result.scoreByCompetency,
        assessmentHistory: [
          ...(currentUser.assessmentHistory || []),
          {
            roleName: result.roleName,
            overallScore: result.overallScorePercentage,
            resultLevel: result.overallLevel,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            questionReviews: result.questionReviews || []
          }
        ]
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem('adaptiq_user', JSON.stringify(updated));
      } catch {}
    }
    handleNavigate('result', '/result');
  };

  const handlePathGenerated = () => {
    handleNavigate('learning-path', '/learning-path');
  };

  const handleOpenModule = (moduleId) => {
    setActiveModuleId(moduleId);
    handleNavigate('module', `/module/${moduleId}`);
  };

  const handleModuleCompleted = (res, competency) => {
    if (res.checkpointAvailable && competency) {
      setCheckpointCompetency(competency);
    }
    handleNavigate('learning-path', '/learning-path');
  };

  const handleCheckpointPromoted = (res) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        competencyLevels: {
          ...currentUser.competencyLevels,
          [res.competency]: res.newLevel
        }
      };
      setCurrentUser(updated);
      try {
        localStorage.setItem('adaptiq_user', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#120F17' }}>
      {/* Full-Screen Interactive AeroShards Canvas Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#896ABD"
          accentColor="#A855F7"
          placement="full"
          flow="stream"
          material="pearl"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>

      {/* Main UI Layer */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Navbar: Show when user is logged in OR when in authenticated view */}
        {currentUser && (
          <Navbar
            activeTab={activeTab}
            setActiveTab={handleNavigate}
            currentUser={currentUser}
            modelName={systemInfo.geminiModel}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          {activeTab === 'login' && (
            <Login
              initialMode={loginInitialMode}
              onLoginSuccess={handleLoginSuccess}
              onModeChange={(mode) => {
                setLoginInitialMode(mode);
                const path = mode === 'register' ? '/register' : '/login';
                window.history.replaceState({ tab: 'login' }, '', path);
                setCurrentPath(path);
              }}
            />
          )}

          {activeTab === 'roles' && (
            <RoleSelection
              currentUser={currentUser}
              modelName={systemInfo.geminiModel}
              onSelectRole={handleSelectRole}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              currentUser={currentUser}
              activeRole={activeRole}
              modelName={systemInfo.geminiModel}
              onAssessmentComplete={handleAssessmentComplete}
            />
          )}

          {activeTab === 'result' && (
            <AssessmentResult
              result={lastQuizResult || {
                overallScorePercentage: 75,
                overallLevel: 'INTERMEDIATE',
                roleName: currentUser?.roleName || 'Frontend Architect',
                correctAnswers: 4,
                totalQuestions: 6,
                scoreByCompetency: { 'HTML5 & CSS': 90, 'JavaScript': 65, 'React': 80, 'Performance': 60 },
                aiFeedback: 'Great baseline demonstration! You demonstrated solid mastery of core UI architecture and modern React concepts.'
              }}
              currentUser={currentUser}
              modelName={systemInfo.geminiModel}
              onPathGenerated={handlePathGenerated}
            />
          )}

          {activeTab === 'learning-path' && (
            <LearningPath
              currentUser={currentUser}
              onOpenModule={handleOpenModule}
            />
          )}

          {activeTab === 'module' && (
            <ModuleViewer
              moduleId={activeModuleId || 'mod-1'}
              currentUser={currentUser}
              modelName={systemInfo.geminiModel}
              onBack={() => handleNavigate('learning-path', '/learning-path')}
              onModuleCompleted={handleModuleCompleted}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              onNavigate={(tab) => handleNavigate(tab)}
              onTriggerCheckpoint={(comp) => setCheckpointCompetency(comp)}
              onOpenModule={handleOpenModule}
            />
          )}

          {/* 404 / Invalid Endpoint View */}
          {activeTab === '404' && (
            <NotFound
              invalidPath={currentPath}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Checkpoint Skill Promotion Modal */}
        {checkpointCompetency && (
          <CheckpointModal
            userId={currentUser?.id || 'user-demo-1'}
            competency={checkpointCompetency}
            modelName={systemInfo.geminiModel}
            onClose={() => setCheckpointCompetency(null)}
            onPromoted={handleCheckpointPromoted}
          />
        )}

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '20px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          background: 'rgba(18, 15, 23, 0.88)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>AdaptIQ Competency Platform</span>
            <span>•</span>
            <span>AI model: {systemInfo.geminiModel || 'Configured by backend'}</span>
            <span>•</span>
            <span>Spring Boot 3 + React + Firebase</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

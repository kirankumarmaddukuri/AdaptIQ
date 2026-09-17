import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CheckpointModal from './components/CheckpointModal';
import AeroShards from './components/AeroShards';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import QuizView from './pages/QuizView';
import AssessmentResult from './pages/AssessmentResult';
import LearningPath from './pages/LearningPath';
import ModuleViewer from './pages/ModuleViewer';
import Dashboard from './pages/Dashboard';
import NotFound from './components/NotFound';
import { api } from './api';

// Protected routes that require an authenticated user
const PROTECTED_PREFIXES = ['/dashboard', '/learning-path', '/quiz', '/result', '/module'];

// Route matching and resolution helper
const parseRoute = (rawPath, hasUser = false) => {
  const clean = rawPath.replace(/\/+$/, '') || '/';
  
  if (clean === '/' || clean === '') {
    return { tab: 'landing', path: '/' };
  }
  if (clean === '/login') {
    return { tab: 'login', mode: 'login', path: clean };
  }
  if (clean === '/register' || clean === '/signup') {
    return { tab: 'login', mode: 'register', path: clean };
  }
  if (clean === '/roles') {
    return { tab: 'roles', path: clean };
  }

  // Guard protected routes against unauthenticated access
  const isProtected = PROTECTED_PREFIXES.some(prefix => clean === prefix || clean.startsWith(prefix + '/'));
  if (isProtected && !hasUser) {
    return {
      tab: 'login',
      mode: 'login',
      path: '/login',
      authNotice: 'Please sign in or create an account to start your adaptive diagnostic assessment and access your learning path.'
    };
  }

  if (clean === '/dashboard') {
    return { tab: 'dashboard', path: clean };
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

  // Any other unrecognized route is a 404
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
  const [authNotice, setAuthNotice] = useState(initialRoute.authNotice || '');
  const [preselectedRoleId, setPreselectedRoleId] = useState('');
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
      if (route.authNotice) setAuthNotice(route.authNotice);
      if (route.moduleId) setActiveModuleId(route.moduleId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Central navigation handler that updates tab, pushes URL history, and guards protected tabs
  const handleNavigate = (tab, explicitPath = null, replace = false, notice = '', roleId = '') => {
    const protectedTabs = ['dashboard', 'learning-path', 'quiz', 'result', 'module'];

    // Enforce authentication guard
    if (!currentUser && protectedTabs.includes(tab)) {
      setAuthNotice(notice || 'Please sign in or create an account to start your adaptive diagnostic assessment and access your learning path.');
      if (roleId) setPreselectedRoleId(roleId);
      tab = 'login';
      setLoginInitialMode('register');
      explicitPath = '/register';
    } else {
      if (notice) {
        setAuthNotice(notice);
      } else {
        setAuthNotice('');
      }
      if (roleId) setPreselectedRoleId(roleId);
    }

    const tabToPath = {
      'landing': '/',
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
      targetPath = '/register';
    } else if (tab === 'login') {
      setLoginInitialMode('login');
      targetPath = '/login';
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
    setAuthNotice('');
    try {
      localStorage.removeItem('adaptiq_user');
    } catch {}
    handleNavigate('landing', '/', false);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthNotice('');
    try {
      localStorage.setItem('adaptiq_user', JSON.stringify(user));
    } catch {}

    if (user.overallLevel === 'UNASSESSED') {
      handleNavigate('roles', '/roles');
    } else {
      handleNavigate('dashboard', '/dashboard');
    }
  };

  const handleSelectRole = (role, existingAttempt = null) => {
    if (!currentUser) {
      handleNavigate(
        'register',
        '/register',
        false,
        `Create a free profile to take your adaptive diagnostic assessment for ${role.name}!`,
        role.id
      );
      return;
    }

    setActiveRole(role);
    if (existingAttempt) {
      setLastQuizResult(existingAttempt);
      handleNavigate('result', '/result');
    } else {
      handleNavigate('quiz', '/quiz');
    }
  };

  const handleAssessmentComplete = (result) => {
    setLastQuizResult(result);
    // Refresh user state
    if (currentUser?.id) {
      api.getUser(currentUser.id).then(updated => {
        setCurrentUser(updated);
        try {
          localStorage.setItem('adaptiq_user', JSON.stringify(updated));
        } catch {}
      }).catch(console.warn);
    }
    handleNavigate('result', '/result');
  };

  const handlePathGenerated = () => {
    handleNavigate('learning-path', '/learning-path');
  };

  const handleOpenModule = (moduleId) => {
    if (!currentUser) {
      handleNavigate('register', '/register', false, 'Please sign in or create an account to start your learning modules.');
      return;
    }
    setActiveModuleId(moduleId);
    handleNavigate('module', `/module/${moduleId}`);
  };

  const handleModuleCompleted = () => {
    if (currentUser?.id) {
      api.getUser(currentUser.id).then(updated => {
        setCurrentUser(updated);
        try {
          localStorage.setItem('adaptiq_user', JSON.stringify(updated));
        } catch {}
      }).catch(console.warn);
    }
    handleNavigate('learning-path', '/learning-path');
  };

  const handleCheckpointPromoted = () => {
    if (currentUser?.id) {
      api.getUser(currentUser.id).then(updated => {
        setCurrentUser(updated);
        try {
          localStorage.setItem('adaptiq_user', JSON.stringify(updated));
        } catch {}
      }).catch(console.warn);
    }
    setCheckpointCompetency(null);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Dynamic AeroShards 3D Gem Canvas Background */}
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
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
        {/* Top Navbar: Always rendered in Guest or Authenticated Mode */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          currentUser={currentUser}
          modelName={systemInfo.geminiModel}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          {/* Landing Page */}
          {activeTab === 'landing' && (
            <LandingPage
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onSelectRole={handleSelectRole}
            />
          )}

          {activeTab === 'login' && (
            <Login
              initialMode={loginInitialMode}
              authNotice={authNotice}
              preselectedRoleId={preselectedRoleId}
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
              onRequireAuth={(role) => {
                handleNavigate(
                  'register',
                  '/register',
                  false,
                  `Create a free profile to take your adaptive diagnostic assessment for ${role.name}!`,
                  role.id
                );
              }}
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
            <span>AI model: {systemInfo.geminiModel || 'gemini-3.1-flash-lite'}</span>
            <span>•</span>
            <span>Spring Boot 3 + React + MongoDB Atlas</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

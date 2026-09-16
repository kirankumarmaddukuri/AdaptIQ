import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CheckpointModal from './components/CheckpointModal';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import QuizView from './pages/QuizView';
import AssessmentResult from './pages/AssessmentResult';
import LearningPath from './pages/LearningPath';
import ModuleViewer from './pages/ModuleViewer';
import Dashboard from './pages/Dashboard';
import { api } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('login');
  const [activeRole, setActiveRole] = useState(null);
  const [lastQuizResult, setLastQuizResult] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [checkpointCompetency, setCheckpointCompetency] = useState(null);
  const [systemInfo, setSystemInfo] = useState({});

  // Initial load
  useEffect(() => {
    api.getSystemInfo().then(setSystemInfo).catch(err => {
      console.warn('Could not load system information:', err);
    });
  }, []);

  const handleSwitchUser = async (userId) => {
    try {
      const user = await api.getUserProfile(userId);
      setCurrentUser(user);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setLastQuizResult(null);
    setActiveModuleId(null);
    setActiveTab('login');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.overallLevel === 'UNASSESSED') {
      setActiveTab('roles');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSelectRole = (role, attempted) => {
    setActiveRole(role);
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        roleId: role.id,
        roleName: role.name
      }));
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
      setActiveTab('result');
    } else {
      setActiveTab('quiz');
    }
  };

  const handleAssessmentComplete = (result) => {
    setLastQuizResult(result);
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        overallLevel: result.overallLevel,
        competencyLevels: result.levelByCompetency,
        competencyScores: result.scoreByCompetency,
        assessmentHistory: [
          ...(prev.assessmentHistory || []),
          {
            roleName: result.roleName,
            overallScore: result.overallScorePercentage,
            resultLevel: result.overallLevel,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            questionReviews: result.questionReviews || []
          }
        ]
      }));
    }
    setActiveTab('result');
  };

  const handlePathGenerated = (path) => {
    setActiveTab('learning-path');
  };

  const handleOpenModule = (moduleId) => {
    setActiveModuleId(moduleId);
    setActiveTab('module');
  };

  const handleModuleCompleted = (res, competency) => {
    if (res.checkpointAvailable && competency) {
      setCheckpointCompetency(competency);
    }
    setActiveTab('learning-path');
  };

  const handleCheckpointPromoted = (res) => {
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        competencyLevels: {
          ...prev.competencyLevels,
          [res.competency]: res.newLevel
        }
      }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      {currentUser && <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        modelName={systemInfo.geminiModel}
        onLogout={handleLogout}
      />}

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
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
            onBack={() => setActiveTab('learning-path')}
            onModuleCompleted={handleModuleCompleted}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onNavigate={(tab) => setActiveTab(tab)}
            onTriggerCheckpoint={(comp) => setCheckpointCompetency(comp)}
            onOpenModule={handleOpenModule}
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
        background: 'rgba(8, 12, 20, 0.95)'
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
  );
}

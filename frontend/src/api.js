const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    let res;
    try {
      res = await fetch(url, config);
    } catch (networkErr) {
      // Resilient fallback: try direct localhost:8080 if dev proxy was not ready
      if (url.startsWith('/api')) {
        res = await fetch(`http://localhost:8080${url}`, config);
      } else {
        throw networkErr;
      }
    }

    if (!res.ok) {
      const errorBody = await res.text();
      let message = errorBody || res.statusText;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.message || message;
      } catch {
        // Keep the plain response when the server does not return JSON.
      }
      throw new Error(message);
    }
    return await res.json();
  } catch (err) {
    console.error(`Request to ${url} failed:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Profile
  verifyAuth: (email, displayName, uid) =>
    request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, displayName, uid }),
    }),
  register: (displayName, email, password, roleId) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password, roleId }),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getUserProfile: (userId) =>
    request(`/users/profile?userId=${encodeURIComponent(userId)}`),

  getUser: (userId) =>
    request(`/users/${encodeURIComponent(userId)}`),

  getAllUsers: () => request('/users/all'),
  getSystemInfo: () => request('/system/info'),

  // Roles
  getRoles: () => request('/roles'),
  getRoleById: (roleId) => request(`/roles/${encodeURIComponent(roleId)}`),
  getCompetenciesForRole: (roleId) => request(`/roles/${encodeURIComponent(roleId)}/competencies`),

  // Assessment
  generateAssessment: (userId, roleId) =>
    request('/assessment/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    }),

  submitAssessment: (submission) =>
    request('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    }),

  getAssessmentResult: (quizId) =>
    request(`/assessment/result/${encodeURIComponent(quizId)}`),

  // Learning Path
  generateLearningPath: (userId) =>
    request('/learning-path/generate', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getLearningPath: (userId) =>
    request(`/learning-path/${encodeURIComponent(userId)}`),

  // Modules
  getModule: (moduleId) =>
    request(`/modules/${encodeURIComponent(moduleId)}`),

  completeModule: (moduleId, userId, exerciseAnswerIndex, timeSpentSeconds) =>
    request(`/modules/${encodeURIComponent(moduleId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({ userId, exerciseAnswerIndex, timeSpentSeconds }),
    }),

  // Checkpoints
  generateCheckpoint: (userId, competency) =>
    request('/checkpoint/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, competency }),
    }),

  submitCheckpoint: (submission) =>
    request('/checkpoint/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    }),

  // Dashboard
  getDashboard: (userId) =>
    request(`/dashboard/${encodeURIComponent(userId)}`),
};

# Frontend Reference

## Directory Structure

```
frontend/
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root router + global state
│   ├── api.js               # Centralised API client (fetch wrapper)
│   ├── index.css            # Global design system (CSS variables, tokens)
│   ├── App.css              # App-level layout styles
│   ├── pages/
│   │   ├── LandingPage.jsx  # Public marketing/hero page
│   │   ├── Login.jsx        # Login + Register forms
│   │   ├── RoleSelection.jsx# Career track picker
│   │   ├── QuizView.jsx     # Diagnostic assessment interface
│   │   ├── AssessmentResult.jsx # Score breakdown + competency radar
│   │   ├── LearningPath.jsx # Curated module list from AI
│   │   ├── ModuleViewer.jsx # Full module content reader + exercise
│   │   └── Dashboard.jsx    # Stats, history, heatmap
│   └── components/
│       ├── Navbar.jsx        # Top navigation bar (guest + auth modes)
│       ├── AeroShards.jsx    # WebGL 3D animated background (ReactBits)
│       ├── CheckpointModal.jsx # Competency checkpoint quiz overlay
│       ├── RadarChart.jsx    # SVG competency radar visualisation
│       └── NotFound.jsx      # 404 page
└── vite.config.js            # Vite + dev proxy config
```

---

## Routing — `App.jsx`

AdaptIQ uses a **custom client-side router** (no React Router dependency). The `parseRoute()` function maps `window.location.pathname` to an `activeTab` string.

### Route Table

| URL Path | `activeTab` | Auth Required |
|---|---|---|
| `/` | `landing` (guests) / `dashboard` (authed) | No |
| `/login` | `login` (mode: login) | No |
| `/register` | `login` (mode: register) | No |
| `/roles` | `roles` | No |
| `/dashboard` | `dashboard` | ✅ Yes |
| `/quiz` | `quiz` | ✅ Yes |
| `/result` | `result` | ✅ Yes |
| `/learning-path` | `learning-path` | ✅ Yes |
| `/module/:id` | `module` | ✅ Yes |

### Navigation

Navigation is performed by calling `handleNavigate(path)` which:
1. Checks if the route requires auth.
2. If unauthenticated, redirects to `/login` with an `authNotice` banner.
3. Otherwise pushes to `window.history` and re-evaluates `parseRoute`.

### AeroShards Background

The animated WebGL background is **automatically hidden** on content-heavy pages:

```js
const TABS_NO_ANIMATION = ['quiz', 'result', 'module', 'learning-path', 'dashboard'];
```

A static dark gradient replaces it to keep performance high during complex interactions.

---

## Pages

### `LandingPage.jsx`
Public hero page shown to unauthenticated users.

- **Sections:** Hero CTA, Feature cards, Stats ticker (Roles, Skills, AI model, MongoDB)
- **CTAs:** `Get Started` → `/register`, `Sign In` → `/login`
- No backend calls required.

---

### `Login.jsx`
Unified Login and Registration page.

**Login flow:**
1. POST `/api/auth/login`
2. On success: store user in `localStorage` → `handleLoginSuccess(user)`
3. Redirect to `/roles` if no roleId, else `/dashboard`

**Register flow:**
1. POST `/api/auth/register`
2. Same post-success handling as login

Props: `onLoginSuccess`, `initialMode` (`'login'` or `'register'`), `authNotice`

---

### `RoleSelection.jsx`
Displays 10 engineering career track cards. User picks one to begin assessment.

- Calls `GET /api/roles` to load role list.
- On selection: sets `activeRole` in `App.jsx` state, navigates to `/quiz`.
- Unauthenticated users are redirected to `/login`.

---

### `QuizView.jsx`
The main diagnostic assessment interface.

**Behaviour:**
1. On mount: calls `POST /api/assessment/generate` (takes 5–15s, shows loading state).
2. Shows question cards with A/B/C/D options, difficulty badge, timer (10 min), and progress tracker.
3. Users can navigate freely between questions.
4. On the last question: **Submit & Analyze** button appears.
   - Unanswered questions show a warning but **do not block submission**.
   - On success: calls `onAssessmentComplete(result)` to navigate to `/result`.
   - On error: shows an inline red banner with the error message.

Props: `currentUser`, `activeRole`, `modelName`, `onAssessmentComplete`

---

### `AssessmentResult.jsx`
Score breakdown page shown after quiz submission.

- Displays overall score, level badge (`NOVICE / INTERMEDIATE / EXPERT`).
- Renders `RadarChart` with competency scores.
- Lists per-question reviews (correct/incorrect + explanation).
- CTA: `View My Learning Path` → `/learning-path`.

Props: `assessmentResult`, `currentUser`

---

### `LearningPath.jsx`
Shows the AI-generated personalised curriculum.

- Calls `GET /api/learning-path/{userId}`.
- If no path exists yet, triggers `POST /api/learning-path/generate` (async, 10–30s).
- Lists modules grouped by competency with completion status indicators.
- Each module card navigates to `/module/{moduleId}`.

---

### `ModuleViewer.jsx`
Full-screen module content reader.

- Loads `GET /api/modules/{moduleId}`.
- Renders: Theory section, Code examples (syntax highlighted), Interactive exercise (MCQ).
- On exercise completion: calls `POST /api/modules/{moduleId}/complete`.
- Triggers `CheckpointModal` for competency-level checkpoint quizzes.

---

### `Dashboard.jsx`
User's personalised progress hub.

- Calls `GET /api/dashboard/{userId}`.
- Shows: streak counter, overall level, competency radar, module completion heatmap, assessment history timeline.

---

## Components

### `Navbar.jsx`

Two rendering modes based on `currentUser`:

**Guest mode:** Shows `Sign In` and `Get Started` buttons.

**Authenticated mode:** Shows `Dashboard`, `Career Tracks`, `Learning Path` tabs + user avatar dropdown with `Logout`.

Logo click: routes to `dashboard` (authenticated) or `landing` (guest).

Props: `activeTab`, `setActiveTab`, `currentUser`, `modelName`, `onLogout`

---

### `CheckpointModal.jsx`
A modal overlay that triggers a short 3-question Gemini-generated checkpoint quiz for a specific competency. Appears when:
- A user completes a module in a competency area.
- `checkpointCompetency` state is set in `App.jsx`.

---

### `RadarChart.jsx`
A pure SVG radar/spider chart that visualises competency scores (0–100) across multiple axes. Used in `AssessmentResult` and `Dashboard`.

Props: `competencies` (array of `{ name, score }`)

---

## API Client — `api.js`

A thin wrapper around `fetch` that:
- Prefixes all calls with `/api` (proxied to `:8080` by Vite in dev).
- Falls back to `http://localhost:8080` if the proxy fails.
- Throws descriptive errors from the server's JSON `{ message }` field.

### Available Methods

```js
api.register(displayName, email, password, roleId)
api.login(email, password)
api.verifyAuth(email, displayName, uid)
api.getUserProfile(userId)
api.getUser(userId)
api.getAllUsers()
api.getSystemInfo()
api.getRoles()
api.getRoleById(roleId)
api.getCompetenciesForRole(roleId)
api.generateAssessment(userId, roleId)
api.submitAssessment({ quizId, userId, answers })
api.getAssessmentResult(quizId)
api.generateLearningPath(userId)
api.getLearningPath(userId)
api.getModule(moduleId)
api.completeModule(moduleId, userId, exerciseAnswerIndex, timeSpentSeconds)
api.generateCheckpoint(userId, competency)
api.submitCheckpoint(submission)
api.getDashboard(userId)
```

---

## Design System — `index.css`

All styling uses CSS custom properties for consistent theming.

### Key Variables

```css
--gradient-primary: linear-gradient(135deg, #7c3aed, #a855f7);
--accent-cyan: #22d3ee;
--accent-emerald: #10b981;
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--border-subtle: rgba(255, 255, 255, 0.08);
--radius-md: 12px;
--radius-lg: 20px;
--transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Utility Classes

| Class | Purpose |
|---|---|
| `.glass-panel` | Frosted glass card with backdrop blur |
| `.btn` | Base button reset |
| `.btn-primary` | Purple gradient button |
| `.btn-secondary` | Ghost outline button |
| `.btn-emerald` | Green action button (submit) |
| `.badge` | Small status pill |
| `.badge-expert` | Gold expert badge |
| `.badge-intermediate` | Blue intermediate badge |
| `.badge-novice` | Gray novice badge |
| `.gradient-text` | Purple gradient text (logo) |
| `.animate-pulse-glow` | Pulsing glow animation |
| `.animate-spin-slow` | Slow continuous rotation |

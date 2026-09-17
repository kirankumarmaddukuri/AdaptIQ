# Architecture Overview

## System Design

AdaptIQ is a full-stack web application that uses a **React SPA frontend**, a **Spring Boot REST backend**, and **MongoDB Atlas** for persistence. The AI engine is Google Gemini, called directly from the backend via HTTP using Java's native `HttpClient`.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Browser (React SPA)                           │
│                                                                         │
│   LandingPage ──► Login/Register ──► RoleSelection ──► QuizView        │
│                                           │                             │
│                            AssessmentResult ◄── LearningPath           │
│                                           │                             │
│                              Dashboard ◄──┘◄── ModuleViewer            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  HTTP / Vite Proxy (/api → :8080)
┌───────────────────────────────────▼─────────────────────────────────────┐
│                     Spring Boot Backend (port 8080)                     │
│                                                                         │
│  Controllers ──► Services ──► AIGatewayService ──► Google Gemini API   │
│                      │                                                  │
│                  DataStore (in-memory + write-through)                  │
│                      │                                                  │
│              MongoDB Repositories (Spring Data)                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  mongodb+srv://...
┌───────────────────────────────────▼─────────────────────────────────────┐
│                         MongoDB Atlas Cluster                           │
│   Collections: users · roles · competencies · quizzes · quiz_results   │
│                learning_paths · modules · progress_records              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### Frontend — `App.jsx` (Central Router & State)

`App.jsx` owns the entire routing and top-level state. It does **not** use React Router; instead it uses a custom `parseRoute()` function that maps the browser's `window.location.pathname` to an `activeTab` string.

| State Variable | Purpose |
|---|---|
| `currentUser` | The logged-in user object (sourced from `localStorage`) |
| `activeTab` | Controls which page is rendered (`landing`, `quiz`, `dashboard`, etc.) |
| `activeRole` | The career role selected before starting the assessment |
| `assessmentResult` | The result returned after quiz submission |
| `checkpointCompetency` | Triggers the checkpoint modal overlay |

**Route Guard** — `PROTECTED_PREFIXES = ['/dashboard', '/learning-path', '/quiz', '/result', '/module']`  
Any unauthenticated navigation to a protected prefix redirects to `/login`.

---

### Backend — Service Layer

| Service | Responsibility |
|---|---|
| `AssessmentService` | Generates AI quiz questions, scores submissions, updates user competencies |
| `CurriculumService` | Builds a personalised `LearningPath` from quiz results via Gemini |
| `ContentSynthesisService` | Generates rich `LearningModule` content (theory, code examples, exercises) |
| `CheckpointService` | Generates and evaluates checkpoint quizzes for individual competencies |
| `EvaluationService` | Applies scoring algorithms and maps scores to `NOVICE / INTERMEDIATE / EXPERT` |
| `DashboardService` | Aggregates user stats (streaks, completion rates, competency heatmaps) |
| `ProgressService` | Records module completion events and updates learning path progress |
| `RoleService` | Seeds and retrieves the 10 engineering career track definitions |
| `AIGatewayService` | Single HTTP client wrapping all Gemini API calls with retry and JSON extraction |

---

### DataStore — Hybrid Persistence

`DataStore.java` is the central data coordinator. It uses **in-memory `ConcurrentHashMap`** caches backed by **MongoDB Spring Data Repositories**. On startup it:

1. Seeds roles & competencies (if the collection is empty).
2. Seeds a demo user.
3. Loads all persisted documents from MongoDB into memory.

Every write goes through `DataStore.save*()` methods which update both the in-memory map and the MongoDB collection atomically (write-through cache).

---

## User Journey Data Flow

```
1. User registers → AuthController → DataStore.saveUser() → MongoDB users collection
2. User selects role → Frontend only (stored in component state)
3. User starts quiz → AssessmentController → AssessmentService
                     → AIGatewayService (Gemini) → Quiz with N questions
                     → DataStore.saveQuiz() → MongoDB quizzes collection
4. User submits quiz → AssessmentController → AssessmentService.scoreSubmission()
                      → EvaluationService (NOVICE/INTERMEDIATE/EXPERT per competency)
                      → DataStore.saveQuizResult() → quiz_results collection
                      → DataStore.saveUser() (updates competencyLevels, assessmentHistory)
5. Learning path generated → CurriculumService → AIGatewayService (Gemini)
                           → ContentSynthesisService (module content per competency gap)
                           → DataStore.saveLearningPath() + DataStore.saveModule()
6. User completes a module → ModuleController → ProgressService
                           → DataStore.saveProgress() → progress_records collection
```

---

## Security Model

- Passwords are stored as **plain text hashed on the `DataStore` level** (via in-memory `passwordsByUserId` map keyed by userId, loaded from MongoDB at startup).
- Authentication is **stateless** — the frontend stores the user JSON in `localStorage` and sends `userId` on every request.
- Route guarding is enforced on **both** the frontend (via `parseRoute`) and would be extended to JWT tokens for production.

> ⚠️ **For production** — implement Spring Security with JWT tokens and BCrypt password hashing.

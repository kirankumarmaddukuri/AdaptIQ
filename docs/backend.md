# Backend API Reference

**Base URL:** `http://localhost:8080/api`

All requests and responses use `Content-Type: application/json`.

---

## Authentication — `/api/auth`

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "roleId": "role-frontend-engineer"
}
```

**Response `200 OK`:**
```json
{
  "id": "usr-xxxx",
  "email": "jane@example.com",
  "displayName": "Jane Doe",
  "roleId": "role-frontend-engineer",
  "roleName": "Frontend Engineer",
  "overallLevel": "UNASSESSED"
}
```

**Errors:**
- `409 Conflict` — email already registered

---

### POST `/api/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response `200 OK`:** Same as register response with updated fields.

**Errors:**
- `401 Unauthorized` — invalid credentials

---

### POST `/api/auth/verify`
Verify or create a user from a third-party auth token (e.g. Google OAuth).

**Request Body:**
```json
{ "email": "jane@example.com", "displayName": "Jane Doe", "uid": "google-uid-xxx" }
```

---

## Users — `/api/users`

### GET `/api/users/profile?userId={id}`
Returns the full user profile including competency levels and assessment history.

### GET `/api/users/{userId}`
Returns a user by their ID. Returns `404` if not found.

### GET `/api/users/all`
Returns all users (admin use).

### PUT `/api/users/profile`
Updates display name or assigned role.

**Request Body:**
```json
{
  "userId": "usr-xxxx",
  "roleId": "role-backend-engineer",
  "roleName": "Backend Engineer",
  "displayName": "Jane Smith"
}
```

---

## Roles — `/api/roles`

### GET `/api/roles`
Returns all 10 available engineering career track roles.

**Response:**
```json
[
  {
    "id": "role-frontend-engineer",
    "name": "Frontend Engineer",
    "category": "Engineering",
    "description": "...",
    "icon": "🖥️",
    "competencies": ["HTML/CSS", "JavaScript", "React", "Performance", "Accessibility"]
  }
]
```

### GET `/api/roles/{roleId}`
Returns a single role by ID.

### GET `/api/roles/{roleId}/competencies`
Returns the competency list for a role.

---

## Assessment — `/api/assessment`

### POST `/api/assessment/generate`
Uses Gemini AI to generate a diagnostic quiz tailored to the user's selected role.

**Request Body:**
```json
{ "userId": "usr-xxxx", "roleId": "role-frontend-engineer" }
```

**Response:**
```json
{
  "id": "quiz-xxxx",
  "roleName": "Frontend Engineer",
  "questions": [
    {
      "id": "q-001",
      "text": "Which CSS property is used to create a flexbox container?",
      "options": ["display: flex", "position: flex", "layout: flex", "flex: true"],
      "difficulty": "EASY",
      "competency": "HTML/CSS"
    }
  ]
}
```

> ⚠️ This call invokes Gemini AI and may take **5–15 seconds** to respond.

---

### POST `/api/assessment/submit`
Submits answers, scores the quiz, updates user competency levels, and triggers async learning path generation.

**Request Body:**
```json
{
  "quizId": "quiz-xxxx",
  "userId": "usr-xxxx",
  "answers": {
    "q-001": 0,
    "q-002": 2
  }
}
```

**Response:**
```json
{
  "quizId": "quiz-xxxx",
  "userId": "usr-xxxx",
  "overallScore": 72,
  "resultLevel": "INTERMEDIATE",
  "competencyBreakdown": {
    "HTML/CSS": { "score": 85, "level": "EXPERT" },
    "JavaScript": { "score": 60, "level": "INTERMEDIATE" }
  },
  "questionReviews": [...]
}
```

### GET `/api/assessment/result/{quizId}`
Retrieves a stored quiz result by quiz ID.

---

## Learning Path — `/api/learning-path`

### POST `/api/learning-path/generate`
Generates a personalised learning path using Gemini based on the user's latest assessment gaps.

**Request Body:**
```json
{ "userId": "usr-xxxx" }
```

> ⚠️ This call invokes Gemini AI and may take **10–30 seconds**.

### GET `/api/learning-path/{userId}`
Retrieves the user's current learning path with all modules and completion status.

---

## Modules — `/api/modules`

### GET `/api/modules/{moduleId}`
Returns full module content including theory, code examples, and interactive exercise.

### POST `/api/modules/{moduleId}/complete`
Records module completion and updates learning path progress.

**Request Body:**
```json
{
  "userId": "usr-xxxx",
  "exerciseAnswerIndex": 1,
  "timeSpentSeconds": 420
}
```

---

## Checkpoints — `/api/checkpoint`

### POST `/api/checkpoint/generate`
Generates a short checkpoint quiz for a specific competency.

**Request Body:**
```json
{ "userId": "usr-xxxx", "competency": "JavaScript" }
```

### POST `/api/checkpoint/submit`
Submits checkpoint answers and updates competency level if improved.

---

## Dashboard — `/api/dashboard`

### GET `/api/dashboard/{userId}`
Returns aggregated stats for the user's dashboard view.

**Response includes:**
- Overall level and score
- Competency radar data
- Module completion streaks
- Assessment history timeline
- Learning path progress percentage

---

## System — `/api/system`

### GET `/api/system/info`
Returns runtime info: active AI model name, Java version, Spring Boot version.

---

## Error Response Format

All error responses follow this structure:

```json
{
  "message": "Human-readable error description",
  "status": 404,
  "timestamp": "2026-09-17T09:00:00"
}
```

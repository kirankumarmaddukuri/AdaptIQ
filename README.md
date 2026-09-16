# AdaptIQ

AdaptIQ is a competency-based adaptive learning platform. Users create a profile, choose a career role, complete a role-specific assessment, and receive a personalized learning path with level-aware learning modules.

## Current Features

- User registration and login
- Role selection from 10 engineering career tracks
- Role-specific AI-generated diagnostic questions
- Assessment scoring by competency
- Novice, intermediate, and expert skill levels
- Personalized learning paths per user and role
- Level-aware learning content:
  - Novice: fundamentals, definitions, analogies, and guided steps
  - Intermediate: practical implementation, debugging, and tradeoffs
  - Expert: architecture, internals, performance, and production concerns
- Assessment history with saved questions, selected answers, correct answers, and explanations
- Separate learning paths when the same user assesses for multiple roles
- Module exercises and competency checkpoints
- Logout flow
- Backend-provided AI model name in the frontend

## Project Structure

```text
backend/
  pom.xml
  src/main/java/com/adaptivelearning/
    controller/       REST endpoints
    model/            Domain models
    repository/       Current in-memory data store
    service/          Assessment, curriculum, progress, and AI services
    config/           Spring and Firebase configuration
  src/main/resources/application.properties

frontend/
  package.json
  src/
    App.jsx
    api.js
    components/
    pages/
  public/
```

## Technology Stack

- Frontend: React, Vite, Lucide React, Canvas Confetti
- Backend: Java 17, Spring Boot 3.2.5, Maven
- AI: Google Gemini API through the backend AI gateway
- Planned persistence: Firebase Firestore

## Prerequisites

- Node.js 20.19+ or Node.js 22.12+
- npm
- Java 17+
- Maven

## Run Locally

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on the Vite development URL, normally:

```text
http://localhost:5173
```

## Useful Commands

Frontend:

```powershell
cd frontend
npm run build
npm run lint
```

Backend:

```powershell
cd backend
mvn test
```

## API Overview

| Area | Endpoint | Purpose |
|---|---|---|
| Authentication | `POST /api/auth/register` | Create a user profile and assign a role |
| Authentication | `POST /api/auth/login` | Sign in with email and password |
| Roles | `GET /api/roles` | List available career roles |
| Assessment | `POST /api/assessment/generate` | Generate role-specific questions |
| Assessment | `POST /api/assessment/submit` | Score an assessment |
| Learning Path | `POST /api/learning-path/generate` | Generate a personalized path |
| Learning Path | `GET /api/learning-path/{userId}` | Retrieve the current role path |
| Dashboard | `GET /api/dashboard/{userId}` | Retrieve dashboard data |
| System | `GET /api/system/info` | Retrieve configured system and AI model information |

## Data Persistence Status

The application currently uses an in-memory `DataStore`. Users, assessments, progress, and learning paths are lost when the backend restarts.

Firebase Admin SDK configuration is present but disabled by default:

```properties
firebase.enabled=false
```

Firebase Firestore persistence is planned for a later step. Do not commit Firebase service-account files or API keys to the repository.

## Configuration

The backend configuration is in:

```text
backend/src/main/resources/application.properties
```

For local development, configure the Gemini API key and model through environment variables or a local configuration file rather than committing secrets.

Create `backend/.env` for local development using the ignored file `backend/.env.example` as a template. Set `GEMINI_API_KEY` in your shell or IDE environment before starting Spring Boot; Spring reads it through `application.properties`.

## Security Notes

- Passwords are currently stored only for local prototype authentication and should be replaced with Firebase Authentication or a properly hashed password system before production use.
- Move the Gemini API key to an environment variable and rotate any key that has been exposed.
- Add authentication and authorization checks to protected API endpoints before deployment.
- Configure Firestore security rules before enabling production persistence.

## Future Improvements

- Persist users, assessments, paths, and progress in Firestore
- Use Firebase Authentication for account management
- Add automated frontend and backend tests
- Add protected API authentication with Firebase ID tokens
- Add production deployment configuration

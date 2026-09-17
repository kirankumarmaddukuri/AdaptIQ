# User Guide

## Welcome to AdaptIQ

AdaptIQ is an intelligent adaptive learning platform that assesses your engineering competencies and builds a personalised curriculum to close your skill gaps.

---

## Step 1 — Landing Page

When you first open AdaptIQ at `http://localhost:5173`, you'll see the **landing page** with:

- A **hero section** explaining the platform
- **Feature highlights** (AI-powered assessments, adaptive learning paths, role-based tracks)
- Platform metrics (roles, skills, AI model, database)
- Two CTAs: **Get Started** (register) and **Sign In** (login)

> Existing users click **Sign In**. New users click **Get Started**.

---

## Step 2 — Register or Sign In

### Registering a New Account

1. Click **Get Started** on the landing page.
2. Fill in:
   - **Display Name** — your name as shown in the app
   - **Email** — your login identifier
   - **Password** — minimum 6 characters
3. Click **Create Account**.

### Signing In

1. Click **Sign In**.
2. Enter your email and password.
3. Click **Sign In**.

On successful authentication you'll be taken to **Career Tracks**.

---

## Step 3 — Select a Career Track

The **Career Tracks** page shows 10 engineering role cards:

| Role | Example Competencies |
|---|---|
| Frontend Engineer | HTML/CSS, JavaScript, React, Performance |
| Backend Engineer | Java/Spring, REST APIs, Databases, System Design |
| Full-Stack Engineer | Frontend + Backend stack |
| DevOps Engineer | CI/CD, Containers, Cloud, IaC |
| Data Engineer | SQL, ETL, Pipelines, Data Warehousing |
| ML Engineer | Python, Model Training, MLOps |
| Mobile Engineer | iOS/Android, React Native, App Architecture |
| Security Engineer | OWASP, Auth, Cryptography, Threat Modeling |
| Cloud Architect | AWS/GCP/Azure, Architecture, Cost Optimisation |
| Platform Engineer | Kubernetes, Service Mesh, Observability |

1. Browse the cards and read the competency list.
2. Click **Select & Start Assessment** on your role.
3. Confirm if prompted.

> ⚠️ You must be logged in to start an assessment. You'll be redirected to sign in if not.

---

## Step 4 — Diagnostic Assessment

The assessment page loads with:

- A **timer** (10 minutes)
- Your **progress tracker** (Answered: X / Y)
- The **current question** with A/B/C/D options and a difficulty badge

### Taking the Quiz

- Click any option to select it (highlighted in purple).
- Use **Previous** / **Next** to move between questions.
- You can revisit and change answers freely.
- Unanswered questions show a warning but **don't block submission**.

### Submitting

1. Navigate to the **last question**.
2. Click **Submit & Analyze**.
3. The button changes to `Analyzing Results...` with a spinner.
4. Wait 5–15 seconds for Gemini to score your submission.
5. You'll be automatically taken to your results page.

> If you see a red error banner, check the backend is running and click the button again.

---

## Step 5 — Assessment Results

Your results page shows:

- **Overall Score** (0–100) and **Level** (`NOVICE / INTERMEDIATE / EXPERT`)
- **Competency Radar** — a spider chart showing your score per competency
- **Competency Breakdown** — individual scores for each skill area
- **Question Reviews** — each question with your answer, the correct answer, and an explanation

### Next Step

Click **View My Learning Path** to see your personalised curriculum.

---

## Step 6 — Learning Path

Your learning path is an AI-generated sequence of modules targeting your weakest competency areas first.

Each module card shows:

- Module title and competency area
- Estimated time to complete
- Completion status (✅ done / ⬜ not started)

Click any module card to open it in the **Module Viewer**.

> If your learning path hasn't generated yet, the page shows a loading indicator. It typically takes 15–60 seconds after assessment submission.

---

## Step 7 — Module Viewer

Each learning module contains:

| Section | Description |
|---|---|
| **Theory** | Detailed concept explanation with examples |
| **Code Examples** | 2–3 real code snippets relevant to the concept |
| **Exercise** | A multiple-choice question to test understanding |

### Completing a Module

1. Read through the theory and code examples.
2. Answer the **exercise question**.
3. Click **Complete Module**.
4. Your progress is saved and the learning path updates.

### Checkpoint Quizzes

After completing certain modules, a **Checkpoint Quiz** modal appears with 3–5 targeted questions on that competency. A good score upgrades your competency level from `NOVICE → INTERMEDIATE` or `INTERMEDIATE → EXPERT`.

---

## Step 8 — Dashboard

The **Dashboard** is your progress hub. Access it via the top navbar.

It shows:

| Card | Description |
|---|---|
| **Overall Level** | Your current proficiency level |
| **Competency Radar** | Visual heatmap of all competency scores |
| **Streak** | Consecutive days of learning activity |
| **Module Progress** | Modules completed vs. total |
| **Assessment History** | Timeline of past quizzes with scores |

---

## Navigation Reference

| Navbar Item | Route | Purpose |
|---|---|---|
| AdaptIQ logo | `/dashboard` | Go to dashboard |
| Dashboard | `/dashboard` | Progress overview |
| Career Tracks | `/roles` | Pick or switch role |
| Learning Path | `/learning-path` | View your curriculum |
| User Avatar | — | Opens dropdown: profile info + Logout |

---

## Tips

- **Retry the assessment** at any time by going to Career Tracks → selecting your role → clicking Start Assessment again.
- **Switch roles** by selecting a different career track. A new assessment will be generated for that role.
- **Module order matters** — the AI sequences them weakest-first for maximum learning efficiency.
- **Checkpoint quizzes** are the fastest way to upgrade your competency level without a full reassessment.

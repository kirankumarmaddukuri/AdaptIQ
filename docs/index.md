# AdaptIQ Documentation

> **Competency-Based Adaptive Learning Platform** — powered by Google Gemini AI & MongoDB Atlas

---

## 📖 Table of Contents

| Document | Description |
|---|---|
| [Architecture Overview](./architecture.md) | System design, data flow, and component relationships |
| [Backend Reference](./backend.md) | REST API endpoints, services, data models |
| [Frontend Reference](./frontend.md) | Pages, components, routing, and state management |
| [Database Guide](./database.md) | MongoDB collections, schemas, and DataStore coordinator |
| [AI Integration](./ai-integration.md) | Gemini API usage, prompts, and AI service pipeline |
| [Setup & Deployment](./setup.md) | Local development, environment variables, and production build |
| [User Guide](./user-guide.md) | End-to-end walkthrough of the application for a new user |

---

## 🚀 Quick Start

```powershell
# 1. Clone the repository
git clone https://github.com/kirankumarmaddukuri/AdaptIQ.git
cd AdaptIQ

# 2. Add environment variables (see setup.md)
cp .env.example .env   # fill in GEMINI_API_KEY and MONGODB_URI

# 3. Start the backend (Java 17 + Maven required)
cd backend
.\mvnw spring-boot:run

# 4. Start the frontend (Node 18+ required) — in a new terminal
cd frontend
npm install
npm run dev
```

The app is now running at **http://localhost:5173**  
The backend API is available at **http://localhost:8080/api**

---

## 🏗️ Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Vanilla CSS |
| Backend | Spring Boot 3.2, Java 17 |
| Database | MongoDB Atlas (Spring Data MongoDB) |
| AI Engine | Google Gemini (`gemini-3.1-flash-lite`) |
| Background FX | ReactBits AeroShards (WebGL) |

---

*Generated: September 2026 · Repository: [kirankumarmaddukuri/AdaptIQ](https://github.com/kirankumarmaddukuri/AdaptIQ)*

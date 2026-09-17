# Setup & Deployment Guide

## Prerequisites

| Tool | Minimum Version | Check |
|---|---|---|
| Java JDK | 17 | `java -version` |
| Maven (or use `mvnw`) | 3.9+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| Git | any | `git -version` |

---

## Local Development

### 1. Clone the Repository

```powershell
git clone https://github.com/kirankumarmaddukuri/AdaptIQ.git
cd AdaptIQ
```

---

### 2. Environment Variables

Create a `.env` file in the **project root** (`c:\...\AdaptIQ\.env`):

```env
GEMINI_API_KEY=your-google-gemini-api-key-here
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxx.mongodb.net/adaptiq?retryWrites=true&w=majority&appName=Cluster0
```

> The backend reads this file via Spring's `spring.config.import=optional:file:.env[.properties]`.  
> The `MONGODB_URI` has a fallback default in `application.properties` pointing to the Atlas cluster.

---

### 3. Start the Backend

```powershell
cd backend
.\mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**.

**First-run behaviour:**
- Seeds 10 engineering roles into MongoDB (if empty).
- Seeds a demo user account.
- Loads all existing data from MongoDB into the in-memory cache.

**Verify:**
```powershell
curl http://localhost:8080/api/system/info
curl http://localhost:8080/api/roles
```

---

### 4. Start the Frontend

Open a **new terminal**:

```powershell
cd frontend
npm install       # First time only
npm run dev
```

The frontend starts on **http://localhost:5173**.

The Vite dev server proxies `/api` requests to `:8080` automatically (configured in `vite.config.js`).

---

### 5. Demo Account

A demo user is seeded automatically on every backend start:

| Field | Value |
|---|---|
| Email | `demo@adaptiq.com` |
| Password | `demo123` |

---

## Environment Variable Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | _(none)_ | Google Gemini API key |
| `MONGODB_URI` | ✅ Yes | Atlas cluster URI in properties | MongoDB connection string |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Override the AI model |

---

## Production Build

### Frontend

```powershell
cd frontend
npm run build
```

Outputs to `frontend/dist/`. Serve with any static host (Vercel, Netlify, Nginx).

### Backend

```powershell
cd backend
.\mvnw package -DskipTests
java -jar target/adaptive-learning-backend-*.jar
```

---

## Deploying to a VPS / Cloud VM

### Backend (Spring Boot JAR)

```bash
# Copy the JAR and .env to your server
scp backend/target/adaptive-learning-backend-*.jar user@server:/opt/adaptiq/
scp .env user@server:/opt/adaptiq/

# On the server
cd /opt/adaptiq
java -jar adaptive-learning-backend-*.jar &
```

Set `GEMINI_API_KEY` and `MONGODB_URI` as system environment variables or pass them directly:

```bash
GEMINI_API_KEY=xxx MONGODB_URI=mongodb+srv://... java -jar adaptive-learning-backend-*.jar
```

### Frontend (Nginx)

```bash
# Upload dist/ to server
scp -r frontend/dist/* user@server:/var/www/adaptiq/

# Nginx config snippet
server {
    listen 80;
    root /var/www/adaptiq;
    index index.html;

    # Proxy API calls to Spring Boot
    location /api {
        proxy_pass http://localhost:8080;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Running Tests

### Backend Unit Tests

```powershell
cd backend
.\mvnw test
```

### Frontend Production Build Check

```powershell
cd frontend
npm run build
```

A clean build with no errors confirms the frontend is production-ready.

---

## Troubleshooting

### Port 8080 already in use

```powershell
# Find what's using it
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Backend fails to connect to MongoDB

- Verify `MONGODB_URI` in your `.env` is correct.
- Check MongoDB Atlas → Network Access → ensure your IP (or `0.0.0.0/0` for dev) is whitelisted.

### Gemini API returns errors

- Verify `GEMINI_API_KEY` is set and valid at [aistudio.google.com](https://aistudio.google.com/app/apikey).
- Check you haven't exceeded the free-tier rate limit (60 requests/minute).

### Frontend shows blank page

- Check browser console for errors.
- Verify `npm run build` succeeds locally.
- Ensure the Vite dev server is running on `:5173` and backend on `:8080`.

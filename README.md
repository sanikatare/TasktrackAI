# StudyAI — Smart Study Scheduler

AI-powered academic task manager for engineering students.
Combines MERN full-stack development, Machine Learning, Generative AI (Claude),
Google Calendar integration, and Firebase authentication.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend  React 18 + TypeScript + Tailwind CSS             │
│  (Port 3000)  Persian Blue / Tata design system             │
│  Zustand state · React Query · Chart.js analytics           │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│  Backend   Node.js + Express + TypeScript                   │
│  (Port 5000)                                                │
│  Firebase Auth Middleware · Mongoose ODM                    │
│  Google Calendar API · Firebase Push Notifications          │
│  Claude (Anthropic) API for study plan generation           │
└──────────┬─────────────────────────┬────────────────────────┘
           │ Mongoose                │ axios
┌──────────▼──────────┐   ┌──────────▼──────────────────────┐
│  MongoDB             │   │  AI Service  FastAPI + Python   │
│  (Port 27017)        │   │  (Port 8000)                    │
│  Users · Tasks       │   │  Ridge Regression (time pred)   │
│  ScheduleBlocks      │   │  Multi-factor Recommender       │
│  StudySessions       │   │  EDF Scheduling Algorithm       │
│  AIStudyPlans        │   │  Incremental model retraining   │
└─────────────────────┘   └─────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB 7+ (local or Atlas)
- Firebase project (Authentication + Cloud Messaging)
- Google Cloud project (Calendar API enabled)
- Anthropic API key

### 1 — Clone and install

```bash
git clone <repo-url>
cd smart-study-scheduler

# Backend
cd backend
cp .env.example .env        # fill in all values
npm install

# Frontend
cd ../frontend
cp .env.example .env.local  # fill in Firebase config
npm install

# AI Service
cd ../ai-service
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2 — Configure environment

**backend/.env** — required keys:
| Key | Where to get it |
|-----|----------------|
| MONGODB_URI | MongoDB Atlas or local |
| FIREBASE_PROJECT_ID | Firebase console > Project settings |
| FIREBASE_PRIVATE_KEY | Firebase console > Service accounts > Generate key |
| FIREBASE_CLIENT_EMAIL | Same JSON file |
| GOOGLE_CLIENT_ID | Google Cloud console > OAuth 2.0 |
| GOOGLE_CLIENT_SECRET | Same |
| ANTHROPIC_API_KEY | console.anthropic.com |

**frontend/.env.local** — copy values from Firebase console > Your apps > Web app config.

### 3 — Run in development

```bash
# Terminal 1 — MongoDB
mongod

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — AI Service
cd ai-service && uvicorn main:app --reload --port 8000

# Terminal 4 — Frontend
cd frontend && npm run dev
```

Open http://localhost:3000

### 4 — Docker (full stack)

```bash
# Copy and fill backend/.env first
docker compose up --build
```

---

## API Reference

### Backend (Express — port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create user profile |
| GET | /api/auth/me | Get current user |
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PATCH | /api/tasks/:id/complete | Mark complete |
| PATCH | /api/tasks/:id/skip | Mark skipped |
| POST | /api/schedule/generate | AI schedule generation |
| GET | /api/schedule | Fetch schedule blocks |
| POST | /api/schedule/sync-calendar | Push to Google Calendar |
| GET | /api/analytics | Full analytics dashboard |
| GET | /api/ai/recommend | Next task recommendation |
| POST | /api/ai/generate-plan | Claude AI study plan |
| GET | /api/calendar/auth | Start Google OAuth flow |

### AI Service (FastAPI — port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /predict-time | Regression time prediction |
| POST | /recommend | Task recommendation engine |
| POST | /optimize-schedule | EDF schedule optimizer |
| POST | /update-model | Feed real data for retraining |

Interactive docs at http://localhost:8000/docs

---

## AI & ML Components

### Time Prediction (Ridge Regression)
- Features: difficulty, estimated hours, subject category (OHE)
- Bootstraps from 400 synthetic seed samples
- Incrementally retrains every 20 real completions
- Prediction feeds into schedule optimizer as more accurate hour estimates

### Recommendation Engine
- Weighted scoring: deadline proximity (45%) + priority (25%) + difficulty (15%) + effort (10%) + status (5%)
- Exponential urgency curve for deadlines
- Returns top-1 recommendation + 3 alternatives

### EDF Scheduling Algorithm
- Earliest Deadline First with priority tiebreaking
- Sessions chunked to max 2 h to prevent fatigue
- Respects user's preferred time windows (morning/afternoon/evening/night)
- Emits feasibility score and warnings for over-committed schedules

### Claude AI Study Plans
- Called via Anthropic SDK with a structured JSON prompt
- Returns breakdown sections, daily goals, and resource recommendations
- Plans are persisted and can be regenerated on demand

---

## Deployment

### Vercel (Frontend)
```bash
cd frontend && vercel --prod
```

### Railway / Render (Backend + AI Service)
- Set env vars in dashboard
- Use Dockerfile for each service

### MongoDB Atlas
- Free tier sufficient for development
- Replace MONGODB_URI with Atlas connection string

---

## Project Structure

```
smart-study-scheduler/
├── frontend/           # React 18 + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/ # Layout, UI atoms, modals
│   │   ├── pages/      # Dashboard, Tasks, Schedule, Analytics, StudyPlan
│   │   ├── hooks/      # useAuth, useTasks, useAuthStore
│   │   ├── types/      # Centralised TypeScript types
│   │   ├── config/     # Firebase, constants
│   │   └── utils/      # apiClient, dateUtils
├── backend/            # Node.js + Express + TypeScript
│   └── src/
│       ├── models/     # User, Task, ScheduleBlock, StudySession, AIStudyPlan
│       ├── routes/     # auth, tasks, schedule, analytics, ai, calendar
│       ├── middleware/ # authenticate (Firebase), errorHandler
│       └── services/   # googleCalendar, notifications, claudePrompts
└── ai-service/         # Python FastAPI
    ├── routers/        # predict, recommend, schedule, model_update
    ├── services/       # time_predictor, recommender, scheduler
    └── models/         # Pydantic schemas + saved .pkl files
```

<p align="center">
  <img src="https://img.icons8.com/fluency/96/mountain.png" alt="Clamber Logo" width="80" />
</p>

<h1 align="center">Clamber</h1>

<p align="center">
  <strong>AI-Powered Academic Management & Burnout Prevention Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

<p align="center">
  A full-stack MERN application that helps university students manage their academic workload,<br/>
  predict burnout risk, and maintain mental well-being through AI-driven insights.
</p>

---

## 🌟 Overview

**Clamber** is a comprehensive academic companion built for students who want to climb higher without burning out. It combines intelligent task management, real-time burnout risk analysis, grade prediction, and a personal AI study assistant into a single, beautifully designed platform.

The platform uses **Groq-powered AI** to provide personalized study advice, a **Burnout Risk Index** algorithm that monitors student wellness metrics, and a **Reverse Grade Planner** that calculates exactly what scores you need on remaining assessments to hit your target GPA.

---

## ✨ Key Features

### 📋 Smart Task Management
- Notion-style inline-editable task table with real-time updates
- Calendar view with drag-and-drop task visualization
- Priority, status, and subject categorization
- Quick-add modal for rapid task creation

### 🧠 AI Study Assistant
- Conversational AI powered by Groq (LLaMA/Mixtral)
- Context-aware responses based on your courses, tasks, and workload
- Conversation history with multi-session support
- Markdown-rendered responses with code block support

### 🔥 Burnout Prevention Engine
- Real-time **Burnout Risk Index** (0–100 score)
- Contributing factor analysis: workload, sleep quality, deadline pressure, stress
- Interactive trend visualization with 7/30/90-day period views
- Weekly wellness check-in system
- Crisis resource prompts for high-risk students

### 📊 Academic Analytics
- Study hours tracking with weekly/monthly breakdowns
- Course-level performance distribution
- Productivity trends and focus session analytics
- Exportable academic performance reports

### 🎯 Reverse Grade Planner
- Per-course assessment breakdown with weight tracking
- Calculates required average on remaining assessments
- Academic Recovery Mode when targets become unreachable
- Current vs. projected vs. target GPA comparison

### 🛡️ Advisor Support Portal
- Anonymized student risk monitoring for academic advisors
- Burnout alert system for proactive intervention
- Privacy-first design with student consent controls

### ⚙️ Full Customization
- Light & Dark theme with 5 accent color presets
- Font size accessibility controls (sm/base/lg/xl)
- Prayer time blocking with auto/manual scheduling
- Sound notifications with volume control
- Custom blocked time periods for personal commitments

---

## 🏗️ Architecture

```
clamber-monorepo/
├── client/                    # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── api/               # Axios API client with JWT auto-refresh
│   │   ├── components/        # Shared & layout components
│   │   │   ├── layout/        # AppLayout, Sidebar, Header
│   │   │   ├── shared/        # PomodoroTimer, QuickAddTask, NeuralBackground
│   │   │   └── tasks/         # TaskRow, TaskCalendar
│   │   ├── hooks/             # Zustand stores (auth, settings)
│   │   ├── pages/             # 14 lazy-loaded page modules
│   │   ├── styles/            # CSS design system (variables, pages, components)
│   │   └── utils/             # Offline cache, helpers
│   └── index.html             # Entry point with SEO meta tags
│
├── server/                    # Node.js + Express (Clean Architecture)
│   ├── src/
│   │   ├── config/            # Environment validation
│   │   ├── infrastructure/    # Database, external services, security, sockets
│   │   │   ├── database/      # MongoDB connection & models
│   │   │   ├── external-services/  # Email (Nodemailer), AI (Groq)
│   │   │   └── security/      # Passport.js, JWT strategy, Google OAuth
│   │   ├── interfaces/        # Controllers, routes, validators, middleware
│   │   ├── scripts/           # Database seeding
│   │   ├── utils/             # Logger, ApiError, helpers
│   │   └── views/             # EJS admin panel templates
│   └── .env                   # Environment variables (not committed)
│
├── index.js                   # Production entry point
├── Dockerfile                 # Container deployment
├── Procfile                   # Sevalla/Heroku process config
└── package.json               # Workspace root (npm workspaces)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **State Management** | Zustand (persisted stores) |
| **Styling** | Vanilla CSS with custom design tokens & CSS variables |
| **Animations** | Framer Motion, Three.js (Neural Background) |
| **Charts** | Recharts (area, bar, line) |
| **Icons** | Lucide React |
| **Backend** | Node.js 22+, Express.js |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | JWT (access + refresh), Google OAuth 2.0, Passport.js |
| **AI Engine** | Groq API (LLaMA / Mixtral models) |
| **Email** | Nodemailer with SMTP (Gmail App Password) |
| **Security** | Helmet, CORS, express-rate-limit, mongo-sanitize, xss-clean |
| **Deployment** | Sevalla (Docker), npm workspaces monorepo |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 22.0.0
- **MongoDB** (local or Atlas cluster)
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/EshaalB/Clamber.git
cd Clamber

# Install all dependencies (client + server)
npm install
```

### Environment Setup

Create a `.env` file in the `server/` directory:

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/clamber
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# AI (Required for AI Assistant)
GROQ_API_KEY=your_groq_api_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Running Locally

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📱 Pages & Modules

| Page | Route | Description |
|------|-------|-------------|
| Landing Page | `/` | Public marketing page with feature showcase |
| Login / Signup | `/login`, `/signup` | Split-layout auth with Google OAuth |
| Email Verification | `/verify` | 6-digit OTP verification flow |
| Onboarding | `/onboarding` | 6-step guided setup (courses, GPA goals, wellness) |
| Dashboard | `/dashboard` | Central hub with stats, tasks, focus timer, activity |
| Tasks | `/tasks` | Notion-style table + calendar view |
| Burnout Analysis | `/burnout` | Risk gauge, trend charts, wellness check-in |
| Analytics | `/analytics` | Study hours, course distribution, productivity |
| Grade Planner | `/grade-planner` | Reverse GPA calculator with assessment tracking |
| AI Assistant | `/ai-assistant` | Conversational study companion |
| Profile | `/profile` | Academic identity, courses, semester actions |
| Settings | `/settings` | Theme, accent, notifications, prayer times |
| Advisor Portal | `/advisor` | Anonymized student risk monitoring |
| Admin Panel | `/admin` | User management, system stats, audit logs |

---

## 🔒 Security Features

- **JWT Authentication** with short-lived access tokens (15min) and refresh rotation (7 days)
- **Rate Limiting** — 200 req/15min global, 10 req/15min on auth endpoints
- **Data Sanitization** — MongoDB injection prevention via `express-mongo-sanitize`
- **XSS Protection** — Input sanitization via `xss-clean`
- **Helmet** — HTTP security headers
- **CORS** — Origin-restricted cross-origin policy
- **Password Hashing** — bcrypt with salt rounds
- **Google OAuth 2.0** — Secure third-party authentication

---

## ⚡ Performance Optimizations

- **Code Splitting** — All 14 pages use `React.lazy()` with Suspense
- **Chunk Optimization** — Vite manual chunks separate vendor libraries (Three.js, Recharts, Framer Motion)
- **Instant Navigation** — No full-page loading states; layouts render immediately
- **Image Lazy Loading** — Below-the-fold images use native `loading="lazy"`
- **Offline Support** — API responses cached for offline resilience
- **Custom Scrollbars** — Slim, themed scrollbars for a premium feel

---

## 🎨 Design System

Clamber uses a custom **CSS design token system** defined in `variables.css`:

- **5 Accent Colors**: Blue, Pink, Lavender, Mint, Peach
- **Dynamic Hover**: Auto-calculated via `color-mix()` — no hardcoded hover colors
- **Semantic Status Tokens**: Success, Warning, Error, Info (light & dark variants)
- **Typography**: Plus Jakarta Sans from Google Fonts
- **Spacing Scale**: xs (8px) → xl (48px)
- **Radius Scale**: sm (6px) → full (100px)
- **Shadow Scale**: sm → lg with theme-aware opacity

---

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test
```

---

## 📦 Deployment

Clamber is deployed on **Sevalla** as a containerized monorepo:

```bash
# Build the production frontend
npm run build-frontend

# Start the production server
npm start
```

The server serves the built React app from `client/dist/` and handles all API requests.

### Environment Variables (Production)

Ensure the following are set in your hosting dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `CLIENT_URL` | ✅ | Frontend URL (no trailing slash) |
| `GROQ_API_KEY` | ✅ | Groq API key for AI assistant |
| `GOOGLE_CLIENT_ID` | ⚠️ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Google OAuth client secret |
| `ADMIN_PASSWORD` | ⚠️ | Admin panel login password |

---

## 👥 Authors

- **Eshaal Rehmatullah** — Full-Stack Developer

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ for students who want to climb higher without burning out.
</p>

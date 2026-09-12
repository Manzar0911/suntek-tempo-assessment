# Tempo — Task and Time Tracking Workspace

Tempo is a full-stack productivity workspace for managing tasks, tracking focused work in real time, scheduling intelligent reminders, and analyzing deep daily and weekly productivity insights. It was built for the Full Stack Task and Time Tracking assessment as two independent TypeScript applications—React for the client and NestJS for the API—powered by **PostgreSQL (hosted on Aiven Cloud)** and **Prisma ORM**.

---

## 🚀 Review Links & Credentials

| Resource | Location / Details |
| --- | --- |
| **Frontend (Local)** | <http://localhost:5173> |
| **REST API (Local)** | <http://localhost:3000/api/v1> |
| **Swagger OpenAPI Docs** | <http://localhost:3000/docs> |
| **Database Provider** | **PostgreSQL (Aiven Cloud Managed)** |
| **Demo Reviewer Email** | `reviewer@tempo.app` |
| **Demo Reviewer Password** | `Review123!` |

> 💡 **Demo Account:** The database is pre-seeded with rich sample data for `reviewer@tempo.app` (14 tasks across backlog, in-progress, and completed states, 16 historical time logs over 7 days, and an active live timer) to showcase the productivity dashboards, charts, and notification centers.

---

## 📋 Assessment Feature Coverage

| Requirement | Implementation & Technical Architecture | Status |
| --- | --- | --- |
| **Authentication & Sessions** | JWT session stored in secure HTTP-only cookies; bcrypt cost factor 12 password hashing | ✅ Complete |
| **Protected Frontend Routes** | Auth controller restores session on refresh and redirects unauthenticated users | ✅ Complete |
| **API Authorization & Tenant Isolation** | NestJS `JwtAuthGuard` + user-scoped repository queries on every protected resource | ✅ Complete |
| **Task CRUD Operations** | Create, search, filter by status/priority, edit, transition, priority tagging, cascading delete | ✅ Complete |
| **Natural Language Task Input** | Local deterministic refinement for title, description, and inferred priority | ✅ Complete |
| **Real-Time Time Tracking** | Server-authoritative start/stop timer, live second-by-second ticker, one active timer per user | ✅ Complete |
| **Time Logs & History** | Automatic & manual logs, interval correction, deletion, and transactional duration reconciliation | ✅ Complete |
| **Daily & Weekly Analytics** | Timezone-aware local day totals, status distribution, focus ratio, best day calculation | ✅ Complete |
| **Advanced Data Visualizations** | 7-day focus chart, 24h Circadian Rhythm Heatmap, Priority Donut, Pipeline Velocity chart | ✅ Complete |
| **Smart Reminders & Notifications** | In-app toasts with audio cues, popover notification drawer, browser desktop push notifications | ✅ Complete |
| **Mobile-First Responsive UI** | Adaptive 2x2 metric grid, mobile-scaled chart viewports, touch-friendly timers | ✅ Complete |
| **API Quality & Standards** | Versioned `/api/v1` REST routes, DTO validation with `class-validator`, consistent JSON envelopes, Swagger | ✅ Complete |
| **Cloud PostgreSQL Database** | PostgreSQL hosted on Aiven Cloud with SSL, Prisma ORM migrations, and connection pooling | ✅ Complete |

---

## 🌟 Key Highlights & Engineering Decisions

- **Cloud PostgreSQL Persistence (Aiven):** Built on managed PostgreSQL with SSL encryption (`sslmode=require`), enabling multi-replica scaling and reliable cloud deployments without local file-lock issues.
- **Concurrent Timer Protection:** PostgreSQL unique index on `ActiveTimer.userId` ensures users cannot accidentally run simultaneous timers across multiple tabs (returns a friendly `409 Conflict`).
- **Atomic Transactions:** Timer transitions, log deletions, and manual duration adjustments execute within Prisma database transactions, guaranteeing task duration aggregates are always 100% synchronized.
- **Timezone-Aware Calculations:** Daily and weekly analytics convert local midnight boundaries to UTC using client timezone offsets (`getTimezoneOffset()`), ensuring accuracy anywhere in the world.
- **Rich Analytics Suite:**
  - **Productivity Scorecard:** Focus ratio, daily average, and weekly targets.
  - **7-Day Trend Chart:** Visual bar breakdown with daily target indicators.
  - **Priority Distribution:** Proportional donut breakdown across High, Medium, and Low tasks.
  - **Circadian Rhythm Heatmap:** 24-hour focus density distribution.
  - **Task Velocity Pipeline:** Status distribution across Pending, In Progress, and Completed.
- **Smart Notification System:**
  - In-app notification drawer with unread counts and quick clearing.
  - Native browser desktop push alerts for due/overdue tasks and active timer milestones.
  - Audio cues and interactive floating toast alerts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router 7
- **Icons & Styling:** Lucide React, Modern CSS Design System, Responsive Breakpoints
- **Testing:** Vitest, Testing Library, `@testing-library/jest-dom`, jsdom (28 unit tests passing)

### Backend
- **Framework:** NestJS 11 + TypeScript
- **Database & ORM:** PostgreSQL (Aiven Cloud) + Prisma ORM 6
- **Authentication:** Passport JWT, HTTP-Only Cookies, bcryptjs
- **Validation:** `class-validator`, `class-transformer`
- **Security:** Helmet, Credentialed CORS, strict DTO whitelisting
- **Documentation:** Swagger / OpenAPI (`/docs`)
- **Testing:** Jest, `@nestjs/testing` (39 unit tests passing)

---

## 🏗️ Repository Architecture

```text
tempo/
├── frontend/
│   ├── public/                 Favicon, audio cues, and web manifest
│   ├── src/
│   │   ├── components/         Task cards, timers, reminder drawer, analytics charts
│   │   │   ├── analytics/      7-day focus chart and insights
│   │   │   ├── reminders/      Smart reminder drawer and notifications
│   │   │   └── summary/        Scorecard, Donut, Heatmap, Velocity cards
│   │   ├── controllers/        State hooks and authenticated workspace state
│   │   ├── models/             Frontend TypeScript domain contracts
│   │   ├── services/           Typed Axios/fetch API adapters
│   │   ├── styles/             Design system, themes, bonus features, mobile CSS
│   │   └── views/              Auth, Workspace, and Analytics screens
│   └── package.json
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       User, Task, TimeLog, ActiveTimer schemas
│   │   ├── migrations/         Prisma PostgreSQL migration history
│   │   └── seed.ts             Demo reviewer account and 7-day rich dataset
│   ├── src/
│   │   ├── common/             Guards, decorators, filters, interceptors, DTOs
│   │   ├── modules/
│   │   │   ├── auth/           JWT strategy, login, signup, session cookies
│   │   │   ├── tasks/          Task CRUD, filtering, natural-language enhancer
│   │   │   ├── time-logs/      Timer start/stop, manual logs, reconciliation
│   │   │   └── analytics/      Daily and weekly aggregation endpoints
│   │   └── prisma/             PrismaService database lifecycle provider
│   └── package.json
└── package.json                Root scripts for monorepo convenience
```

---

## 💻 Local Setup & Getting Started

### Prerequisites
- **Node.js:** 20.x or newer
- **npm:** 10.x or newer
- **PostgreSQL:** Cloud instance (e.g. Aiven) or local PostgreSQL server

### 1. Install Dependencies

From the repository root:
```bash
npm run install:all
```

### 2. Configure Environment Variables

Create `backend/.env` with your PostgreSQL connection URL:

```env
DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<dbname>?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
FRONTEND_URL="http://localhost:5173"
PORT=3000
DEMO_USER_EMAIL="reviewer@tempo.app"
DEMO_USER_PASSWORD="Review123!"
```

*(Optional)* Create `frontend/.env.local` if custom API URL is needed:
```env
VITE_API_URL="http://localhost:3000/api/v1"
```

### 3. Initialize Prisma & Seed PostgreSQL

```bash
# Generate Prisma Client
npm run db:generate

# Run PostgreSQL Migrations
npm run db:migrate

# Seed Demo Data (Reviewer Account & 7-Day Workspace)
npm run db:seed
```

### 4. Start the Development Servers

In terminal one (API server):
```bash
npm run dev:backend
```

In terminal two (Frontend client):
```bash
npm run dev:frontend
```

Open **<http://localhost:5173>** in your browser and log in with:
- **Email:** `reviewer@tempo.app`
- **Password:** `Review123!`

---

## 🔒 Environment Variables Reference

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection URI | `postgres://user:pass@host:27142/defaultdb?sslmode=require` |
| `JWT_SECRET` | **Yes** | Secret key for signing 7-day session JWTs | `tempo-jwt-production-secret-key-32-chars` |
| `FRONTEND_URL` | **Yes** | Allowed CORS origin for credentials | `http://localhost:5173` or `https://tempo.app` |
| `PORT` | No | API listen port (defaults to `3000`) | `3000` |
| `DEMO_USER_EMAIL` | No | Seed script reviewer email | `reviewer@tempo.app` |
| `DEMO_USER_PASSWORD` | No | Seed script reviewer password | `Review123!` |
| `VITE_API_URL` | No | Frontend API base URL | `http://localhost:3000/api/v1` |

---

## 📡 REST API Documentation

All application endpoints are versioned under `/api/v1`. Interactive Swagger documentation is available at **`/docs`**.

### Core Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /auth/signup` — Create account and establish HTTP-only session cookie.
- `POST /auth/login` — Authenticate credentials and issue session cookie.
- `POST /auth/logout` — Invalidate and clear session cookie.
- `GET /auth/me` — Retrieve current authenticated profile.

#### Tasks & Schedules (`/api/v1/tasks`)
- `GET /tasks` — List tasks with search, status, and priority filters.
- `POST /tasks` — Create a new task with optional due date and reminder.
- `POST /tasks/enhance` — Natural-language task title and priority refinement.
- `GET /tasks/reminders/upcoming` — Fetch upcoming reminders within a time window.
- `GET /tasks/:id` — Get single task details with associated time logs.
- `PATCH /tasks/:id` — Update task details or mark complete/reopen.
- `DELETE /tasks/:id` — Delete task and cascade delete its time logs.

#### Time Tracking & Logs (`/api/v1/timelogs`)
- `GET /timelogs` — Fetch historical time logs.
- `GET /timelogs/active` — Fetch current running timer (if active).
- `POST /timelogs/start` — Start a live task timer (enforces 1 active timer).
- `POST /timelogs/stop` — Atomically stop timer and record duration log.
- `POST /timelogs/manual` — Add manual time log entry.
- `PATCH /timelogs/:id` — Correct time log intervals and reconcile task aggregates.
- `DELETE /timelogs/:id` — Delete time log and update task duration total.

#### Analytics (`/api/v1/analytics`)
- `GET /analytics/daily-summary` — Day focus total, status counts, and per-task duration.
- `GET /analytics/weekly-summary` — 7-day focus series, weekly totals, best day, and insights.

---

## 🧪 Testing & Verification

Run the full automated test and quality suite:

```bash
# Type check TypeScript across frontend & backend
npm run typecheck

# Run ESLint (0 errors)
npm run lint

# Run all unit tests (NestJS Jest + React Vitest)
npm test

# Build production bundles
npm run build
```

### Test Suite Summary:
- **Backend (Jest):** 8 test suites, **39/39 tests passed (100%)**
- **Frontend (Vitest):** 6 test files, **28/28 tests passed (100%)**
- **Linting:** 0 errors, clean code architecture.

---

## 🚀 Production Deployment

Because Tempo uses cloud-hosted **PostgreSQL (Aiven)**, deployment is completely stateless:

1. **Deploy Backend (NestJS):** Deploy to Render, Railway, Fly.io, or AWS ECS.
   - Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`).
   - Run build step: `npm run build --prefix backend`.
   - Run migration step: `npm run prisma:deploy --prefix backend`.
   - Start command: `npm run start:prod --prefix backend`.

2. **Deploy Frontend (React):** Deploy to Vercel, Netlify, Cloudflare Pages, or AWS S3/CloudFront.
   - Set build environment variable: `VITE_API_URL=https://your-backend-domain.com/api/v1`.
   - Build command: `npm run build --prefix frontend`.
   - Output directory: `frontend/dist`.

---

## 📄 License

Created for technical assessment and portfolio review.

# 🎓 Centralized Student Portfolio Management & Discovery Platform

A full-stack web application for managing, showcasing, and discovering student portfolios — built with **React + Vite**, **Node.js + Express**, **PostgreSQL + Prisma**, and **JWT-based RBAC**.

---

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **Public Visitor** | Browse portfolios, search/filter students, view featured projects, explore departments without logging in |
| **Student** | Dashboard, edit all portfolio sections, upload supporting evidence/certificates, track verification status, resubmit corrected documents |
| **Staff (Class In-charge / Tutor)** | Dedicated staff dashboard, inspect assigned students' academic evidence, verification queue (Approve, Reject with mandatory reason, Request Resubmission), maintain audit trail |
| **Admin** | Create & manage student/staff accounts, credential initialization & password resets, assign departments/batches, monitor centralized verification logs & audit reports (without routine document approvals) |

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM v7, Axios, React Hook Form
- **Backend:** Node.js, Express.js, Prisma ORM, Zod validation
- **Database:** PostgreSQL (via embedded-postgres — no installation needed!)
- **Auth:** JWT, bcryptjs, role-based access control
- **Uploads:** Multer (images: JPG/PNG/WebP ≤2 MB; documents: PDF ≤5 MB)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js ≥ 18** — [Download here](https://nodejs.org/)
- No PostgreSQL installation required — uses embedded PostgreSQL automatically

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install --legacy-peer-deps
```

### 2. Environment Setup

The server `.env` is pre-configured for development. Verify `server/.env` exists:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_portfolio"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

### 3. Start the Application

#### Option A — Automated (Windows)

```bash
# From the project root (d:\MCA-SEMESTER-1-WAD)
.\start-dev.bat
```

This opens two terminal windows: one for the backend, one for the frontend.

#### Option B — Manual (two terminals)

**Terminal 1 — Backend:**
```bash
cd server
npm start
```
> The server auto-starts embedded PostgreSQL on port 5432, then starts Express on port 5000.

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 4. Seed the Database

On first run (or after resetting), seed sample data:

```bash
cd server
node prisma/seed.js
```

### 5. Open the App

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Main application |
| http://localhost:5173/login | Login page |
| http://localhost:5000/api/health | API health check |

---

## 🔐 Demo Login Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@college.edu` | `AdminPassword@123` | Institutional Control & Monitoring |
| **Staff (MCA In-charge)** | `staff.mca@college.edu` | `StaffPassword@123` | Prof. Rajesh Kumar — MCA Class In-charge / Tutor |
| **Staff (CSE Tutor)** | `staff.cse@college.edu` | `StaffPassword@123` | Dr. Meenakshi Sundaram — CSE Tutor |
| **Student** | `keerthana.ar@college.edu` | `Student@123` | MCA 2026 — verified certs, resubmission tracking |
| **Student** | `rahul.sharma@college.edu` | `Student@123` | CSE — ML/AI projects, pending submissions |
| **Student** | `ananya.patel@alumni.college.edu` | `Student@123` | IT — Alumni status |
| **Student** | `pooja.verma@college.edu` | `Student@123` | MCA — pending moderation items |
| **Student** ❌ | `aditya.nair@college.edu` | `Student@123` | ECE — **SUSPENDED** (cannot login) |

> **Note:** Accounts must be created by an admin. Open registration is disabled by design.

---

## 📂 Project Structure

```
d:\MCA-SEMESTER-1-WAD\
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Layouts, common components
│   │   ├── context/         # AuthContext
│   │   └── pages/           # All page components
│   │       ├── admin/       # Admin dashboard pages
│   │       ├── staff/       # Staff verification & assigned student pages
│   │       └── student/     # Student dashboard pages
│   └── vite.config.js
│
└── server/                  # Node.js + Express backend
    ├── controllers/         # Route handlers
    ├── middleware/           # Auth, upload, error handling
    ├── prisma/              # Schema, client, seed
    ├── routes/              # Express routers
    ├── scripts/             # pg-start.js (embedded PG)
    ├── uploads/             # File storage (images, documents, csv)
    ├── utils/               # Helpers (slug, audit, completion)
    └── server.js            # Entry point
```

---

## 🌐 Routes

### Public Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, search, featured projects & students |
| `/search` | Search & filter student portfolios |
| `/departments` | Browse departments |
| `/projects` | Featured projects |
| `/student/:username` | Public student portfolio |
| `/login` | Login |
| `/forgot-password` | Password recovery |
| `/privacy` | Privacy policy |

### Student Dashboard (requires login)

| Path | Description |
|------|-------------|
| `/dashboard` | Overview & stats |
| `/dashboard/profile` | Edit profile & photo |
| `/dashboard/education` | Education history |
| `/dashboard/skills` | Skills & interests |
| `/dashboard/projects` | Projects |
| `/dashboard/certifications` | Certifications |
| `/dashboard/experience` | Work experience |
| `/dashboard/achievements` | Achievements |
| `/dashboard/extracurriculars` | Extracurricular activities |
| `/dashboard/links` | Social & professional links |
| `/dashboard/settings` | Password, visibility, publish |

### Admin Dashboard (requires admin login)

| Path | Description |
|------|-------------|
| `/admin` | Overview & KPIs |
| `/admin/students` | Manage student accounts |
| `/admin/students/add` | Add student / CSV import |
| `/admin/moderation` | Review certifications & achievements |
| `/admin/projects` | Feature/unfeature projects |
| `/admin/departments` | Manage departments & batches |
| `/admin/reports` | Analytics & reports |
| `/admin/audit-log` | Audit trail |

---

## 🧪 Running Tests

```bash
cd server
npm test
```

Tests cover: login, role restrictions, privacy, search, CRUD persistence, audit logging, and more (11 tests).

---

## 🎨 Color Theme

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Indigo | `#3730A3` | Navigation, buttons, headings |
| Accent Teal | `#0D9488` | Skills, tags, secondary actions |
| Highlight Amber | `#F59E0B` | Featured, achievements, alumni |
| Text Primary | `#0F172A` | Main body text |
| Text Secondary | `#475569` | Muted/secondary text |
| Background | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Cards & panels |
| Border | `#E2E8F0` | Dividers & borders |

---

## 📦 API Overview

All endpoints are prefixed with `/api`.

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, logout, password reset |
| `/api/public` | Search, portfolio, featured content |
| `/api/students` | Student dashboard (authenticated) |
| `/api/admin` | Admin management (admin only) |
| `/api/upload` | File uploads (authenticated) |

---

## 🔒 Security Features

- Bcrypt password hashing (rounds=12)
- JWT access tokens (7-day expiry)
- Rate limiting (20 auth/15min; 300 API/15min)
- Helmet security headers
- CORS configured to allowed origins
- Server-side Zod validation on all inputs
- File type & size validation (Multer)
- Role-based middleware on all protected routes
- Ownership checks — students cannot access other students' data
- Private fields (DOB) never exposed in public API responses
- Audit logging for all admin actions

---

## 🔄 Data Persistence

All data is stored in PostgreSQL via Prisma ORM. Changes made in the student dashboard are immediately reflected on the public portfolio. Data persists across:
- Browser close / logout
- Backend restarts
- Login from other devices

**localStorage is never used as the source of truth.**

---

## 📸 File Uploads

| Type | Formats | Max Size |
|------|---------|----------|
| Profile photo | JPG, PNG, WebP | 2 MB |
| Project screenshots | JPG, PNG, WebP | 2 MB |
| Certificate documents | PDF, JPG, PNG | 5 MB |

Files stored in `server/uploads/` with safe filenames generated server-side.

---

## 🗄 Database Management

```bash
# View/edit data visually
cd server
npx prisma studio

# Reset and re-seed database
npx prisma db push --force-reset
node prisma/seed.js

# Generate Prisma client after schema changes
npx prisma generate
```

---

## 📝 Development Notes

- Embedded PostgreSQL auto-starts when `npm start` is run — no manual setup required
- The `.pgdata/` directory holds the embedded database files
- Uploads are stored locally in `server/uploads/` — configure Cloudinary/S3 for production
- In development, the Vite dev server proxies all `/api` and `/uploads` requests to `http://localhost:5000`

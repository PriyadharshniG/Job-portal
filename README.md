# 🌐 VGLUG Foundation — Internal Job Portal

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> A full-stack internal job portal built exclusively for **VGLUG Foundation** members.  
> Only verified members with a valid **Foundation ID** can register, apply for jobs, and recruit.

---

## ✨ Features

### 🔐 Authentication & Access
- **Foundation ID–based Authentication** — Only VGLUG members can register
- **Role-Based Access** — Member (Student), Recruiter, and Admin roles
- **Auto-seeded Admin** — Admin account is created on first startup automatically

### 👤 Student / Member Portal
- 📝 **Resume Upload** — Upload PDF/DOCX resumes with AI-powered skill extraction
- 🧠 **AI Skill Extraction** — Automatically detects 60+ tech skills from resume text
- 🛠️ **Skills Manager** — Manually add, edit, and remove skills
- 🐙 **GitHub Integration** — Connect GitHub profile, auto-fetch repos & languages
- 🏅 **Certifications** — Upload and manage certifications (PDF/image)
- 🚀 **Projects** — Add project links with tech stack and descriptions
- 📋 **Student Profile** — Full portfolio-style profile visible to recruiters
- ✏️ **Edit Profile** — Update bio, education, experience, location, phone

### 🏢 Recruiter Portal
- 📌 **Post Jobs** — Create detailed job listings with skills, location, salary
- ✏️ **Edit / Delete Jobs** — Full job lifecycle management
- 🔍 **Candidate Search** — Search members by skill, name, or Foundation ID
- 👁️ **View Candidate Profile** — Full read-only student profile view
- 🤖 **AI Screening Questions** — Generate position-aware interview questions
  - Supports 15+ skill categories (Python, React, ML, DevOps, etc.)
  - 3 difficulty levels: Easy, Medium, Hard
  - Behavioral + Technical question mix
- 📊 **Manage Applicants** — Approve / Decline / Reject candidates per job
- 📥 **CSV Export** — Export applications to Excel-compatible CSV
- 🏷️ **Recruiter Profile** — Update company name, designation, website

### 🛡️ Admin Dashboard
- 👥 **User Management** — View all users, change roles, delete accounts
- 📊 **Application Stats** — Track pending, accepted, rejected counts
- 🆔 **Foundation ID Management** — Add / list valid Foundation IDs
- 🗑️ **Application Management** — Delete or reject any application

---

## 🗂️ Project Structure

```
VGLUG-JOB-PORTAL/
├── code_quester/
│   ├── backend/                  # FastAPI Python backend
│   │   ├── routers/
│   │   │   ├── auth.py           # Registration & Login
│   │   │   ├── admin.py          # Admin controls
│   │   │   ├── applications.py   # Job applications
│   │   │   ├── jobs.py           # Job CRUD
│   │   │   ├── users.py          # User profile (basic)
│   │   │   ├── student.py        # Student features (resume, skills, GitHub, certs, projects)
│   │   │   └── recruiter.py      # Recruiter features (candidate search, AI questions, CSV export)
│   │   ├── main.py               # App entry point + CORS + startup seed
│   │   ├── database.py           # MongoDB connection
│   │   ├── auth_utils.py         # JWT helpers + role guards
│   │   ├── seed.py               # DB seeder
│   │   ├── requirements.txt      # Python dependencies
│   │   ├── uploads/
│   │   │   ├── resumes/          # Uploaded student resumes
│   │   │   └── certifications/   # Uploaded certification files
│   │   └── .env                  # Environment variables
│   │
│   └── frontend/                 # React + Vite frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Landing.jsx         # Home / landing page
│       │   │   ├── Login.jsx           # Login page
│       │   │   ├── Register.jsx        # Registration page
│       │   │   ├── Profile.jsx         # User profile view
│       │   │   ├── EditProfile.jsx     # Edit profile page
│       │   │   ├── StudentProfile.jsx  # Full student portfolio (recruiter view)
│       │   │   ├── SkillsManager.jsx   # Manage skills
│       │   │   ├── GitHubConnect.jsx   # Connect GitHub account
│       │   │   ├── Certifications.jsx  # Manage certifications
│       │   │   ├── Projects.jsx        # Manage project links
│       │   │   ├── AddJob.jsx          # Post a new job (recruiter)
│       │   │   ├── EditJob.jsx         # Edit an existing job
│       │   │   ├── ManageJobs.jsx      # Job management list
│       │   │   ├── ManageUsers.jsx     # Admin user management
│       │   │   ├── CandidateSearch.jsx # Search candidates by skill (recruiter)
│       │   │   ├── ScreeningQuestions.jsx # AI interview question generator
│       │   │   ├── Stats.jsx           # Application stats dashboard
│       │   │   ├── Job.jsx             # Single job detail view
│       │   │   └── Admin.jsx           # Admin dashboard
│       │   ├── components/       # Reusable UI components
│       │   ├── context/          # Global state (UserContext, JobContext)
│       │   ├── Layout/           # Dashboard layout with collapsible sidebar
│       │   ├── Router/           # App routing
│       │   ├── utils/            # Nav link data & helpers
│       │   └── assets/           # CSS, media, wrappers
│       ├── vercel.json           # Vercel deployment config
│       └── package.json
└── run_backend.bat               # One-click backend launcher (Windows)
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (Atlas or Local)

---

### Step 1 — MongoDB Setup

**Option A: MongoDB Atlas (Recommended — Free Cloud)**

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Connect → Drivers → Python**
4. Copy your connection string
5. Open `backend/.env` and set:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vglug_portal
   SECRET_KEY=your_jwt_secret_key_here
   ```

**Option B: MongoDB Local**

- Download from: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Start the MongoDB service
- Use: `MONGO_URI=mongodb://localhost:27017/vglug_portal`

---

### Step 2 — Backend Setup

```bash
cd code_quester/backend
pip install -r requirements.txt
```

---

### Step 3 — Start Backend Server

```bash
cd code_quester/backend
python -m uvicorn main:app --reload --port 8000
```

> ✅ On first startup, the server **auto-seeds** the Admin account automatically.

Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

---

### Step 4 — Frontend Setup & Start

```bash
cd code_quester/frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Default Credentials

| Role      | Foundation ID | Password    | Email               |
|-----------|--------------|-------------|---------------------|
| **Admin** | `VGLUG-3945` | `Krish3945` | admin@vglug.org     |

> 💡 Admin account is **auto-created** every time the backend starts. No manual setup needed.

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint                    | Access | Description                 |
|--------|-----------------------------|--------|-----------------------------|
| POST   | `/api/v1/auth/register`     | Public | Register with Foundation ID |
| POST   | `/api/v1/auth/login`        | Public | Login & get JWT token       |
| POST   | `/api/v1/auth/logout`       | Auth   | Logout current user         |
| GET    | `/api/v1/auth/me`           | Auth   | Get current user profile    |

### Jobs

| Method | Endpoint                    | Access    | Description                  |
|--------|-----------------------------|-----------|------------------------------|
| GET    | `/api/v1/jobs/all`          | Auth      | Get all jobs (search/filter) |
| POST   | `/api/v1/jobs/post`         | Recruiter | Post a new job               |
| GET    | `/api/v1/jobs/{id}`         | Auth      | Get job by ID                |
| PATCH  | `/api/v1/jobs/{id}`         | Recruiter | Edit a job                   |
| DELETE | `/api/v1/jobs/{id}`         | Recruiter | Delete a job                 |

### Applications

| Method | Endpoint                          | Access    | Description              |
|--------|-----------------------------------|-----------|--------------------------|
| POST   | `/api/v1/applications/apply`      | Auth      | Apply for a job          |
| GET    | `/api/v1/applications/my`         | Auth      | View my applications     |
| GET    | `/api/v1/applications/job/{id}`   | Recruiter | View applicants for job  |
| PATCH  | `/api/v1/applications/{id}`       | Recruiter | Approve / Decline        |
| DELETE | `/api/v1/applications/{id}`       | Admin     | Delete an application    |

### Admin

| Method | Endpoint                         | Access | Description              |
|--------|----------------------------------|--------|--------------------------|
| GET    | `/api/v1/admin/stats`            | Admin  | Dashboard statistics     |
| GET    | `/api/v1/admin/users`            | Admin  | List all users           |
| PUT    | `/api/v1/admin/role`             | Admin  | Change user role         |
| DELETE | `/api/v1/admin/user/{id}`        | Admin  | Delete a user            |
| GET    | `/api/v1/admin/foundation-ids`   | Admin  | List all Foundation IDs  |
| POST   | `/api/v1/admin/foundation-id`    | Admin  | Add a new Foundation ID  |

### Student

| Method | Endpoint                                  | Access | Description                        |
|--------|-------------------------------------------|--------|------------------------------------|
| POST   | `/api/v1/student/resume/upload`           | Auth   | Upload PDF/DOCX resume             |
| GET    | `/api/v1/student/resume/file/{filename}`  | Auth   | Download/view resume file          |
| PUT    | `/api/v1/student/skills`                  | Auth   | Replace entire skills list         |
| POST   | `/api/v1/student/skills/add`              | Auth   | Add a single skill                 |
| DELETE | `/api/v1/student/skills/{skill_name}`     | Auth   | Remove a skill                     |
| POST   | `/api/v1/student/github/connect`          | Auth   | Connect GitHub & fetch repos       |
| GET    | `/api/v1/student/github/repos`            | Auth   | Get cached GitHub repos            |
| DELETE | `/api/v1/student/github/disconnect`       | Auth   | Disconnect GitHub                  |
| POST   | `/api/v1/student/certifications/upload`   | Auth   | Upload certification file          |
| GET    | `/api/v1/student/certifications/file/{f}` | Auth   | Serve certification file           |
| DELETE | `/api/v1/student/certifications/{id}`     | Auth   | Remove a certification             |
| POST   | `/api/v1/student/projects/add`            | Auth   | Add a project link                 |
| DELETE | `/api/v1/student/projects/{id}`           | Auth   | Remove a project                   |
| GET    | `/api/v1/student/profile`                 | Auth   | Get full student profile           |
| PUT    | `/api/v1/student/profile/update`          | Auth   | Update student profile fields      |

### Recruiter

| Method | Endpoint                              | Access    | Description                          |
|--------|---------------------------------------|-----------|--------------------------------------|
| GET    | `/api/v1/recruiter/candidates/search` | Recruiter | Search candidates by skill/name/ID   |
| GET    | `/api/v1/recruiter/candidates/{id}`   | Recruiter | Get full candidate profile           |
| POST   | `/api/v1/recruiter/screening-questions` | Recruiter | Generate AI interview questions    |
| GET    | `/api/v1/recruiter/applications/export`  | Recruiter | Export applications as CSV        |
| PUT    | `/api/v1/recruiter/profile/update`    | Recruiter | Update recruiter & company profile   |

---

## 🔐 Role-Based Access Control

| Action                        | Admin | Recruiter | Member |
|-------------------------------|:-----:|:---------:|:------:|
| Register / Login              | ✅    | ✅        | ✅     |
| Browse Jobs                   | ✅    | ✅        | ✅     |
| Apply for Job                 | ✅    | ✅        | ✅     |
| Upload Resume + AI Skills     | ✅    | ❌        | ✅     |
| Manage Skills                 | ✅    | ❌        | ✅     |
| Connect GitHub                | ✅    | ❌        | ✅     |
| Add Certifications            | ✅    | ❌        | ✅     |
| Add Projects                  | ✅    | ❌        | ✅     |
| Post a Job                    | ✅    | ✅        | ❌     |
| Edit / Delete Job             | ✅    | ✅ (own)  | ❌     |
| Manage Applicants             | ✅    | ✅ (own)  | ❌     |
| Search Candidates             | ✅    | ✅        | ❌     |
| Generate AI Questions         | ✅    | ✅        | ❌     |
| Export Applications CSV       | ✅    | ✅        | ❌     |
| Update Recruiter Profile      | ✅    | ✅        | ❌     |
| View All Users                | ✅    | ❌        | ❌     |
| Change User Roles             | ✅    | ❌        | ❌     |
| Delete Users                  | ✅    | ❌        | ❌     |
| Add Foundation IDs            | ✅    | ❌        | ❌     |
| View Dashboard Stats          | ✅    | ❌        | ❌     |

---

## 📦 Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| **Frontend** | React 18 + Vite + Styled Components + TanStack Query    |
| **Backend**  | Python 3 + FastAPI + Uvicorn                            |
| **Database** | MongoDB (Atlas or Local) via PyMongo                    |
| **Auth**     | JWT (python-jose) + bcrypt password hashing             |
| **State**    | React Context API + TanStack Query                      |
| **Styling**  | Vanilla CSS + CSS Variables + Inter & Poppins           |
| **File I/O** | pypdf + python-docx (resume parsing), httpx (GitHub API)|

---

## 🤖 AI Features

### Resume Skill Extraction
Upload a PDF or DOCX resume — the backend extracts text and detects **60+ tech skills** automatically using keyword matching with word-boundary regex (e.g., won't match "c" inside "science").

### AI Screening Question Generator
Generates tailored interview questions based on:
- **Job position title** → infers relevant skill categories
- **Candidate skills** → picks skill-specific technical questions  
- **Difficulty level** → Easy / Medium / Hard question pools
- **Behavioral questions** → always included for soft-skill assessment

Supports 15+ skill banks: Python, JavaScript, React, Node, MongoDB, MySQL, Java, Machine Learning, Docker, AWS, Django, FastAPI, Git, Linux, TypeScript, and more.

---

## 🚀 Quick Start (Windows)

Double-click **`run_backend.bat`** to start the backend instantly, then:

```bash
cd code_quester/frontend
npm run dev
```

---

## 👨‍💻 Built By

**VGLUG Foundation** — Internal Tools Team  
> Crafted with ❤️ for the VGLUG community

---

*For issues or contributions, contact the Foundation admin at **admin@vglug.org***

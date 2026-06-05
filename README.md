# 🌐 VGLUG Foundation — Internal Job Portal

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-4.4.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

> A full-stack internal job portal built exclusively for **VGLUG Foundation** members.  
> Only verified members with a valid **Foundation ID** can register, apply for jobs, and recruit.

---

## ✨ Features

### 🔐 Authentication & Access
- **Foundation ID–based Authentication** — Only VGLUG members can register
- **Role-Based Access** — Member (Student), Recruiter, and Admin roles
- **Auto-seeded Admin** — Admin account is created and verified on backend startup
- **Reset Password** — Foundation ID + email verification supported

### 👤 Student / Member Portal
- 📝 **Resume Upload** — Upload PDF or DOCX resumes
- 🧠 **AI Skill Extraction** — Resume text is parsed and tech skills are extracted automatically
- 🛠️ **Skills Manager** — Replace, add, and remove skills manually
- 🐙 **GitHub Integration** — Connect GitHub username, fetch repos and languages
- 🏅 **Certifications** — Upload and manage PDF/image certificates
- 🚀 **Projects** — Add project links with tech stack and description
- 📋 **Student Profile** — Full portfolio-style student profile
- ✏️ **Edit Profile** — Update bio, education, experience, location, phone

### 🏢 Recruiter Portal
- 📌 **Post Jobs** — Create jobs with company, salary, location, skills, and more
- ✏️ **Edit / Delete Jobs** — Manage posted roles with full control
- 🔍 **Candidate Search** — Search by skill, name, or Foundation ID
- 👁️ **View Candidate Profile** — See full candidate details
- 🤖 **AI Screening Questions** — Generate role-aware interview questions
  - Supports position inference and skill-based question banks
  - Difficulty levels: easy, medium, hard
  - Includes behavioral and technical questions
- 📊 **Manage Applicants** — Approve, decline, shortlist, or accept candidates
- 📥 **CSV Export** — Export application data to CSV
- 🏷️ **Recruiter Profile** — Update company name, designation, website, and bio

### 🛡️ Admin Dashboard
- 👥 **User Management** — List users, change roles, delete accounts
- 📊 **Application Stats** — Dashboard counts for applications and jobs
- 🆔 **Foundation ID Management** — Add, list, and remove valid Foundation IDs
- 🗑️ **Application & Job Management** — Delete any application or job

---

## 🗂️ Project Structure

```
VGLUG-JOB-PORTAL/
├── code_quester/
│   ├── backend/                  # FastAPI Python backend
│   │   ├── routers/
│   │   │   ├── auth.py           # Registration, login, reset password, logout
│   │   │   ├── admin.py          # Admin controls and approval flows
│   │   │   ├── applications.py   # Job applications and resume helper
│   │   │   ├── jobs.py           # Job CRUD and smart match
│   │   │   ├── users.py          # User profile helpers
│   │   │   ├── student.py        # Student resume, skills, GitHub, certs, projects
│   │   │   └── recruiter.py      # Candidate search, screening questions, CSV export
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

Backend runs at: **https://job-portal-jk38.onrender.com**  
API Docs (Swagger): **https://job-portal-jk38.onrender.com/docs**

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

| Method | Endpoint                    | Access | Description                        |
|--------|-----------------------------|--------|------------------------------------|
| POST   | `/api/v1/auth/register`     | Public | Register with Foundation ID        |
| POST   | `/api/v1/auth/login`        | Public | Login & get JWT token              |
| POST   | `/api/v1/auth/logout`       | Auth   | Logout current user                |
| GET    | `/api/v1/auth/me`           | Auth   | Get current user profile           |
| POST   | `/api/v1/auth/reset-password` | Public | Reset password with Foundation ID  |

### Jobs

| Method | Endpoint                    | Access    | Description                              |
|--------|-----------------------------|-----------|------------------------------------------|
| GET    | `/api/v1/jobs/all`          | Public    | Browse all jobs with search/filter       |
| GET    | `/api/v1/jobs/{job_id}`     | Public    | View a single job                        |
| GET    | `/api/v1/jobs/my/posted`    | Recruiter/Admin | View jobs posted by current recruiter |
| GET    | `/api/v1/jobs/match/smart`  | Auth      | Smart match jobs to user skills         |
| POST   | `/api/v1/jobs/post`         | Recruiter/Admin | Post a new job                      |
| PUT    | `/api/v1/jobs/{job_id}`     | Recruiter/Admin | Update a job                       |
| DELETE | `/api/v1/jobs/{job_id}`     | Recruiter/Admin | Delete a job                       |

### Applications

| Method | Endpoint                                  | Access    | Description                                |
|--------|-------------------------------------------|-----------|--------------------------------------------|
| POST   | `/api/v1/applications/upload-resume`      | Auth      | Upload resume PDF for application          |
| GET    | `/api/v1/applications/resume/{filename}`  | Auth      | Download or view uploaded resume           |
| POST   | `/api/v1/applications/apply`              | Auth      | Apply for a job                            |
| GET    | `/api/v1/applications/my`                 | Auth      | View current user applications             |
| GET    | `/api/v1/applications/all`                | Admin     | View all applications                      |
| GET    | `/api/v1/applications/recruiter-jobs`     | Recruiter/Admin | View applications for jobs you posted |
| GET    | `/api/v1/applications/job/{job_id}`       | Recruiter/Admin | View applicants for a specific job   |
| PUT    | `/api/v1/applications/status`             | Recruiter/Admin | Update application status            |
| DELETE | `/api/v1/applications/{app_id}`           | Admin     | Delete an application                      |

### Admin

| Method | Endpoint                               | Access | Description                                  |
|--------|----------------------------------------|--------|----------------------------------------------|
| POST   | `/api/v1/admin/create-recruiter`        | Admin  | Create a recruiter account                    |
| GET    | `/api/v1/admin/stats`                  | Admin  | Dashboard metrics                             |
| GET    | `/api/v1/admin/users`                  | Admin  | List all users                                |
| GET    | `/api/v1/admin/pending`                | Admin  | List pending approval users                   |
| POST   | `/api/v1/admin/approve`                | Admin  | Approve or reject pending users               |
| PUT    | `/api/v1/admin/role`                   | Admin  | Change user role                              |
| POST   | `/api/v1/admin/foundation-id`          | Admin  | Add a verified Foundation ID                  |
| GET    | `/api/v1/admin/foundation-ids`         | Admin  | List verified Foundation IDs                  |
| DELETE | `/api/v1/admin/foundation-id/{fid}`    | Admin  | Remove a Foundation ID                        |
| GET    | `/api/v1/admin/jobs`                   | Admin  | View all jobs                                 |
| DELETE | `/api/v1/admin/jobs/{job_id}`          | Admin  | Delete any job                                |
| DELETE | `/api/v1/admin/users/{user_id}`        | Admin  | Delete a user account                         |

### Users

| Method | Endpoint                           | Access          | Description                                |
|--------|------------------------------------|-----------------|--------------------------------------------|
| GET    | `/api/v1/users/all`                | Admin           | List all user accounts                      |
| GET    | `/api/v1/users/{user_id}`          | Auth            | Get a single user profile                   |
| PUT    | `/api/v1/users/update/{user_id}`   | Auth / Admin    | Update profile fields                       |
| DELETE | `/api/v1/users/delete/{user_id}`   | Admin           | Delete a user account                       |

### Student

| Method | Endpoint                                  | Access | Description                              |
|--------|-------------------------------------------|--------|------------------------------------------|
| POST   | `/api/v1/student/resume/upload`           | Auth   | Upload resume (PDF/DOCX) with AI skills   |
| GET    | `/api/v1/student/resume/file/{filename}`  | Auth   | Download/view uploaded resume             |
| PUT    | `/api/v1/student/skills`                  | Auth   | Replace the full skills list              |
| POST   | `/api/v1/student/skills/add`              | Auth   | Add one skill                             |
| DELETE | `/api/v1/student/skills/{skill_name}`     | Auth   | Remove a skill                            |
| POST   | `/api/v1/student/github/connect`          | Auth   | Connect GitHub account                    |
| GET    | `/api/v1/student/github/repos`            | Auth   | Fetch connected GitHub repos              |
| DELETE | `/api/v1/student/github/disconnect`       | Auth   | Disconnect GitHub                         |
| POST   | `/api/v1/student/certifications/upload`   | Auth   | Upload a certification file               |
| GET    | `/api/v1/student/certifications/file/{filename}` | Auth | Download certification file      |
| DELETE | `/api/v1/student/certifications/{cert_id}`| Auth   | Remove a certification                    |
| POST   | `/api/v1/student/projects/add`            | Auth   | Add a project link                        |
| DELETE | `/api/v1/student/projects/{project_id}`   | Auth   | Remove a project                          |
| GET    | `/api/v1/student/profile`                 | Auth   | Get student profile                       |
| PUT    | `/api/v1/student/profile/update`          | Auth   | Update profile fields                     |

### Recruiter

| Method | Endpoint                                 | Access    | Description                                  |
|--------|------------------------------------------|-----------|----------------------------------------------|
| GET    | `/api/v1/recruiter/candidates/search`    | Recruiter | Search candidates by skill, name, or ID      |
| GET    | `/api/v1/recruiter/candidates/{user_id}` | Recruiter | View a candidate profile                     |
| POST   | `/api/v1/recruiter/screening-questions`  | Recruiter | Generate AI screening questions              |
| GET    | `/api/v1/recruiter/applications/export`  | Recruiter | Export applications to CSV                   |
| PUT    | `/api/v1/recruiter/profile/update`       | Recruiter | Update recruiter profile                     |

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

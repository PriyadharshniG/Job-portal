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

- 🔐 **Foundation ID–based Authentication** — Only VGLUG members can register
- 👤 **Role-Based Access** — Member, Recruiter, and Admin roles
- 📋 **Job Listings** — Browse, search, and filter all available jobs
- 📝 **Job Applications** — Apply with resume upload support
- 🏢 **Recruiter Panel** — Post jobs, manage applicants, approve/decline candidates
- 🛡️ **Admin Dashboard** — User management, role assignment, stats overview
- 📊 **Application Stats** — Track pending, accepted, rejected counts
- ⚡ **Auto-seeded Admin** — Admin account is created on first startup automatically

---

## 🗂️ Project Structure

```
VGLUG-JOB-PORTAL/
├── code_quester/
│   ├── backend/                # FastAPI Python backend
│   │   ├── routers/            # API route handlers
│   │   │   ├── auth.py         # Registration & Login
│   │   │   ├── jobs.py         # Job CRUD & search
│   │   │   ├── admin.py        # Admin controls
│   │   │   ├── applications.py # Job applications
│   │   │   └── users.py        # User profile
│   │   ├── main.py             # App entry point + CORS
│   │   ├── database.py         # MongoDB connection
│   │   ├── auth_utils.py       # JWT helpers
│   │   ├── seed.py             # DB seeder
│   │   ├── requirements.txt    # Python dependencies
│   │   └── .env                # Environment variables
│   │
│   └── frontend/               # React + Vite frontend
│       ├── src/
│       │   ├── pages/          # Page-level components
│       │   ├── components/     # Reusable UI components
│       │   ├── context/        # Global state (UserContext, JobContext)
│       │   ├── Router/         # App routing
│       │   └── assets/         # CSS, media, wrappers
│       └── package.json
└── run_backend.bat             # One-click backend launcher (Windows)
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

| Method | Endpoint                       | Access    | Description              |
|--------|--------------------------------|-----------|--------------------------|
| POST   | `/api/v1/applications/apply`   | Auth      | Apply for a job          |
| GET    | `/api/v1/applications/my`      | Auth      | View my applications     |
| GET    | `/api/v1/applications/job/{id}`| Recruiter | View applicants for job  |
| PATCH  | `/api/v1/applications/{id}`    | Recruiter | Approve / Decline        |

### Admin

| Method | Endpoint                         | Access | Description              |
|--------|----------------------------------|--------|--------------------------|
| GET    | `/api/v1/admin/stats`            | Admin  | Dashboard statistics     |
| GET    | `/api/v1/admin/users`            | Admin  | List all users           |
| PUT    | `/api/v1/admin/role`             | Admin  | Change user role         |
| DELETE | `/api/v1/admin/user/{id}`        | Admin  | Delete a user            |
| GET    | `/api/v1/admin/foundation-ids`   | Admin  | List all Foundation IDs  |
| POST   | `/api/v1/admin/foundation-id`    | Admin  | Add a new Foundation ID  |

---

## 🔐 Role-Based Access Control

| Action               | Admin | Recruiter | Member |
|----------------------|:-----:|:---------:|:------:|
| Register / Login     | ✅    | ✅        | ✅     |
| Browse Jobs          | ✅    | ✅        | ✅     |
| Apply for Job        | ✅    | ✅        | ✅     |
| Post a Job           | ✅    | ✅        | ❌     |
| Edit / Delete Job    | ✅    | ✅ (own)  | ❌     |
| Manage Applicants    | ✅    | ✅ (own)  | ❌     |
| View All Users       | ✅    | ❌        | ❌     |
| Change User Roles    | ✅    | ❌        | ❌     |
| Delete Users         | ✅    | ❌        | ❌     |
| Add Foundation IDs   | ✅    | ❌        | ❌     |
| View Dashboard Stats | ✅    | ❌        | ❌     |

---

## 📦 Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| **Frontend**| React 18 + Vite + Styled Components + TanStack Query |
| **Backend** | Python 3 + FastAPI + Uvicorn                    |
| **Database**| MongoDB (Atlas or Local) via PyMongo            |
| **Auth**    | JWT (python-jose) + bcrypt password hashing     |
| **State**   | React Context API + TanStack Query              |
| **Styling** | Vanilla CSS + CSS Variables + Inter & Poppins   |

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

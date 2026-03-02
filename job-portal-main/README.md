# VGULG Foundation — Internal Job Portal

## 📁 Project Structure

```
job-portal-main/
├── vgulg-backend/          ← 🐍 Python FastAPI Backend (NEW)
│   ├── main.py             ← App entry point
│   ├── database.py         ← MongoDB connection
│   ├── auth_utils.py       ← JWT + role guards
│   ├── seed.py             ← Database seeder
│   ├── requirements.txt    ← Python dependencies
│   ├── .env                ← Environment variables ← SET MONGO_URI HERE
│   └── routers/
│       ├── auth.py         ← Register, Login, Logout, Me
│       ├── users.py        ← Profile management
│       ├── jobs.py         ← Job CRUD + Smart Matching
│       ├── admin.py        ← Foundation ID mgmt, approvals, stats
│       └── applications.py ← Apply, track, update status
│
└── full-stack-job-portal-client-main/  ← ⚛️ React Frontend
    └── src/
        ├── pages/
        │   ├── Login.jsx       ← Foundation ID + Password login
        │   ├── Register.jsx    ← Foundation ID required registration
        │   └── Admin.jsx       ← Admin panel with Foundation ID management
        └── context/
            └── UserContext.jsx ← Points to localhost:8000
```

---

## ⚙️ Setup Instructions

### Step 1 — MongoDB Setup

**Option A: MongoDB Atlas (Recommended - Free Cloud)**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Click **Connect → Drivers → Python**
4. Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/vgulg_portal`)
5. Open `vgulg-backend/.env` and set:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/vgulg_portal
   ```

**Option B: Install MongoDB Locally**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service
- Use: `MONGO_URI=mongodb://localhost:27017/vgulg_portal`

---

### Step 2 — Install Python Dependencies

```bash
cd vgulg-backend
pip install -r requirements.txt
```

### Step 3 — Start Python Backend

```bash
cd vgulg-backend
python -m uvicorn main:app --reload --port 8000
```

The server will **auto-seed** on first startup:
- **8 Foundation IDs** (VGULG-001 to VGULG-008)
- **Admin account** with Foundation ID `VGULG-001`

### Step 4 — Start React Frontend

```bash
cd full-stack-job-portal-client-main
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔑 Default Credentials

| Role  | Foundation ID | Password        | Email           |
|-------|--------------|-----------------|-----------------|
| Admin | VGULG-001    | Admin@123456    | admin@vgulg.org |

---

## 🌐 API Endpoints

| Method | Endpoint                        | Access       | Description                  |
|--------|---------------------------------|--------------|------------------------------|
| POST   | `/api/v1/auth/register`         | Public       | Register with Foundation ID  |
| POST   | `/api/v1/auth/login`            | Public       | Login with Foundation ID     |
| POST   | `/api/v1/auth/logout`           | Auth         | Logout                       |
| GET    | `/api/v1/auth/me`               | Auth         | Get current user             |
| GET    | `/api/v1/admin/stats`           | Admin        | Dashboard statistics         |
| GET    | `/api/v1/admin/pending`         | Admin        | Pending approval users       |
| POST   | `/api/v1/admin/approve`         | Admin        | Approve/Reject user          |
| PUT    | `/api/v1/admin/role`            | Admin        | Change user role             |
| POST   | `/api/v1/admin/foundation-id`   | Admin        | Add Foundation ID            |
| GET    | `/api/v1/admin/foundation-ids`  | Admin        | List all Foundation IDs      |
| GET    | `/api/v1/jobs/all`              | Auth         | Get all jobs (search/filter) |
| POST   | `/api/v1/jobs/post`             | Recruiter    | Post a new job               |
| GET    | `/api/v1/jobs/match/smart`      | Auth         | Smart skill-based matching   |
| POST   | `/api/v1/applications/apply`    | Auth         | Apply for a job              |
| GET    | `/api/v1/applications/my`       | Auth         | My applications              |

Interactive Docs: **http://localhost:8000/docs**

---

## 🔐 Access Control

| Action           | Admin | Recruiter | Member |
|------------------|:-----:|:---------:|:------:|
| Register         | ✅    | ✅        | ✅     |
| Login            | ✅    | ✅        | ✅     |
| Post Job         | ✅    | ✅        | ❌     |
| Apply for Job    | ✅    | ✅        | ✅     |
| View All Members | ✅    | ❌        | ❌     |
| Approve Users    | ✅    | ❌        | ❌     |
| Add Foundation ID| ✅    | ❌        | ❌     |
| Change Roles     | ✅    | ❌        | ❌     |

---

## 📦 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite + Styled Components  |
| Backend   | Python + FastAPI                  |
| Database  | MongoDB (Atlas or Local)          |
| Auth      | JWT (python-jose) + bcrypt        |
| State     | TanStack Query + Context API      |

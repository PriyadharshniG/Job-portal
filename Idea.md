# Project Idea

## Name
VGLUG Foundation Internal Job Portal

## What it is
A full-stack internal job portal for VGLUG Foundation members. It allows verified members to register, create profiles, upload resumes and certifications, add skills and projects, and apply for jobs. Recruiters can post jobs, search candidates, generate screening questions, and manage applications. Admins can manage users and Foundation IDs.

## Built with
- Backend: Python FastAPI
- Frontend: React with Vite
- Database: MongoDB
- Authentication: JWT
- File uploads: resumes and certifications

## Main features
- Role-based access: Student, Recruiter, Admin
- Resume upload with skill extraction
- GitHub profile connection
- Job posting and management
- Candidate search and application tracking
- AI interview question generation
- Admin dashboard for users and valid IDs

## How to start
1. Backend
   - Go to `code_quester/backend`
   - Install dependencies: `pip install -r requirements.txt`
   - Set `MONGO_URI` and `SECRET_KEY` in `backend/.env`
   - Start server: `python -m uvicorn main:app --reload --port 8000`
2. Frontend
   - Go to `code_quester/frontend`
   - Install dependencies: `npm install`
   - Start app: `npm run dev`

## Notes
- Admin account is created automatically on backend startup.
- Frontend and backend run separately.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, jobs, admin, applications
from database import connect_db, get_db
from passlib.context import CryptContext
from datetime import datetime

app = FastAPI(title="VGULG Foundation – Internal Job Portal API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def auto_seed():
    """Auto-seed Foundation IDs and Admin account if DB is empty."""
    db = get_db()
    foundation_ids = [
        {"foundation_id": "VGLUG-001", "member_name": "Admin User"},
        {"foundation_id": "VGLUG-002", "member_name": "Recruiter One"},
        {"foundation_id": "VGLUG-003", "member_name": "Member One"},
        {"foundation_id": "VGLUG-004", "member_name": "Member Two"},
        {"foundation_id": "VGLUG-005", "member_name": "Volunteer One"},
        {"foundation_id": "VGLUG-006", "member_name": "Recruiter Two"},
        {"foundation_id": "VGLUG-007", "member_name": "Reserved Slot 7"},
        {"foundation_id": "VGLUG-008", "member_name": "Reserved Slot 8"},
    ]
    if db.foundation_ids.count_documents({}) == 0:
        db.foundation_ids.insert_many(foundation_ids)
        print("✅ Foundation IDs seeded (VGLUG-001 to VGLUG-008)")

    if db.vgulg_users.count_documents({}) == 0:
        admin_user = {
            "username": "VGLUGAdmin",
            "foundation_id": "VGLUG-001",
            "email": "admin@vglug.org",
            "password": pwd_ctx.hash("Admin@123456"),
            "role": "admin",
            "is_approved": True,
            "skills": ["Management", "Python", "Leadership"],
            "education": "B.Tech Computer Science",
            "experience": "5 years",
            "location": "Foundation HQ",
            "resume": "",
            "bio": "VGLUG Foundation Admin",
            "created_at": datetime.utcnow().isoformat(),
        }
        db.vgulg_users.insert_one(admin_user)
        print("✅ Admin account seeded — ID: VGLUG-001 | Pass: Admin@123456")

# Connect TinyDB + auto-seed on startup
@app.on_event("startup")
async def startup():
    connect_db()
    auto_seed()

# Routes
app.include_router(auth.router,         prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(users.router,        prefix="/api/v1/users",        tags=["Users"])
app.include_router(jobs.router,         prefix="/api/v1/jobs",         tags=["Jobs"])
app.include_router(admin.router,        prefix="/api/v1/admin",        tags=["Admin"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])

@app.get("/")
def root():
    return {"message": "VGULG Foundation Job Portal API running ✅"}

@app.get("/api/v1/health")
def health():
    db = get_db()
    return {
        "status": "ok",
        "database": "TinyDB (JSON file — no server needed)",
        "foundation_ids": db.foundation_ids.count_documents({}),
        "users": db.vgulg_users.count_documents({}),
        "jobs": db.vgulg_jobs.count_documents({}),
    }

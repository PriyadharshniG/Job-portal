from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, jobs, admin, applications, student, recruiter
from database import connect_db, get_db
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId

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
    """Auto-seed Admin account with official credentials on every startup."""
    db = get_db()

    # Always ensure the official VGLUG admin account exists.
    admin_fid = "VGLUG-3945"
    existing = db.vgulg_users.find_one({"foundation_id": admin_fid})
    if not existing:
        admin_user = {
            "_id": str(ObjectId()),
            "username": "VGLUGAdmin",
            "foundation_id": admin_fid,
            "email": "admin@vglug.org",
            "password": pwd_ctx.hash("Krish3945"),
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
        print(f"✅ Admin seeded — Foundation ID: {admin_fid} | Pass: Krish3945")
    else:
        # Always sync password and role in case they were changed accidentally
        db.vgulg_users.update_one(
            {"foundation_id": admin_fid},
            {"$set": {"password": pwd_ctx.hash("Krish3945"), "role": "admin", "is_approved": True}}
        )
        print(f"✅ Admin confirmed — Foundation ID: {admin_fid}")

# Connect MongoDB + auto-seed on startup
@app.on_event("startup")
async def startup():
    try:
        connect_db()
        auto_seed()
    except Exception as exc:
        # Log full startup failure for debugging. Health checks can return helpful info.
        print(f"❌ Startup error: {exc}")

# Routes
app.include_router(auth.router,         prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(users.router,        prefix="/api/v1/users",        tags=["Users"])
app.include_router(jobs.router,         prefix="/api/v1/jobs",         tags=["Jobs"])
app.include_router(admin.router,        prefix="/api/v1/admin",        tags=["Admin"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])
app.include_router(student.router,      prefix="/api/v1/student",       tags=["Student"])
app.include_router(recruiter.router,    prefix="/api/v1/recruiter",     tags=["Recruiter"])

@app.get("/")
def root():
    return {"message": "VGULG Foundation Job Portal API running ✅"}

@app.get("/api/v1/health")
def health():
    try:
        db = get_db()
    except RuntimeError as exc:
        return {"status": "error", "message": str(exc), "database": "MongoDB"}

    try:
        return {
            "status": "ok",
            "database": "MongoDB",
            "users": db.vgulg_users.count_documents({}),
            "jobs": db.vgulg_jobs.count_documents({}),
        }
    except Exception as exc:
        return {"status": "error", "message": str(exc), "database": "MongoDB"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


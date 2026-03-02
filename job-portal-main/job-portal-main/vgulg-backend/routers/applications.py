from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db
from auth_utils import get_current_user, require_admin
from datetime import datetime
from typing import Optional

router = APIRouter()

class ApplicationModel(BaseModel):
    job_id: str

class StatusModel(BaseModel):
    application_id: str
    status: str  # pending | interview | accepted | declined

# ── Apply for a Job ──────────────────────────────────────
@router.post("/apply")
def apply_job(data: ApplicationModel, request: Request):
    user = get_current_user(request)
    db = get_db()
    if db.vgulg_applications.find_one({"job_id": data.job_id, "user_id": user["_id"]}):
        raise HTTPException(status_code=400, detail="You have already applied for this job.")
    job = db.vgulg_jobs.find_one({"_id": data.job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    app = {
        "job_id": data.job_id,
        "user_id": user["_id"],
        "username": user.get("username"),
        "foundation_id": user.get("foundation_id"),
        "company": job.get("company"),
        "position": job.get("position"),
        "status": "pending",
        "applied_at": datetime.utcnow().isoformat(),
    }
    db.vgulg_applications.insert_one(app)
    return {"status": True, "message": "Application submitted."}

# ── My Applications (Job Seeker) ─────────────────────────
@router.get("/my")
def my_applications(request: Request):
    user = get_current_user(request)
    db = get_db()
    apps = list(db.vgulg_applications.find({"user_id": user["_id"]}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── Applications for a Job (Recruiter/Admin) ─────────────
@router.get("/job/{job_id}")
def job_applications(job_id: str, request: Request):
    user = get_current_user(request)
    db = get_db()
    if user["role"] not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    apps = list(db.vgulg_applications.find({"job_id": job_id}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── Update Application Status (Recruiter/Admin) ──────────
@router.put("/status")
def update_status(data: StatusModel, request: Request):
    user = get_current_user(request)
    if user["role"] not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    if data.status not in ["pending", "interview", "accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status value.")
    db = get_db()
    db.vgulg_applications.update_one(
        {"_id": data.application_id},
        {"$set": {"status": data.status}}
    )
    return {"status": True, "message": f"Application status updated to '{data.status}'."}

# ── All Applications (Admin) ─────────────────────────────
@router.get("/all")
def all_applications(request: Request):
    require_admin(request)
    db = get_db()
    apps = list(db.vgulg_applications.find({}).sort("applied_at", -1))
    return {"status": True, "result": apps}

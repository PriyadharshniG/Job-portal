from fastapi import APIRouter, Request, HTTPException, Query
from pydantic import BaseModel
from database import get_db
from auth_utils import get_current_user, require_recruiter_or_admin
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

router = APIRouter()

class JobModel(BaseModel):
    company: str
    position: str
    job_type: str = "Full-Time"
    job_location: str
    job_salary: str
    job_vacancy: str
    job_deadline: str
    job_description: str
    job_skills: List[str] = []
    job_facilities: List[str] = []
    job_contact: str

class UpdateJobModel(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    job_type: Optional[str] = None
    job_location: Optional[str] = None
    job_salary: Optional[str] = None
    job_vacancy: Optional[str] = None
    job_deadline: Optional[str] = None
    job_description: Optional[str] = None
    job_skills: Optional[List[str]] = None
    job_facilities: Optional[List[str]] = None
    job_contact: Optional[str] = None

# ── Post Job (Recruiter / Admin) ────────────────────────
@router.post("/post")
def post_job(data: JobModel, request: Request):
    user = require_recruiter_or_admin(request)
    db = get_db()
    job = data.dict()
    job["_id"] = str(ObjectId())
    job["created_by"] = user["_id"]
    job["creator_name"] = user.get("username", "")
    job["status"] = "open"
    job["created_at"] = datetime.utcnow().isoformat()
    db.vgulg_jobs.insert_one(job)
    print(f"✅ Job posted: {job['position']} at {job['company']} by {job['creator_name']}")
    return {"status": True, "message": "Job posted successfully.", "job_id": job["_id"]}

# ── Get All Jobs — PUBLIC (no login needed) ─────────────
@router.get("/all")
def get_all_jobs(
    request: Request,
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = 1, limit: int = 10
):
    # No auth required — anyone can browse jobs
    db = get_db()
    query = {}
    if search:
        query["$or"] = [
            {"position": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
        ]
    if job_type:
        query["job_type"] = job_type
    if location:
        query["job_location"] = {"$regex": location, "$options": "i"}
    if skill:
        query["job_skills"] = {"$elemMatch": {"$regex": skill, "$options": "i"}}

    all_jobs = list(db.vgulg_jobs.find(query).sort("created_at", -1))
    total = len(all_jobs)
    jobs = all_jobs[(page - 1) * limit: page * limit]
    return {"status": True, "result": jobs, "total": total, "page": page, "pages": (total // limit) + 1}

# ── My Posted Jobs (Recruiter) — MUST be before /{job_id} ──
@router.get("/my/posted")
def my_jobs(request: Request):
    user = require_recruiter_or_admin(request)
    db = get_db()
    jobs = list(db.vgulg_jobs.find({"created_by": user["_id"]}).sort("created_at", -1))
    return {"status": True, "result": jobs}

# ── Smart Skill Match — MUST be before /{job_id} ─────────
@router.get("/match/smart", response_model=None)
def smart_match(request: Request):
    user = get_current_user(request)
    db = get_db()
    user_skills = user.get("skills", [])
    if not user_skills:
        return {"status": True, "result": [], "message": "Add skills to your profile to see matches."}
    matched = []
    jobs = list(db.vgulg_jobs.find({"status": "open"}))
    for job in jobs:
        job_skills = job.get("job_skills", [])
        common = [s for s in user_skills if any(s.lower() in js.lower() for js in job_skills)]
        if common:
            job["match_score"] = int(len(common) / max(len(job_skills), 1) * 100)
            job["matched_skills"] = common
            matched.append(job)
    matched.sort(key=lambda x: x["match_score"], reverse=True)
    return {"status": True, "result": matched}

# ── Get Single Job — PUBLIC (no login needed) ───────────
@router.get("/{job_id}")
def get_job(job_id: str, request: Request):
    # No auth required — anyone can view job details
    db = get_db()
    job = db.vgulg_jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"status": True, "result": job}

# (my/posted is defined above, before /{job_id} wildcard)

# ── Update Job ──────────────────────────────────────────
@router.put("/{job_id}")
def update_job(job_id: str, data: UpdateJobModel, request: Request):
    user = require_recruiter_or_admin(request)
    db = get_db()
    job = db.vgulg_jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["created_by"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own jobs.")
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    db.vgulg_jobs.update_one({"_id": job_id}, {"$set": update_data})
    return {"status": True, "message": "Job updated."}

# ── Delete Job ──────────────────────────────────────────
@router.delete("/{job_id}")
def delete_job(job_id: str, request: Request):
    user = require_recruiter_or_admin(request)
    db = get_db()
    job = db.vgulg_jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job["created_by"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="No permission to delete this job.")
    db.vgulg_jobs.delete_one({"_id": job_id})
    return {"status": True, "message": "Job deleted."}

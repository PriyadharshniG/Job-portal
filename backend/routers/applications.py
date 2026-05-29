from fastapi import APIRouter, Request, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel
from database import get_db
from auth_utils import get_current_user, require_admin
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
import os, shutil, re

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── Skill keywords (same as student.py) ──────────────────
SKILL_KEYWORDS = [
    "python","javascript","typescript","java","c++","c#","c","go","rust","swift","kotlin",
    "ruby","php","scala","r","matlab","dart","perl","haskell","elixir","clojure",
    "html","css","react","reactjs","vue","vuejs","angular","svelte","nextjs","nuxtjs",
    "node","nodejs","express","fastapi","django","flask","laravel","rails","spring",
    "tailwind","bootstrap","jquery","graphql","rest","restapi","websocket",
    "machine learning","deep learning","nlp","natural language processing",
    "tensorflow","pytorch","keras","scikit-learn","sklearn","pandas","numpy","matplotlib",
    "seaborn","opencv","computer vision","data science","data analysis","hadoop","spark",
    "mongodb","mysql","postgresql","postgres","sqlite","redis","firebase","dynamodb",
    "oracle","cassandra","elasticsearch","neo4j",
    "docker","kubernetes","aws","azure","gcp","google cloud","heroku","vercel","netlify",
    "linux","bash","shell","git","github","gitlab","jenkins","terraform","ansible","ci/cd",
    "android","ios","flutter","react native","xamarin",
    "figma","photoshop","illustrator","unity","unreal","blender",
    "api","microservices","agile","scrum","devops","blockchain","solidity",
    "excel","powerbi","tableau","seo","selenium","playwright","jest","pytest",
]

def extract_skills_from_text(text: str) -> List[str]:
    """AI-like skill extraction: keyword matching with word-boundary check."""
    text_lower = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        if re.search(pattern, text_lower):
            found.append(skill.title() if " " not in skill else skill.title())
    return list(dict.fromkeys(found))  # deduplicate, preserve order

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pypdf."""
    try:
        import pypdf
        text = ""
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                text += (page.extract_text() or "")
        return text
    except Exception:
        return ""

# ── Upload Resume (PDF) ───────────────────────────────────
@router.post("/upload-resume")
async def upload_resume(request: Request, file: UploadFile = File(...)):
    user = get_current_user(request)
    if file.content_type not in ["application/pdf", "application/octet-stream"]:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    safe_name = f"{user['_id']}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # ── AI Skill extraction from resume ──────────────────
    resume_text = extract_text_from_pdf(file_path)
    extracted_skills = extract_skills_from_text(resume_text)

    # Save extracted skills to user's resume_skills field (non-destructive)
    if extracted_skills:
        db = get_db()
        db.vgulg_users.update_one(
            {"_id": user["_id"]},
            {"$addToSet": {"resume_skills": {"$each": extracted_skills}}}
        )

    return {"status": True, "resume_url": f"/api/v1/applications/resume/{safe_name}", "extracted_skills": extracted_skills}

# ── Serve Resume File ─────────────────────────────────────
@router.get("/resume/{filename}")
def serve_resume(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume not found.")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

# ── Pydantic models ───────────────────────────────────────
class ApplicationModel(BaseModel):
    job_id: str
    resume_url: Optional[str] = ""

class StatusModel(BaseModel):
    application_id: str
    status: str  # pending | interview | shortlisted | accepted | declined

# ── All Applications (Admin) — must be before /{app_id} ──
@router.get("/all")
def all_applications(request: Request):
    require_admin(request)
    db = get_db()
    apps = list(db.vgulg_applications.find({}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── My Applications (Job Seeker) — must be before /{app_id}
@router.get("/my")
def my_applications(request: Request):
    user = get_current_user(request)
    db = get_db()
    apps = list(db.vgulg_applications.find({"user_id": user["_id"]}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── Applications for Recruiter's own Jobs ─────────────────
@router.get("/recruiter-jobs")
def recruiter_applications(request: Request):
    user = get_current_user(request)
    if user["role"] not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    db = get_db()
    apps = list(db.vgulg_applications.find({"created_by": user["_id"]}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── Applications for a specific Job (Recruiter/Admin) ─────
@router.get("/job/{job_id}")
def job_applications(job_id: str, request: Request):
    user = get_current_user(request)
    db = get_db()
    if user["role"] not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    apps = list(db.vgulg_applications.find({"job_id": job_id}).sort("applied_at", -1))
    return {"status": True, "result": apps}

# ── Apply for a Job ───────────────────────────────────────
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
        "_id": str(ObjectId()),
        "job_id": data.job_id,
        "user_id": user["_id"],
        "username": user.get("username"),
        "foundation_id": user.get("foundation_id"),
        "company": job.get("company"),
        "position": job.get("position"),
        "created_by": job.get("created_by", ""),   # recruiter's user_id
        "creator_name": job.get("creator_name", ""),
        "status": "pending",
        "resume_url": data.resume_url or "",
        "applied_at": datetime.utcnow().isoformat(),
        "rejected_by": "",          # "admin" | "recruiter" | ""
        "rejected_by_name": "",     # username of who rejected
    }
    db.vgulg_applications.insert_one(app)
    print(f"✅ Application: {user['username']} → {job['position']} @ {job['company']}")
    return {"status": True, "message": "Application submitted successfully!"}

# ── Update Application Status (Recruiter / Admin) ─────────
@router.put("/status")
def update_status(data: StatusModel, request: Request):
    user = get_current_user(request)
    if user["role"] not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    if data.status not in ["pending", "interview", "shortlisted", "accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status value.")
    db = get_db()
    update_fields = {"status": data.status}
    if data.status == "declined":
        # Track who declined — role + name
        update_fields["rejected_by"] = user["role"]
        update_fields["rejected_by_name"] = user.get("username", "")
    else:
        # Clear rejection info if status changes from declined
        update_fields["rejected_by"] = ""
        update_fields["rejected_by_name"] = ""
    db.vgulg_applications.update_one(
        {"_id": data.application_id},
        {"$set": update_fields}
    )
    return {"status": True, "message": f"Application status updated to '{data.status}'."}

# ── Delete Application (Admin only) ──────────────────────
@router.delete("/{app_id}")
def delete_application(app_id: str, request: Request):
    require_admin(request)
    db = get_db()
    result = db.vgulg_applications.delete_one({"_id": app_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found.")
    return {"status": True, "message": "Application deleted by admin."}

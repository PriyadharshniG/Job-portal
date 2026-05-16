"""student.py — Student-specific features router.

Handles:
  - Resume upload (PDF/DOCX) + AI skill extraction
  - Manual skills add/edit
  - GitHub profile connect + repo fetch
  - Certifications upload/manage
  - Project links manage
"""

from fastapi import APIRouter, Request, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from database import get_db
from auth_utils import get_current_user
from typing import Optional, List
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
import os, shutil, re, httpx

router = APIRouter()

# ── Directory setup ──────────────────────────────────────
RESUMES_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "resumes")
CERTS_DIR   = os.path.join(os.path.dirname(__file__), "..", "uploads", "certifications")
os.makedirs(RESUMES_DIR, exist_ok=True)
os.makedirs(CERTS_DIR,   exist_ok=True)

# ── Skill keywords for simple AI extraction ──────────────
SKILL_KEYWORDS = [
    # Languages
    "python","javascript","typescript","java","c++","c#","c","go","rust","swift","kotlin",
    "ruby","php","scala","r","matlab","dart","perl","haskell","elixir","clojure",
    # Web
    "html","css","react","reactjs","vue","vuejs","angular","svelte","nextjs","nuxtjs",
    "node","nodejs","express","fastapi","django","flask","laravel","rails","spring",
    "tailwind","bootstrap","jquery","graphql","rest","restapi","websocket",
    # Data / AI / ML
    "machine learning","deep learning","nlp","natural language processing",
    "tensorflow","pytorch","keras","scikit-learn","sklearn","pandas","numpy","matplotlib",
    "seaborn","opencv","computer vision","data science","data analysis","hadoop","spark",
    # Databases
    "mongodb","mysql","postgresql","postgres","sqlite","redis","firebase","dynamodb",
    "oracle","cassandra","elasticsearch","neo4j",
    # DevOps / Cloud
    "docker","kubernetes","aws","azure","gcp","google cloud","heroku","vercel","netlify",
    "linux","bash","shell","git","github","gitlab","jenkins","terraform","ansible","ci/cd",
    # Mobile
    "android","ios","flutter","react native","xamarin",
    # Other tools
    "figma","photoshop","illustrator","unity","unreal","blender",
    "api","microservices","agile","scrum","devops","blockchain","solidity",
    "excel","powerbi","tableau","seo","selenium","playwright","jest","pytest",
]

def extract_skills_from_text(text: str) -> List[str]:
    """Simple AI-like skill extraction using keyword matching on resume text."""
    text_lower = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        # Word-boundary match so "c" doesn't match "science"
        pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        if re.search(pattern, text_lower):
            found.append(skill.title() if " " not in skill else skill.title())
    return list(dict.fromkeys(found))  # deduplicate preserving order

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pypdf (safe fallback)."""
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

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        import docx
        doc = docx.Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""

# ─────────────────────────────────────────────────────────
# 1. RESUME UPLOAD + AI SKILL EXTRACTION
# ─────────────────────────────────────────────────────────

@router.post("/resume/upload")
async def upload_resume(request: Request, file: UploadFile = File(...)):
    """Upload PDF/DOCX resume, extract text, return AI-detected skills."""
    user = get_current_user(request)

    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",   # some browsers send this
        "application/msword",
    ]
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ["pdf", "docx"] and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files are allowed.")

    safe_name = f"{user['_id']}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(RESUMES_DIR, safe_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Extract text & skills
    if ext == "pdf":
        text = extract_text_from_pdf(file_path)
    elif ext == "docx":
        text = extract_text_from_docx(file_path)
    else:
        text = ""

    extracted_skills = extract_skills_from_text(text)
    resume_url = f"/api/v1/student/resume/file/{safe_name}"

    # Persist resume_url and merge extracted skills into user document
    db = get_db()
    update_data = {
        "$set": {"resume": resume_url, "resume_filename": file.filename}
    }
    if extracted_skills:
        update_data["$addToSet"] = {"skills": {"$each": extracted_skills}}

    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        update_data
    )

    return {
        "status": True,
        "resume_url": resume_url,
        "filename": file.filename,
        "extracted_skills": extracted_skills,
        "text_length": len(text),
    }


@router.get("/resume/file/{filename}")
def serve_resume_file(filename: str):
    """Serve uploaded resume file."""
    file_path = os.path.join(RESUMES_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found.")
    ext = filename.rsplit(".", 1)[-1].lower()
    media_type = "application/pdf" if ext == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(file_path, media_type=media_type, filename=filename)


# ─────────────────────────────────────────────────────────
# 2. SKILLS — MANUAL ADD / EDIT / DELETE
# ─────────────────────────────────────────────────────────

class SkillsModel(BaseModel):
    skills: List[str]

@router.put("/skills")
def update_skills(data: SkillsModel, request: Request):
    """Replace the student's entire skills list."""
    user = get_current_user(request)
    cleaned = [s.strip() for s in data.skills if s.strip()]
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$set": {"skills": cleaned}}
    )
    updated = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {"status": True, "message": "Skills updated.", "skills": updated.get("skills", [])}


@router.post("/skills/add")
def add_skill(request: Request, skill: str = Form(...)):
    """Add a single skill (idempotent)."""
    user = get_current_user(request)
    skill = skill.strip()
    if not skill:
        raise HTTPException(status_code=400, detail="Skill cannot be empty.")
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$addToSet": {"skills": skill}}
    )
    updated = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {"status": True, "skills": updated.get("skills", [])}


@router.delete("/skills/{skill_name}")
def remove_skill(skill_name: str, request: Request):
    """Remove a skill by name."""
    user = get_current_user(request)
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"skills": skill_name}}
    )
    updated = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {"status": True, "skills": updated.get("skills", [])}


# ─────────────────────────────────────────────────────────
# 3. GITHUB INTEGRATION
# ─────────────────────────────────────────────────────────

class GitHubModel(BaseModel):
    github_username: str

@router.post("/github/connect")
async def connect_github(data: GitHubModel, request: Request):
    """Save GitHub username and fetch public repos + languages."""
    user = get_current_user(request)
    username = data.github_username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty.")

    # Fetch profile + repos from GitHub public API
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "VGLUG-Job-Portal/1.0"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            profile_res = await client.get(f"https://api.github.com/users/{username}", headers=headers)
            repos_res   = await client.get(f"https://api.github.com/users/{username}/repos?per_page=50&sort=updated", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach GitHub API: {e}")

    if profile_res.status_code == 404:
        raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found.")
    if profile_res.status_code != 200:
        raise HTTPException(status_code=502, detail="GitHub API error.")

    profile = profile_res.json()
    repos_raw = repos_res.json() if repos_res.status_code == 200 else []

    # Collect repos with languages
    repos = []
    lang_set = set()
    for r in repos_raw:
        if not r.get("fork", False):   # skip forks
            lang = r.get("language") or ""
            if lang:
                lang_set.add(lang)
            repos.append({
                "name": r.get("name", ""),
                "description": r.get("description", "") or "",
                "language": lang,
                "stars": r.get("stargazers_count", 0),
                "url": r.get("html_url", ""),
                "updated_at": r.get("updated_at", ""),
            })

    github_data = {
        "github_username": username,
        "github_url": profile.get("html_url", f"https://github.com/{username}"),
        "github_avatar": profile.get("avatar_url", ""),
        "github_bio": profile.get("bio", "") or "",
        "github_repos": repos,
        "github_languages": list(lang_set),
        "github_synced_at": datetime.utcnow().isoformat(),
    }

    db = get_db()
    db.vgulg_users.update_one({"_id": user["_id"]}, {"$set": github_data})

    # Auto-add GitHub languages to skills (non-destructive)
    if lang_set:
        for lang in lang_set:
            db.vgulg_users.update_one({"_id": user["_id"]}, {"$addToSet": {"skills": lang}})

    return {
        "status": True,
        "message": f"GitHub profile '{username}' connected successfully! {len(repos)} repos fetched.",
        "github": github_data,
    }


@router.get("/github/repos")
def get_github_repos(request: Request):
    """Return cached GitHub repos for current user."""
    user = get_current_user(request)
    db = get_db()
    u = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {
        "status": True,
        "github_username": u.get("github_username", ""),
        "github_url": u.get("github_url", ""),
        "github_avatar": u.get("github_avatar", ""),
        "github_bio": u.get("github_bio", ""),
        "github_repos": u.get("github_repos", []),
        "github_languages": u.get("github_languages", []),
        "github_synced_at": u.get("github_synced_at", ""),
    }


@router.delete("/github/disconnect")
def disconnect_github(request: Request):
    """Remove GitHub link from user profile."""
    user = get_current_user(request)
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$unset": {
            "github_username": "", "github_url": "", "github_avatar": "",
            "github_bio": "", "github_repos": "", "github_languages": "",
            "github_synced_at": "",
        }}
    )
    return {"status": True, "message": "GitHub disconnected."}


# ─────────────────────────────────────────────────────────
# 4. CERTIFICATIONS
# ─────────────────────────────────────────────────────────

@router.post("/certifications/upload")
async def upload_certification(
    request: Request,
    title: str = Form(...),
    issuer: str = Form(""),
    issued_date: str = Form(""),
    file: Optional[UploadFile] = File(None),
):
    """Upload a certification (PDF/image) with metadata."""
    user = get_current_user(request)
    cert_id = str(ObjectId())
    file_url = ""

    if file:
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        if ext not in ["pdf", "jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail="Only PDF or image files allowed for certifications.")
        safe_name = f"{user['_id']}_{cert_id}.{ext}"
        file_path = os.path.join(CERTS_DIR, safe_name)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_url = f"/api/v1/student/certifications/file/{safe_name}"

    cert = {
        "_id": cert_id,
        "title": title.strip(),
        "issuer": issuer.strip(),
        "issued_date": issued_date.strip(),
        "file_url": file_url,
        "added_at": datetime.utcnow().isoformat(),
    }

    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$push": {"certifications": cert}}
    )
    return {"status": True, "message": "Certification added.", "certification": cert}


@router.get("/certifications/file/{filename}")
def serve_cert_file(filename: str):
    """Serve a certification file."""
    file_path = os.path.join(CERTS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    ext = filename.rsplit(".", 1)[-1].lower()
    mt_map = {"pdf": "application/pdf", "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    return FileResponse(file_path, media_type=mt_map.get(ext, "application/octet-stream"))


@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: str, request: Request):
    """Remove a certification from the user's profile."""
    user = get_current_user(request)
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"certifications": {"_id": cert_id}}}
    )
    return {"status": True, "message": "Certification removed."}


# ─────────────────────────────────────────────────────────
# 5. PROJECT LINKS
# ─────────────────────────────────────────────────────────

class ProjectModel(BaseModel):
    title: str
    description: Optional[str] = ""
    url: str
    tech_stack: Optional[List[str]] = []

@router.post("/projects/add")
def add_project(data: ProjectModel, request: Request):
    """Add a project link to the student's profile."""
    user = get_current_user(request)
    if not data.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Project URL must start with http/https.")
    project = {
        "_id": str(ObjectId()),
        "title": data.title.strip(),
        "description": (data.description or "").strip(),
        "url": data.url.strip(),
        "tech_stack": [t.strip() for t in (data.tech_stack or []) if t.strip()],
        "added_at": datetime.utcnow().isoformat(),
    }
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$push": {"projects": project}}
    )
    return {"status": True, "message": "Project added.", "project": project}


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, request: Request):
    """Remove a project from the student's profile."""
    user = get_current_user(request)
    db = get_db()
    db.vgulg_users.update_one(
        {"_id": user["_id"]},
        {"$pull": {"projects": {"_id": project_id}}}
    )
    return {"status": True, "message": "Project removed."}


# ─────────────────────────────────────────────────────────
# 6. FULL STUDENT PROFILE (read)
# ─────────────────────────────────────────────────────────

@router.get("/profile")
def get_student_profile(request: Request):
    """Return complete student profile including skills, GitHub, certs, projects."""
    user = get_current_user(request)
    db = get_db()
    u = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    if not u:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": True, "result": u}


# ─────────────────────────────────────────────────────────
# 7. FULL PROFILE UPDATE
# ─────────────────────────────────────────────────────────

class ProfileUpdateModel(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    phone: Optional[str] = None

@router.put("/profile/update")
def update_profile(data: ProfileUpdateModel, request: Request):
    """Update basic student profile fields."""
    user = get_current_user(request)
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    db = get_db()
    db.vgulg_users.update_one({"_id": user["_id"]}, {"$set": update_data})
    updated = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {"status": True, "message": "Profile updated.", "result": updated}

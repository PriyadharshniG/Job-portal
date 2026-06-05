from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional
from database import get_db
from auth_utils import create_token, get_current_user
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Models ──────────────────────────────────────────────
class RegisterModel(BaseModel):
    username: str
    foundation_id: str
    email: str
    password: str
    role: str = "user"  # user | recruiter
    company_name: Optional[str] = ""
    company_website: Optional[str] = ""
    designation: Optional[str] = ""

class LoginModel(BaseModel):
    foundation_id: str
    password: str

class ResetPasswordModel(BaseModel):
    foundation_id: str
    email: str       # extra verification
    new_password: str

# ── Register ────────────────────────────────────────────
@router.post("/register")
def register(data: RegisterModel, response: Response):
    try:
        db = get_db()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # 1. Normalize Foundation ID (uppercase)
    foundation_id = data.foundation_id.strip().upper()

    # 2. Check if Foundation ID already registered
    if db.vgulg_users.find_one({"foundation_id": foundation_id}):
        raise HTTPException(status_code=400, detail="This Foundation ID is already registered.")

    # 3. Check if email already in use
    if db.vgulg_users.find_one({"email": data.email.strip().lower()}):
        raise HTTPException(status_code=400, detail="Email already in use.")

    # 4. Password length check for bcrypt 72-byte limit
    password_bytes = data.password.encode("utf-8")
    if len(password_bytes) > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 bytes for bcrypt).")

    # 5. First user ever = admin automatically
    is_first = db.vgulg_users.count_documents({}) == 0
    role = "admin" if is_first else data.role

    # 6. Create and store user directly in MongoDB
    new_user = {
        "_id": str(ObjectId()),
        "username": data.username.strip(),
        "foundation_id": foundation_id,
        "email": data.email.strip().lower(),
        "password": pwd_ctx.hash(data.password),
        "role": role,
        "is_approved": True,
        "skills": [],
        "education": "",
        "experience": "",
        "location": "",
        "resume": "",
        "bio": "",
        "company_name": (data.company_name or "").strip(),
        "company_website": (data.company_website or "").strip(),
        "designation": (data.designation or "").strip(),
        "created_at": datetime.utcnow().isoformat(),
    }
    db.vgulg_users.insert_one(new_user)
    print(f"✅ New user registered: {foundation_id} | role: {role}")
    return {
        "status": True,
        "message": f"Registered successfully! {'You are the Admin.' if is_first else 'You can now log in.'}"
    }

# ── Login ────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginModel, response: Response):
    try:
        db = get_db()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # Normalize Foundation ID
    foundation_id = data.foundation_id.strip().upper()

    # Look up user by Foundation ID in MongoDB
    user = db.vgulg_users.find_one({"foundation_id": foundation_id})
    if not user:
        raise HTTPException(
            status_code=400,
            detail=f"No account found for '{foundation_id}'. Please register first."
        )
    if not pwd_ctx.verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password.")
    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")

    token = create_token({"id": str(user["_id"]), "role": user["role"]})
    response.set_cookie(
    key="vgulg_token",
    value=token,
    httponly=True,
    secure=True,
    samesite="none",
    max_age=86400
)
       
    print(f"✅ User logged in: {foundation_id}")
    return {"status": True, "message": "Login successful", "role": user["role"]}

# ── Reset / Forgot Password ──────────────────────────────
@router.post("/reset-password")
def reset_password(data: ResetPasswordModel):
    try:
        db = get_db()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # Find user by Foundation ID, verify email matches
    user = db.vgulg_users.find_one({"foundation_id": data.foundation_id})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that Foundation ID.")
    if user.get("email") != data.email:
        raise HTTPException(status_code=400, detail="Email does not match this Foundation ID.")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    password_bytes = data.new_password.encode("utf-8")
    if len(password_bytes) > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 bytes for bcrypt).")

    hashed = pwd_ctx.hash(data.new_password)
    db.vgulg_users.update_one({"_id": user["_id"]}, {"$set": {"password": hashed}})
    return {"status": True, "message": "Password updated successfully. You can now log in."}

# ── Logout ───────────────────────────────────────────────
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
    key="vgulg_token",
    samesite="none",
    secure=True
)
    return {"status": True, "message": "Logged out successfully"}

# ── Get Me ───────────────────────────────────────────────
@router.get("/me")
def get_me(request: Request):
    user = get_current_user(request)
    return {"status": True, "result": user}

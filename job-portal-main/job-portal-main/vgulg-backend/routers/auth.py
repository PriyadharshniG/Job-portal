from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from database import get_db
from auth_utils import create_token, get_current_user
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Models ──────────────────────────────────────────────
class RegisterModel(BaseModel):
    username: str
    foundation_id: str
    email: str
    password: str
    role: str = "user"  # user | recruiter

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
    db = get_db()

    # 1. Check Foundation ID exists in verified list
    foundation_member = db.foundation_ids.find_one({"foundation_id": data.foundation_id})
    if not foundation_member:
        raise HTTPException(status_code=400, detail="Invalid Foundation ID. Only VGULG members can register.")

    # 2. Check if already registered
    if db.vgulg_users.find_one({"foundation_id": data.foundation_id}):
        raise HTTPException(status_code=400, detail="This Foundation ID is already registered.")

    if db.vgulg_users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already in use.")

    # 3. First user ever = admin automatically
    is_first = db.vgulg_users.count_documents({}) == 0
    role = "admin" if is_first else data.role

    # 4. Create user (auto-approved — Foundation ID check is the gate)
    new_user = {
        "username": data.username,
        "foundation_id": data.foundation_id,
        "email": data.email,
        "password": pwd_ctx.hash(data.password),
        "role": role,
        "is_approved": True,  # Auto-approved: having a valid Foundation ID is sufficient
        "skills": [],
        "education": "",
        "experience": "",
        "location": "",
        "resume": "",
        "bio": "",
        "created_at": datetime.utcnow().isoformat(),
    }
    db.vgulg_users.insert_one(new_user)
    return {
        "status": True,
        "message": f"Registered successfully! {'You are the Admin.' if is_first else 'You can now log in.'}"
    }

# ── Login ────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginModel, response: Response):
    db = get_db()
    print(f"chacking 1 {data}")
    # Look up user by Foundation ID
    user = db.vgulg_users.find_one({"foundation_id": data.foundation_id})
    print(f"chacking 2 {user}")
    if not user:
        # Give a helpful message if the ID is in the whitelist but not registered
        is_valid_id = db.foundation_ids.find_one({"foundation_id": data.foundation_id})
        if is_valid_id:
            raise HTTPException(
                status_code=400,
                detail=f"No account found for '{data.foundation_id}'. Please register first."
            )
        raise HTTPException(status_code=400, detail="Foundation ID not recognised. Please check your ID.")
    if not pwd_ctx.verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password.")
    if not user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Your account is pending admin approval.")

    token = create_token({"id": str(user["_id"]), "role": user["role"]})
    response.set_cookie(
        key="vgulg_token", value=token,
        httponly=True, samesite="lax",
        max_age=86400
    )
    return {"status": True, "message": "Login successful"}

# ── Reset / Forgot Password ──────────────────────────────
@router.post("/reset-password")
def reset_password(data: ResetPasswordModel):
    db = get_db()
    # Find user by Foundation ID, verify email matches
    user = db.vgulg_users.find_one({"foundation_id": data.foundation_id})
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that Foundation ID.")
    if user.get("email") != data.email:
        raise HTTPException(status_code=400, detail="Email does not match this Foundation ID.")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    hashed = pwd_ctx.hash(data.new_password)
    db.vgulg_users.update_one({"_id": user["_id"]}, {"$set": {"password": hashed}})
    return {"status": True, "message": "Password updated successfully. You can now log in."}

# ── Logout ───────────────────────────────────────────────
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("vgulg_token")
    return {"status": True, "message": "Logged out successfully"}

# ── Get Me ───────────────────────────────────────────────
@router.get("/me")
def get_me(request: Request):
    user = get_current_user(request)
    return {"status": True, "result": user}

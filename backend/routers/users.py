from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from database import get_db
from auth_utils import get_current_user, require_admin
from typing import Optional, List

router = APIRouter()

class UpdateProfileModel(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    resume: Optional[str] = None

# ── Get All Users (Admin only) ──
@router.get("/all")
def get_all_users(request: Request):
    require_admin(request)
    db = get_db()
    users = list(db.vgulg_users.find({}, {"password": 0}))
    return {"status": True, "result": users}

# ── Get Single User ──
@router.get("/{user_id}")
def get_user(user_id: str, request: Request):
    get_current_user(request)
    db = get_db()
    user = db.vgulg_users.find_one({"_id": user_id}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": True, "result": user}

# ── Update Profile ──
@router.put("/update/{user_id}")
def update_user(user_id: str, data: UpdateProfileModel, request: Request):
    current = get_current_user(request)
    if current["_id"] != user_id and current["role"] != "admin":
        raise HTTPException(status_code=403, detail="No permission to update this profile.")
    db = get_db()
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    db.vgulg_users.update_one({"_id": user_id}, {"$set": update_data})
    updated = db.vgulg_users.find_one({"_id": user_id}, {"password": 0})
    return {"status": True, "message": "Profile updated.", "result": updated}

# ── Delete User (Admin only) ──
@router.delete("/delete/{user_id}")
def delete_user(user_id: str, request: Request):
    require_admin(request)
    db = get_db()
    db.vgulg_users.delete_one({"_id": user_id})
    return {"status": True, "message": "User deleted."}

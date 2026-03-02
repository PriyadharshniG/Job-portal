from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Request, HTTPException
from database import get_db
import os

SECRET_KEY = os.getenv("JWT_SECRET", "vgulg_foundation_secret_key_2026")
ALGORITHM = "HS256"

def create_token(data: dict, expire_days: int = 1):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=expire_days)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def get_current_user(request: Request):
    token = request.cookies.get("vgulg_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated. Please login.")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    db = get_db()
    user = db.vgulg_users.find_one({"_id": payload["id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")
    user.pop("password", None)
    return user

def require_admin(request: Request):
    user = get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user

def require_recruiter_or_admin(request: Request):
    user = get_current_user(request)
    if user.get("role") not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Recruiter or Admin access required.")
    return user

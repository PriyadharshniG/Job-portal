"""
VGULG Foundation Job Portal - Database Seed Script
Run this ONCE before starting the server to populate Foundation IDs and Admin account.

Usage: python seed.py
"""
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/jobportal")
db_name = MONGO_URI.split("/")[-1].split("?")[0]

print(f"Connecting to MongoDB: {MONGO_URI}")
print(f"Database: {db_name}")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    print("✅ MongoDB Connected")
except Exception as e:
    print(f"❌ Could not connect to MongoDB: {e}")
    exit(1)

db = client[db_name]
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Seed Foundation IDs ───────────────────────────────────
print("\nSeeding Foundation IDs...")
foundation_ids = [
    {"foundation_id": "VGULG-001", "member_name": "Admin User"},
    {"foundation_id": "VGULG-002", "member_name": "Recruiter One"},
    {"foundation_id": "VGULG-003", "member_name": "Member One"},
    {"foundation_id": "VGULG-004", "member_name": "Member Two"},
    {"foundation_id": "VGULG-005", "member_name": "Volunteer One"},
    {"foundation_id": "VGULG-006", "member_name": "Recruiter Two"},
    {"foundation_id": "VGULG-007", "member_name": "Reserved Slot 7"},
    {"foundation_id": "VGULG-008", "member_name": "Reserved Slot 8"},
]

for fid in foundation_ids:
    if not db.foundation_ids.find_one({"foundation_id": fid["foundation_id"]}):
        db.foundation_ids.insert_one(fid)
        print(f"  Added: {fid['foundation_id']}")
    else:
        print(f"  Already exists: {fid['foundation_id']}")

# ── Seed Admin Account ────────────────────────────────────
print("\nCreating admin account...")
if not db.vgulg_users.find_one({"foundation_id": "VGULG-001"}):
    admin = {
        "username": "VGULGAdmin",
        "foundation_id": "VGULG-001",
        "email": "admin@vgulg.org",
        "password": pwd_ctx.hash("Admin@123456"),
        "role": "admin",
        "is_approved": True,
        "skills": ["Management", "Python", "Leadership"],
        "education": "B.Tech Computer Science",
        "experience": "5 years",
        "location": "Foundation HQ",
        "resume": "",
        "bio": "VGULG Foundation Admin",
        "created_at": datetime.utcnow(),
    }
    db.vgulg_users.insert_one(admin)
    print("✅ Admin created")
else:
    print("⚡ Admin already exists (skipped)")

print()
print("=" * 55)
print("🎉 SEED COMPLETE! You can now login with:")
print("   Foundation ID : VGULG-001")
print("   Password      : Admin@123456")
print("=" * 55)
print("\nAvailable Foundation IDs for registration:")
for fid in foundation_ids:
    print(f"  {fid['foundation_id']} — {fid['member_name']}")

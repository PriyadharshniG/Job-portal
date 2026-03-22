import requests

base_url = "http://localhost:8000/api/v1/auth"

# Test Registration
reg_data = {
    "username": "TestUser",
    "foundation_id": "VGLUG-002",
    "email": "test@vglug.org",
    "password": "Password123"
}
r = requests.post(f"{base_url}/register", json=reg_data)
print("Register response:", r.status_code, r.text)

# Test Login
login_data = {
    "foundation_id": "VGLUG-002",
    "password": "Password123"
}
l = requests.post(f"{base_url}/login", json=login_data)
print("Login response:", l.status_code, l.text)

# Test Admin
admin_data = {
    "foundation_id": "VGLUG-001",
    "password": "Admin@123456"
}
admin_l = requests.post(f"{base_url}/login", json=admin_data)
print("Admin Login:", admin_l.status_code, admin_l.text)

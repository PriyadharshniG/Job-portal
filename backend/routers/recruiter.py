"""recruiter.py — Recruiter-specific features router.

Handles:
  - Candidate search by skills / name / foundation_id
  - View full candidate profile
  - AI-based screening question generation
  - Export applications to CSV (Excel-compatible)
"""

from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import StreamingResponse
from database import get_db
from auth_utils import get_current_user, require_recruiter_or_admin
from typing import Optional, List
from pydantic import BaseModel
import io, csv, re

router = APIRouter()

# ─────────────────────────────────────────────────────────
# 1. CANDIDATE SEARCH BY SKILLS / NAME / ID
# ─────────────────────────────────────────────────────────

@router.get("/candidates/search")
def search_candidates(
    request: Request,
    skill: Optional[str] = None,
    name: Optional[str] = None,
    foundation_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    """Search for candidates (role=user) by skills, name, or foundation_id.
    Skill search checks BOTH manual `skills` and AI-extracted `resume_skills`.
    """
    require_recruiter_or_admin(request)
    db = get_db()

    query: dict = {"role": "user"}

    if skill:
        # Match skill in either manual skills OR resume_skills extracted from uploaded resume
        skill_regex = {"$regex": skill.strip(), "$options": "i"}
        query["$or"] = [
            {"skills": {"$elemMatch": skill_regex}},
            {"resume_skills": {"$elemMatch": skill_regex}},
        ]
    if name:
        query["username"] = {"$regex": name.strip(), "$options": "i"}
    if foundation_id:
        query["foundation_id"] = {"$regex": foundation_id.strip().upper(), "$options": "i"}

    all_candidates = list(
        db.vgulg_users.find(query, {
            "password": 0,
        }).sort("created_at", -1)
    )
    total = len(all_candidates)
    candidates = all_candidates[(page - 1) * limit: page * limit]

    return {
        "status": True,
        "result": candidates,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


# ─────────────────────────────────────────────────────────
# 2. VIEW FULL CANDIDATE PROFILE
# ─────────────────────────────────────────────────────────

@router.get("/candidates/{user_id}")
def get_candidate(user_id: str, request: Request):
    """Get a candidate's full (safe) profile."""
    require_recruiter_or_admin(request)
    db = get_db()
    candidate = db.vgulg_users.find_one({"_id": user_id, "role": "user"}, {"password": 0})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return {"status": True, "result": candidate}


# ─────────────────────────────────────────────────────────
# 3. AI SCREENING QUESTION GENERATOR
# ─────────────────────────────────────────────────────────

# Skill-specific question banks
SKILL_QUESTIONS: dict = {
    "python": [
        "Explain the difference between a list and a tuple in Python.",
        "What are Python decorators and when would you use them?",
        "How does Python's GIL (Global Interpreter Lock) affect multithreading?",
        "What is the difference between *args and **kwargs?",
        "Explain list comprehensions and their advantages over loops.",
        "What are Python generators and how do they differ from regular functions?",
    ],
    "javascript": [
        "Explain the concept of closures in JavaScript with an example.",
        "What is the difference between `let`, `const`, and `var`?",
        "How does the event loop work in JavaScript?",
        "What are Promises and how do they differ from async/await?",
        "Explain prototypal inheritance in JavaScript.",
        "What is the difference between `==` and `===`?",
    ],
    "react": [
        "What is the Virtual DOM and how does React use it?",
        "Explain the difference between `useState` and `useEffect`.",
        "What are React hooks? Name 5 built-in hooks.",
        "How does React's reconciliation algorithm work?",
        "What is the difference between controlled and uncontrolled components?",
        "Explain Context API and when to use it over prop drilling.",
    ],
    "node": [
        "What is the event-driven, non-blocking I/O model in Node.js?",
        "Explain the difference between `require` and `import` in Node.js.",
        "How do you handle errors in async Node.js code?",
        "What is the `package.json` and what key fields does it contain?",
        "How does Node.js handle concurrent requests with a single thread?",
    ],
    "mongodb": [
        "What is the difference between SQL and NoSQL databases?",
        "Explain MongoDB's document model and BSON format.",
        "What are indexes in MongoDB and why are they important?",
        "How do you perform aggregation in MongoDB?",
        "What is the difference between `find()` and `findOne()`?",
    ],
    "mysql": [
        "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?",
        "Explain database normalization and the first three normal forms.",
        "What are indexes and when should you use them?",
        "How does a transaction work and what are ACID properties?",
        "What is the difference between `HAVING` and `WHERE` clauses?",
    ],
    "java": [
        "What is the difference between an abstract class and an interface in Java?",
        "Explain Java's memory model: heap vs stack.",
        "What is polymorphism? Give a real-world example.",
        "How does Java's garbage collection work?",
        "What are checked vs unchecked exceptions?",
    ],
    "machine learning": [
        "Explain the bias-variance tradeoff in machine learning.",
        "What is the difference between supervised and unsupervised learning?",
        "How do you handle imbalanced datasets?",
        "Explain cross-validation and why it is used.",
        "What is overfitting and how do you prevent it?",
    ],
    "docker": [
        "What is the difference between a Docker container and a virtual machine?",
        "Explain the purpose of a Dockerfile and its key instructions.",
        "How do Docker volumes work and when would you use them?",
        "What is Docker Compose and when would you use it?",
        "How do you reduce the size of a Docker image?",
    ],
    "aws": [
        "What is the difference between EC2 and Lambda?",
        "Explain S3 storage classes and when to use each.",
        "What is IAM and why is it important for AWS security?",
        "How does auto-scaling work in AWS?",
        "What is the difference between RDS and DynamoDB?",
    ],
    "django": [
        "Explain the MTV (Model-Template-View) architecture in Django.",
        "How does Django's ORM work? Give an example query.",
        "What are Django signals and when would you use them?",
        "How do you handle authentication in Django?",
        "What is `manage.py` and name 5 commonly used commands.",
    ],
    "fastapi": [
        "What makes FastAPI faster than Flask?",
        "How do you define request models using Pydantic in FastAPI?",
        "Explain dependency injection in FastAPI.",
        "How do you handle file uploads in FastAPI?",
        "What is the difference between `async def` and `def` routes in FastAPI?",
    ],
    "git": [
        "What is the difference between `git merge` and `git rebase`?",
        "How do you undo a commit that has already been pushed?",
        "Explain the Git branching model (Gitflow).",
        "What is the difference between `git fetch` and `git pull`?",
        "How do you resolve merge conflicts in Git?",
    ],
    "linux": [
        "What is the difference between a process and a thread in Linux?",
        "How do you check disk usage and running processes in Linux?",
        "Explain file permissions in Linux (chmod, chown).",
        "What is a cron job and how do you set one up?",
        "How does the Linux boot process work?",
    ],
    "typescript": [
        "What are the key differences between TypeScript and JavaScript?",
        "Explain the concept of type inference in TypeScript.",
        "What are generics in TypeScript? Give an example.",
        "How do you define an interface vs a type alias in TypeScript?",
        "What is the `unknown` type and how does it differ from `any`?",
    ],
}

# Generic behavioral questions (role-specific variants added below)
BEHAVIORAL_QUESTIONS = [
    "Tell me about a challenging project you worked on and how you overcame obstacles.",
    "Describe a time when you had to learn a new technology quickly.",
    "How do you prioritize tasks when working on multiple deadlines?",
    "Tell me about a time you received critical feedback. How did you respond?",
    "Describe a situation where you worked effectively in a team.",
    "How do you stay updated with the latest trends in your field?",
    "Describe a situation where you had to explain a complex technical concept to a non-technical person.",
]

GENERIC_TECHNICAL = [
    "What is version control and why is it important in software development?",
    "Explain the difference between REST and GraphQL APIs.",
    "What is the difference between synchronous and asynchronous programming?",
    "How do you approach debugging a production issue?",
    "What are the SOLID principles of software design?",
    "How do you ensure code quality in a project?",
    "What is CI/CD and why is it important?",
    "Explain the concept of code review and its benefits.",
    "What is the difference between unit testing and integration testing?",
]

# ── Position-to-skill keyword mapper ─────────────────────
# Maps job title keywords → list of SKILL_QUESTIONS keys to prioritize
POSITION_SKILL_MAP = {
    # Frontend
    "frontend":        ["javascript", "typescript", "react", "html", "css"],
    "front end":       ["javascript", "typescript", "react", "html", "css"],
    "ui developer":    ["javascript", "react", "typescript", "html", "css"],
    "react developer": ["react", "javascript", "typescript", "node"],
    "angular":         ["javascript", "typescript"],
    "vue":             ["javascript", "typescript"],
    "web developer":   ["javascript", "react", "html", "css", "typescript"],

    # Backend
    "backend":           ["python", "java", "node", "django", "fastapi", "mysql", "mongodb"],
    "back end":          ["python", "java", "node", "django", "fastapi", "mysql", "mongodb"],
    "api developer":     ["python", "fastapi", "django", "node", "mysql", "mongodb"],
    "django developer":  ["django", "python", "mysql", "mongodb"],
    "fastapi":           ["fastapi", "python", "mongodb"],
    "node developer":    ["node", "javascript", "mongodb", "mysql"],
    "java developer":    ["java", "mysql", "mongodb"],
    "spring":            ["java", "mysql"],
    "php":               ["mysql"],

    # Full Stack
    "full stack":  ["javascript", "react", "node", "python", "mongodb", "mysql"],
    "fullstack":   ["javascript", "react", "node", "python", "mongodb", "mysql"],
    "mern":        ["mongodb", "react", "node", "javascript"],
    "mean":        ["mongodb", "javascript", "node"],

    # Data / AI / ML
    "data scientist":    ["python", "machine learning", "pandas", "numpy", "mysql"],
    "data science":      ["python", "machine learning", "pandas", "numpy"],
    "machine learning":  ["machine learning", "python", "pandas", "numpy"],
    "ml engineer":       ["machine learning", "python", "docker", "aws"],
    "ai engineer":       ["machine learning", "python", "docker"],
    "data analyst":      ["python", "mysql", "pandas", "numpy"],
    "data engineer":     ["python", "mysql", "mongodb", "docker", "aws"],
    "nlp":               ["python", "machine learning"],
    "deep learning":     ["python", "machine learning"],

    # DevOps / Cloud
    "devops":       ["docker", "linux", "git", "aws"],
    "cloud":        ["aws", "docker", "linux"],
    "aws":          ["aws", "docker", "linux"],
    "sre":          ["linux", "docker", "aws", "git"],
    "infrastructure": ["linux", "docker", "aws"],
    "kubernetes":   ["docker", "linux", "aws"],

    # Mobile
    "android":        ["java"],
    "ios":            ["swift"],
    "flutter":        ["dart"],
    "mobile":         ["java", "dart"],
    "react native":   ["javascript", "react"],

    # Database
    "database":    ["mysql", "mongodb"],
    "dba":         ["mysql", "mongodb"],
    "sql":         ["mysql"],

    # QA / Testing
    "qa engineer":   ["python", "git", "linux"],
    "test engineer": ["python", "git"],
    "automation":    ["python", "git"],
    "tester":        ["python", "git"],

    # General Software
    "software engineer":   ["python", "java", "git", "mysql", "mongodb"],
    "software developer":  ["python", "java", "javascript", "git"],
    "programmer":          ["python", "java", "javascript", "git"],
    "developer":           ["javascript", "python", "git", "mysql"],
}

# ── Position-specific question banks ─────────────────────
POSITION_QUESTIONS = {
    "frontend": [
        "What is the difference between CSS Flexbox and CSS Grid? When would you use each?",
        "Explain how the browser renders a webpage (critical rendering path).",
        "What are Web Accessibility (a11y) best practices and why do they matter?",
        "What is responsive design and how do you implement it?",
        "Explain the difference between `localStorage`, `sessionStorage`, and cookies.",
        "What is CORS and how do you handle it in a frontend application?",
        "How do you optimize a web application for performance?",
        "What is lazy loading and how does it improve performance?",
    ],
    "backend": [
        "What is the difference between authentication and authorization?",
        "Explain RESTful API design principles and best practices.",
        "How do you handle database transactions to ensure data consistency?",
        "What is rate limiting and why is it important for APIs?",
        "Explain the concept of middleware in a web framework.",
        "How would you design a scalable microservices architecture?",
        "What is connection pooling and why is it important for databases?",
        "How do you secure an API against common vulnerabilities (OWASP Top 10)?",
    ],
    "fullstack": [
        "Explain the MVC (Model-View-Controller) architecture pattern.",
        "How do you manage state in a full-stack application?",
        "What is the difference between server-side rendering and client-side rendering?",
        "How do you handle API versioning in a full-stack application?",
        "Explain the concept of JWT authentication across frontend and backend.",
        "What is a monorepo and what are its advantages for full-stack development?",
    ],
    "data_science": [
        "Explain the difference between a classification and a regression problem.",
        "What is feature engineering and why is it important?",
        "How do you handle missing values in a dataset?",
        "Explain the concept of a confusion matrix and how to interpret it.",
        "What is the difference between bagging and boosting in ensemble methods?",
        "How do you evaluate a machine learning model beyond just accuracy?",
        "What is dimensionality reduction and when would you use PCA?",
        "Explain the difference between L1 and L2 regularization.",
    ],
    "data_analyst": [
        "Explain the difference between OLAP and OLTP systems.",
        "What is data normalization and why is it important?",
        "How do you identify and handle outliers in a dataset?",
        "What is the difference between a star schema and a snowflake schema in data warehousing?",
        "Explain the concept of A/B testing and how you would design one.",
        "How do you use SQL window functions? Give an example.",
        "What is the difference between correlation and causation?",
        "How would you visualize a large multi-dimensional dataset?",
    ],
    "devops": [
        "Explain the difference between blue-green deployment and canary deployment.",
        "What is Infrastructure as Code (IaC) and what tools do you use for it?",
        "How does a load balancer work and what are the different types?",
        "Explain the concept of container orchestration and why Kubernetes is popular.",
        "What is observability and what are its three pillars (metrics, logs, traces)?",
        "How do you implement a CI/CD pipeline from scratch?",
        "What is the difference between horizontal and vertical scaling?",
        "Explain the concept of service mesh and when you would use one.",
    ],
    "mobile": [
        "What is the difference between native, hybrid, and cross-platform mobile development?",
        "How do you handle offline functionality in a mobile app?",
        "Explain the mobile application lifecycle.",
        "How do you optimize battery and memory usage in a mobile app?",
        "What are push notifications and how do they work?",
        "How do you handle different screen sizes and resolutions in mobile development?",
    ],
    "qa": [
        "What is the difference between black-box and white-box testing?",
        "Explain the test pyramid and the different levels of testing.",
        "How do you approach writing test cases for a new feature?",
        "What is regression testing and why is it important?",
        "How do you perform performance/load testing on an application?",
        "What is the difference between functional and non-functional testing?",
        "Explain what a test plan and test strategy document should contain.",
    ],
    "general": [
        "What are the key differences between object-oriented and functional programming?",
        "Explain the concept of design patterns. Name and describe 3 common ones.",
        "How do you approach learning a new programming language or framework?",
        "What is technical debt and how do you manage it?",
        "How do you handle disagreements with teammates about technical decisions?",
        "Describe your experience with Agile/Scrum methodology.",
        "What is your approach to writing clean, maintainable code?",
        "How do you approach system design for a new application?",
    ],
}

# ── Difficulty-aware question selection ───────────────────
DIFFICULTY_FOLLOWUPS = {
    "easy": [
        "What is the difference between a compiled and interpreted language?",
        "What is an API? Give a simple example.",
        "What does HTML stand for and what is its purpose?",
        "What is a database and why do we use it?",
        "What is the difference between a frontend and backend developer?",
    ],
    "hard": [
        "How would you design a distributed cache system that handles millions of requests per second?",
        "Explain the CAP theorem and its implications for distributed systems.",
        "How do you handle race conditions and deadlocks in a concurrent application?",
        "Design a real-time notification system that scales to 10 million users.",
        "Explain the concept of event sourcing and CQRS pattern.",
    ],
}


def infer_skills_from_position(position: str) -> List[str]:
    """Extract implied skill categories from job position title."""
    pos_lower = position.lower()
    inferred = []
    for keyword, skill_keys in POSITION_SKILL_MAP.items():
        if keyword in pos_lower:
            for sk in skill_keys:
                if sk not in inferred:
                    inferred.append(sk)
    return inferred


def get_position_category(position: str) -> str:
    """Classify position into a broad category for position-specific questions."""
    pos_lower = position.lower()
    if any(k in pos_lower for k in ["frontend", "front end", "react", "angular", "vue", "ui dev"]):
        return "frontend"
    if any(k in pos_lower for k in ["backend", "back end", "api", "django", "fastapi", "node dev", "java dev"]):
        return "backend"
    if any(k in pos_lower for k in ["full stack", "fullstack", "mern", "mean"]):
        return "fullstack"
    if any(k in pos_lower for k in ["data scien", "machine learn", "ml engineer", "ai engineer", "nlp", "deep learn"]):
        return "data_science"
    if any(k in pos_lower for k in ["data analyst", "data analysis", "business analyst"]):
        return "data_analyst"
    if any(k in pos_lower for k in ["devops", "cloud", "sre", "infrastructure", "kubernetes"]):
        return "devops"
    if any(k in pos_lower for k in ["android", "ios", "flutter", "mobile", "react native"]):
        return "mobile"
    if any(k in pos_lower for k in ["qa", "quality", "tester", "automation test"]):
        return "qa"
    return "general"


def generate_screening_questions(
    skills: List[str],
    position: str,
    description: str,
    difficulty: str = "medium",
    count: int = 10,
) -> List[dict]:
    """Generate position-aware screening questions."""
    import random
    selected: List[dict] = []
    used: set = set()

    def add_q(question, q_type, skill, diff=difficulty):
        if question not in used:
            selected.append({"question": question, "type": q_type, "skill": skill, "difficulty": diff})
            used.add(question)

    # ── Step 1: Position-specific questions (highest priority) ──
    pos_category = get_position_category(position)
    pos_pool = POSITION_QUESTIONS.get(pos_category, POSITION_QUESTIONS["general"])[:]
    random.shuffle(pos_pool)
    pos_quota = min(4, count // 2)  # up to 4 position-specific questions
    for q in pos_pool[:pos_quota]:
        add_q(q, "technical", pos_category.replace("_", " ").title())

    # ── Step 2: Infer skills from position if none provided ──
    effective_skills = list(skills)
    if not effective_skills:
        effective_skills = infer_skills_from_position(position)

    # Always merge position-inferred skills (may add extras)
    inferred = infer_skills_from_position(position)
    for sk in inferred:
        if sk not in [s.lower() for s in effective_skills]:
            effective_skills.append(sk)

    # ── Step 3: Skill-specific questions ──
    skill_pool = []
    for skill in effective_skills:
        skill_key = skill.lower().strip()
        for key, questions in SKILL_QUESTIONS.items():
            if key in skill_key or skill_key in key:
                for q in questions:
                    if q not in used:
                        skill_pool.append((q, skill, key))
    random.shuffle(skill_pool)
    skill_quota = count - len(selected) - 3  # reserve 3 for behavioral
    for q, skill_label, key in skill_pool[:max(skill_quota, 0)]:
        add_q(q, "technical", skill_label)

    # ── Step 4: Difficulty-specific fill-up ──
    if difficulty in DIFFICULTY_FOLLOWUPS and len(selected) < count - 3:
        diff_pool = DIFFICULTY_FOLLOWUPS[difficulty][:]
        random.shuffle(diff_pool)
        for q in diff_pool:
            if len(selected) >= count - 3:
                break
            add_q(q, "technical", "General", difficulty)

    # ── Step 5: Generic technical fill ──
    if len(selected) < count - 3:
        generic_pool = GENERIC_TECHNICAL[:]
        random.shuffle(generic_pool)
        for q in generic_pool:
            if len(selected) >= count - 3:
                break
            add_q(q, "technical", "General", "medium")

    # ── Step 6: Behavioral questions (always last 2-3) ──
    behavioral_pool = BEHAVIORAL_QUESTIONS[:]
    random.shuffle(behavioral_pool)
    for q in behavioral_pool[:min(3, count - len(selected))]:
        add_q(q, "behavioral", "Soft Skills", "medium")

    return selected[:count]


class ScreeningQRequest(BaseModel):
    job_id: Optional[str] = None
    position: str
    skills: List[str] = []
    description: Optional[str] = ""
    difficulty: Optional[str] = "medium"   # easy | medium | hard
    count: Optional[int] = 10


@router.post("/screening-questions")
def generate_questions(data: ScreeningQRequest, request: Request):
    """Generate AI-based screening questions for a job."""
    require_recruiter_or_admin(request)

    if data.count < 1 or data.count > 30:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 30.")
    if data.difficulty not in ["easy", "medium", "hard"]:
        raise HTTPException(status_code=400, detail="Difficulty must be easy, medium, or hard.")

    # Optionally fetch job details from DB
    db = get_db()
    skills = data.skills
    description = data.description or ""
    position = data.position

    if data.job_id and not skills:
        job = db.vgulg_jobs.find_one({"_id": data.job_id})
        if job:
            skills = job.get("job_skills", [])
            description = job.get("job_description", "")
            position = job.get("position", position)

    questions = generate_screening_questions(
        skills=skills,
        position=position,
        description=description,
        difficulty=data.difficulty,
        count=data.count,
    )

    return {
        "status": True,
        "position": position,
        "skills_analyzed": skills,
        "total": len(questions),
        "questions": questions,
    }


# ─────────────────────────────────────────────────────────
# 4. EXPORT APPLICATIONS TO CSV (Excel-compatible)
# ─────────────────────────────────────────────────────────

@router.get("/applications/export")
def export_applications_csv(request: Request, job_id: Optional[str] = None):
    """Export recruiter's applications as a CSV file (opens in Excel)."""
    user = require_recruiter_or_admin(request)
    db = get_db()

    query: dict = {}
    if user.get("role") == "recruiter":
        query["created_by"] = user["_id"]
    if job_id:
        query["job_id"] = job_id

    apps = list(db.vgulg_applications.find(query).sort("applied_at", -1))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "#", "Applicant Name", "Foundation ID", "Email",
        "Job Position", "Company", "Applied On", "Status",
        "Rejected By", "Resume URL",
    ])

    for i, app in enumerate(apps, 1):
        # Try to get email from user record
        u = db.vgulg_users.find_one({"_id": app.get("user_id", "")}, {"email": 1})
        email = u.get("email", "") if u else ""
        applied_at = app.get("applied_at", "")[:10] if app.get("applied_at") else ""
        resume = f"https://job-portal-jk38.onrender.com{app.get('resume_url', '')}" if app.get("resume_url") else ""
        writer.writerow([
            i,
            app.get("username", ""),
            app.get("foundation_id", ""),
            email,
            app.get("position", ""),
            app.get("company", ""),
            applied_at,
            app.get("status", "pending"),
            app.get("rejected_by_name", ""),
            resume,
        ])

    output.seek(0)
    filename = f"applications_export.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─────────────────────────────────────────────────────────
# 5. RECRUITER PROFILE UPDATE (company details)
# ─────────────────────────────────────────────────────────

class RecruiterProfileModel(BaseModel):
    username: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

@router.put("/profile/update")
def update_recruiter_profile(data: RecruiterProfileModel, request: Request):
    """Update recruiter profile including company details."""
    user = require_recruiter_or_admin(request)
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    db = get_db()
    db.vgulg_users.update_one({"_id": user["_id"]}, {"$set": update_data})
    updated = db.vgulg_users.find_one({"_id": user["_id"]}, {"password": 0})
    return {"status": True, "message": "Recruiter profile updated.", "result": updated}

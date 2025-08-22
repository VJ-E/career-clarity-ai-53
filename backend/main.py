# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import fitz  # PyMuPDF
import io
import re

app = FastAPI(title="Resume AI Backend")

# Allow all origins for local dev - tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple regexes
EMAIL_RE = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_RE = re.compile(r'(\+?\d[\d\-\s]{6,}\d)')

# headings we try to detect for basic section extraction
HEADINGS = [
    "summary", "objective",
    "skills", "technical skills",
    "experience", "work experience",
    "projects", "education", "certifications"
]

def extract_text_from_pdf(bytes_data: bytes) -> str:
    doc = fitz.open(stream=bytes_data, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    return "\n".join(pages)

def extract_text_from_docx(bytes_data: bytes) -> str:
    from docx import Document
    fh = io.BytesIO(bytes_data)
    doc = Document(fh)
    paras = [p.text for p in doc.paragraphs if p.text]
    return "\n".join(paras)

def extract_text_from_txt(bytes_data: bytes) -> str:
    return bytes_data.decode('utf-8', errors='ignore')

def extract_email(text: str):
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None

def extract_phone(text: str):
    m = PHONE_RE.search(text)
    return m.group(0) if m else None

def find_sections(text: str) -> Dict[str, str]:
    low = text.lower()
    positions = {}
    for h in HEADINGS:
        idx = low.find(h)
        if idx != -1:
            positions[h] = idx
    # sort headings by position and slice out blocks
    items = sorted(positions.items(), key=lambda x: x[1])
    sections = {}
    for i, (h, pos) in enumerate(items):
        start = pos
        end = items[i+1][1] if i+1 < len(items) else len(text)
        sections[h] = text[start:end].strip()
    return sections

def extract_skills_from_section(secs: Dict[str, str]):
    skills = []
    for k in ['technical skills', 'skills']:
        if k in secs:
            s = secs[k]
            # simple split on newlines, commas and bullets
            parts = re.split(r'[\n,•\-;]+', s)
            for p in parts:
                p = p.strip()
                if p and len(p) <= 60:
                    skills.append(p)
            break
    return skills

@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Accepts a file upload (PDF/DOCX/TXT). Returns JSON:
    {
      "text": "...",
      "contact": {"email": "...", "phone": "..."},
      "sections": { "skills": "...", "experience": "...", ... },
      "skills": ["skill1", "skill2", ...]
    }
    """
    try:
        contents = await file.read()
        filename = (file.filename or "").lower()
        # Choose extractor by extension/content-type
        if filename.endswith(".pdf") or file.content_type == "application/pdf":
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx") or file.content_type in (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"):
            text = extract_text_from_docx(contents)
        elif filename.endswith(".txt") or (file.content_type and file.content_type.startswith("text")):
            text = extract_text_from_txt(contents)
        else:
            # best-effort: try PDF then txt
            try:
                text = extract_text_from_pdf(contents)
            except Exception:
                text = extract_text_from_txt(contents)

        email = extract_email(text) or ""
        phone = extract_phone(text) or ""
        sections = find_sections(text)
        skills = extract_skills_from_section(sections)

        return {
            "text": text,
            "contact": {"email": email, "phone": phone},
            "sections": sections,
            "skills": skills,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- ROLE CLASSIFIER ----
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# load a small, efficient model
sbert_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# simple role descriptions to compare against
ROLE_DESCRIPTIONS = {
    "Software Engineer": "Writes, tests, and maintains software applications using programming languages and frameworks.",
    "Data Scientist": "Analyzes datasets using machine learning, statistics, and data visualization.",
    "Machine Learning Engineer": "Builds and deploys machine learning models in production systems.",
    "Frontend Developer": "Builds responsive and interactive user interfaces with HTML, CSS, and JavaScript.",
    "Backend Developer": "Designs APIs, databases, and server-side systems for scalable applications.",
    "DevOps Engineer": "Manages deployment, CI/CD pipelines, cloud infrastructure, and automation.",
    "Business Analyst": "Analyzes business requirements, prepares reports, and bridges between stakeholders and developers.",
    "Product Manager": "Defines product vision, gathers requirements, and manages product lifecycle."
}

role_texts = list(ROLE_DESCRIPTIONS.values())
role_names = list(ROLE_DESCRIPTIONS.keys())
role_embeddings = sbert_model.encode(role_texts, convert_to_tensor=True)

@app.post("/classify_resume")
async def classify_resume(payload: Dict[str, str]):
    """
    Input: {"text": "...resume text..."}
    Output: Top 3 predicted roles with confidence scores
    """
    resume_text = payload.get("text", "")
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Missing resume text")

    emb_resume = sbert_model.encode([resume_text])
    sims = cosine_similarity(emb_resume, role_embeddings)[0]

    # get top 3
    scored = list(zip(role_names, sims))
    scored.sort(key=lambda x: x[1], reverse=True)
    top3 = [{"role": r, "confidence": round(float(s)*100, 2)} for r, s in scored[:3]]

    return {"classifications": top3}



# ---- SKILL GAP ANALYSIS ----

# small role-to-skills knowledge base (tiny + easy to expand later)
ROLE_SKILLS = {
    "Software Engineer": ["Python", "Java", "C++", "Git", "SQL", "Algorithms", "Data Structures"],
    "Data Scientist": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "Statistics", "Data Visualization"],
    "Machine Learning Engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "ML Ops", "FastAPI", "Docker", "Cloud"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "UI/UX"],
    "Backend Developer": ["Python", "Java", "Node.js", "Databases", "APIs", "FastAPI", "Django", "SQL", "Docker"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "Terraform"],
    "Business Analyst": ["Excel", "SQL", "Power BI", "Tableau", "Business Process", "Requirements Analysis"],
    "Product Manager": ["Agile", "Scrum", "Roadmap", "Stakeholder Management", "Market Research"]
}

from pydantic import BaseModel
from typing import List

class SkillGapInput(BaseModel):
    role: str
    skills: List[str]

@app.post("/skill_gap")
async def skill_gap(payload: SkillGapInput):
    role = payload.role
    resume_skills = payload.skills

    if role not in ROLE_SKILLS:
        raise HTTPException(status_code=400, detail=f"Role '{role}' not supported")

    expected = set([s.lower() for s in ROLE_SKILLS[role]])
    present = set([s.lower() for s in resume_skills])

    missing = [s for s in expected if s not in present]

    return {
        "role": role,
        "given_skills": resume_skills,
        "expected_skills": ROLE_SKILLS[role],
        "missing_skills": missing,
        "recommendations": [
            f"Consider adding {s} experience to your resume/projects." for s in missing
        ]
    }



# ---- ATS SCORING ----
import re
from collections import Counter
from pydantic import BaseModel
from typing import List, Dict

class ATSInput(BaseModel):
    resume_text: str
    job_description: str

@app.post("/ats_score")
async def ats_score(payload: ATSInput):
    """
    Input: {"resume_text": "...", "job_description": "..."}
    Output: ATS score %, matched skills, missing skills, and suggestions
    """

    resume_text = payload.resume_text.lower()
    jd_text = payload.job_description.lower()

    # very simple keyword extraction (split into words, filter alphabetic only)
    def extract_keywords(text: str):
        words = re.findall(r"[a-zA-Z]+", text)
        # basic stopwords list
        stopwords = {"and","or","with","in","the","to","for","a","of","on","at","is","as","by","an"}
        return [w for w in words if w not in stopwords and len(w) > 2]

    resume_words = extract_keywords(resume_text)
    jd_words = extract_keywords(jd_text)

    # count frequency of JD keywords
    jd_counter = Counter(jd_words)
    resume_counter = Counter(resume_words)

    # matched keywords
    matched = [w for w in jd_counter if w in resume_counter]
    missing = [w for w in jd_counter if w not in resume_counter]

    # ATS score: ratio of matched keywords to total JD keywords (unique words)
    score = round(len(matched) / max(len(set(jd_words)), 1) * 100, 2)

    return {
        "ats_score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": [
            f"Consider including the keyword '{w}' if relevant to your experience."
            for w in missing[:10]  # top 10 missing keywords
        ]
    }

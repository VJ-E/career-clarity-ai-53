import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const API_BASE = "http://localhost:8000"; // backend FastAPI URL

// Parse Resume (PDF/Text upload already done in ResumeUpload)
export async function parseResume(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/parse_resume`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to parse resume");
  return res.json();
}

// Classify Resume
export async function classifyResume(text: string) {
  const res = await fetch(`${API_BASE}/classify_resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to classify resume");
  return res.json();
}

// Skill Gap
export async function skillGap(role: string, skills: string[]) {
  const res = await fetch(`${API_BASE}/skill_gap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, skills }),
  });
  if (!res.ok) throw new Error("Failed to analyze skill gap");
  return res.json();
}

// ATS Score
export async function atsScore(resume_text: string, job_description: string) {
  const res = await fetch(`${API_BASE}/ats_score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text, job_description }),
  });
  if (!res.ok) throw new Error("Failed to calculate ATS score");
  return res.json();
}

// ATS utility functions
export const KEYWORDS = [
  "lead",
  "manage",
  "develop",
  "project",
  "team",
  "design",
  "implement",
  "optimize",
  "strategic",
  "analysis",
];

export function calculateScore(text: string): number {
  const lower = text.toLowerCase();
  const possible = KEYWORDS.length;
  const distinctMatched = KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return Math.round((distinctMatched / possible) * 100);
}

export function generatePlainText(resume: any): string {
  const parts: string[] = [];
  if (resume.professionalSummary) parts.push(resume.professionalSummary);
  if (Array.isArray(resume.skills)) parts.push(resume.skills.join(" "));
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((exp: any) => {
      if (exp.title) parts.push(exp.title);
      if (exp.description) parts.push(exp.description);
    });
  }
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach((proj: any) => {
      if (proj.name) parts.push(proj.name);
      if (proj.description) parts.push(proj.description);
    });
  }
  return parts.join(" ");
}

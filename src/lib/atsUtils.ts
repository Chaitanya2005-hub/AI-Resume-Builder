// ATS utility functions
import { marked } from 'marked';
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

// Types for resume data
export interface ResumeData {
  professionalSummary?: string;
  skills?: string[];
  experience?: Array<{ title?: string; description?: string }>;
  projects?: Array<{ name?: string; description?: string }>;
  education?: Array<{ institution?: string; degree?: string; year?: string }>;
}

/**
 * Generate a markdown formatted resume from the given data.
 * @param data ResumeData object containing various sections.
 * @returns Markdown string representing the resume.
 */
export function generateResume(data: ResumeData): string {
  const sections: string[] = [];
  if (data.professionalSummary) {
    sections.push(`## Professional Summary\n${data.professionalSummary}\n`);
  }
  if (data.skills && data.skills.length) {
    sections.push(`## Skills\n${data.skills.join(', ')}\n`);
  }
  if (data.experience && data.experience.length) {
    const expLines = data.experience
      .map((exp) => {
        const title = exp.title ? `**${exp.title}**` : '';
        const desc = exp.description ? `\n${exp.description}` : '';
        return `${title}${desc}`;
      })
      .join('\n\n');
    sections.push(`## Experience\n${expLines}\n`);
  }
  if (data.projects && data.projects.length) {
    const projLines = data.projects
      .map((proj) => {
        const name = proj.name ? `**${proj.name}**` : '';
        const desc = proj.description ? `\n${proj.description}` : '';
        return `${name}${desc}`;
      })
      .join('\n\n');
    sections.push(`## Projects\n${projLines}\n`);
  }
  if (data.education && data.education.length) {
    const eduLines = data.education
      .map((edu) => {
        const parts = [];
        if (edu.institution) parts.push(edu.institution);
        if (edu.degree) parts.push(edu.degree);
        if (edu.year) parts.push(edu.year);
        return parts.join(', ');
      })
      .join('\n');
    sections.push(`## Education\n${eduLines}\n`);
  }
  return sections.join('\n');
}

/**
 * Convert markdown string to HTML using the `marked` library.
 * This function is optional and only imported when needed to avoid extra bundle size.
 */
export function markdownToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

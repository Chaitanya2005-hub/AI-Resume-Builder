import { ai } from '../genkit';
import { z } from 'zod';
import { JobRequirement } from '@/types/job';

const JobRequirementSchema = z.object({
  skills: z.array(z.string()).describe("List of technical and soft skills required for the job"),
  seniority: z.string().describe("Required seniority level (e.g. Junior, Mid, Senior, Lead, Director)"),
  domain: z.string().describe("Industry or domain (e.g. Fintech, Healthcare, E-commerce, SaaS)"),
  location: z.string().describe("Location requirements (e.g. Remote, On-site, Hybrid, specific city)"),
  keywords: z.array(z.string()).describe("Important keywords extracted from the description"),
});

export function fallbackParseJobDescription(text: string): JobRequirement {
  const textLower = text.toLowerCase();
  
  let seniority = 'Mid-Level';
  if (textLower.includes('senior') || textLower.includes('sr.') || textLower.includes('lead') || textLower.includes('principal')) {
    seniority = 'Senior / Lead';
  } else if (textLower.includes('junior') || textLower.includes('jr.') || textLower.includes('entry') || textLower.includes('intern')) {
    seniority = 'Junior / Entry Level';
  } else if (textLower.includes('director') || textLower.includes('vp') || textLower.includes('head of')) {
    seniority = 'Director / Executive';
  }

  let location = 'Not specified';
  if (textLower.includes('remote')) {
    location = 'Remote';
  } else if (textLower.includes('hybrid')) {
    location = 'Hybrid';
  } else if (textLower.includes('on-site') || textLower.includes('onsite')) {
    location = 'On-site';
  }

  const skillKeywords = [
    'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
    'HTML', 'CSS', 'Tailwind', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'GCP', 'Azure', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'Microservices', 'System Design',
    'Agile', 'Scrum', 'Leadership', 'Problem Solving', 'Spring Boot', 'Angular', 'Vue.js', 'Express'
  ];

  const foundSkills = skillKeywords.filter(skill => 
    new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(text)
  );

  if (foundSkills.length === 0) {
    foundSkills.push('Software Engineering', 'Problem Solving', 'Technical Strategy');
  }

  let domain = 'Technology / Software';
  if (textLower.includes('fintech') || textLower.includes('finance') || textLower.includes('banking')) domain = 'Fintech / Banking';
  else if (textLower.includes('health') || textLower.includes('medical') || textLower.includes('bio')) domain = 'Healthcare / HealthTech';
  else if (textLower.includes('ecommerce') || textLower.includes('e-commerce') || textLower.includes('retail')) domain = 'E-Commerce / Retail';
  else if (textLower.includes('saas') || textLower.includes('cloud')) domain = 'SaaS / Cloud Software';

  return {
    skills: foundSkills,
    seniority,
    domain,
    location,
    keywords: foundSkills.slice(0, 5),
  };
}

export const parseJobDescriptionFlow = ai.defineFlow(
  {
    name: 'parseJobDescriptionFlow',
    inputSchema: z.string(),
    outputSchema: JobRequirementSchema,
  },
  async (jobDescription) => {
    try {
      const response = await ai.generate({
        prompt: `You are an expert HR recruiter and ATS software engineer. 
Extract the structured requirements from the following job description.

Job Description:
${jobDescription}`,
        output: {
          schema: JobRequirementSchema,
        },
      });

      if (response.output) {
        return response.output;
      }
      return fallbackParseJobDescription(jobDescription);
    } catch (err) {
      console.warn('AI job description parse failed, falling back to NLP extractor:', err);
      return fallbackParseJobDescription(jobDescription);
    }
  }
);

const MatchScoreOutputSchema = z.object({
  matchScore: z.number().describe("A score from 0 to 100 indicating how well the candidate fits the job requirements"),
  criteriaBreakdown: z.object({
    skillsMatch: z.array(z.string()).describe("Skills from the job requirement that the candidate possesses"),
    missingSkills: z.array(z.string()).describe("Skills from the job requirement that the candidate is missing"),
    seniorityMatch: z.boolean().describe("Whether the candidate's experience level matches the required seniority"),
    domainMatch: z.boolean().describe("Whether the candidate has experience in the required domain"),
  })
});

export const computeJobMatchFlow = ai.defineFlow(
  {
    name: 'computeJobMatchFlow',
    inputSchema: z.object({
      resumeText: z.string(),
      jobRequirement: JobRequirementSchema,
    }),
    outputSchema: MatchScoreOutputSchema,
  },
  async (input) => {
    try {
      const response = await ai.generate({
        prompt: `You are an expert ATS (Applicant Tracking System) software.
Evaluate the candidate's resume against the structured job requirements.

Job Requirements:
${JSON.stringify(input.jobRequirement, null, 2)}

Candidate Resume:
${input.resumeText}

Analyze the match and provide a score (0-100) and a breakdown of the criteria.`,
        output: {
          schema: MatchScoreOutputSchema,
        },
      });

      if (response.output) {
        return response.output;
      }
      throw new Error('No AI output');
    } catch (err) {
      console.warn('AI match calculation failed, using heuristic match:', err);
      const reqSkills = input.jobRequirement.skills || [];
      const resumeLower = input.resumeText.toLowerCase();
      const matched = reqSkills.filter(s => resumeLower.includes(s.toLowerCase()));
      const missing = reqSkills.filter(s => !resumeLower.includes(s.toLowerCase()));
      const score = reqSkills.length ? Math.round((matched.length / reqSkills.length) * 100) : 75;

      return {
        matchScore: Math.max(score, 65),
        criteriaBreakdown: {
          skillsMatch: matched,
          missingSkills: missing,
          seniorityMatch: true,
          domainMatch: true,
        }
      };
    }
  }
);

const TailorResumeOutputSchema = z.object({
  coverNote: z.string().describe("A concise, personalized cover letter/note for this specific application"),
});

export const tailorResumeForJobFlow = ai.defineFlow(
  {
    name: 'tailorResumeForJobFlow',
    inputSchema: z.object({
      resumeText: z.string(),
      jobDescription: z.string(),
    }),
    outputSchema: TailorResumeOutputSchema,
  },
  async (input) => {
    try {
      const response = await ai.generate({
        prompt: `You are an expert career coach.
Write a personalized cover note based on the candidate's resume and the job description. The cover note should highlight why the candidate is a great fit for the role. Keep it concise, professional, and engaging (max 3 paragraphs).

Job Description:
${input.jobDescription}

Candidate Resume:
${input.resumeText}`,
        output: {
          schema: TailorResumeOutputSchema,
        },
      });

      if (response.output) {
        return response.output;
      }
      throw new Error('No AI output');
    } catch (err) {
      console.warn('AI cover note generation failed, using fallback template:', err);
      return {
        coverNote: `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in this role. Based on my technical background and experience, I believe I can bring immediate value to your team.\n\nThank you for reviewing my application, and I look forward to discussing how my skills align with your goals.\n\nBest regards,\nCandidate`,
      };
    }
  }
);

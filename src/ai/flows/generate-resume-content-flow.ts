'use server';
/**
 * @fileOverview This file implements a Genkit flow for AI-powered resume content generation.
 *
 * - generateResumeContent: A function that generates and optimizes resume content based on user input.
 * - GenerateResumeContentInput: The input type for the generateResumeContent function.
 * - GenerateResumeContentOutput: The return type for the generateResumeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeContentInputSchema = z.object({
  rawInput: z.string().optional().describe('Unstructured text containing resume information to be parsed and architected.'),
  personalInfo: z.object({
    name: z.string().describe('Full name of the applicant.').optional(),
    email: z.string().email().describe('Email address of the applicant.').optional(),
    phone: z.string().optional().describe('Phone number of the applicant.'),
    linkedin: z.string().url().optional().describe('LinkedIn profile URL.'),
    portfolio: z.string().url().optional().describe('Portfolio website URL.'),
  }).optional(),
  professionalSummary: z.string().optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationDate: z.string().optional(),
    achievements: z.string().optional(),
  })).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    url: z.string().url().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().optional(),
    issuer: z.string().optional(),
    issueDate: z.string().optional(),
    expirationDate: z.string().optional(),
  })).optional(),
  jobDescription: z.string().optional().describe('Optional job description to optimize the resume against.'),
});
export type GenerateResumeContentInput = z.infer<typeof GenerateResumeContentInputSchema>;

const GenerateResumeContentOutputSchema = z.object({
  personalInfo: z.object({
    name: z.string().describe('Full name of the applicant.'),
    email: z.string().email().describe('Email address of the applicant.'),
    phone: z.string().optional().describe('Phone number of the applicant.'),
    linkedin: z.string().url().optional().describe('LinkedIn profile URL.'),
    portfolio: z.string().url().optional().describe('Portfolio website URL.'),
  }),
  professionalSummary: z.string().describe('Optimized professional summary, 3-5 sentences, ATS-friendly.'),
  education: z.array(z.object({
    institution: z.string().describe('Name of the educational institution.'),
    degree: z.string().describe('Degree obtained.'),
    fieldOfStudy: z.string().describe('Field of study.'),
    graduationDate: z.string().describe('Graduation date.'),
    achievements: z.array(z.string()).describe('Key achievements.'),
  })).optional(),
  skills: z.array(z.string()).describe('List of relevant skills.').optional(),
  experience: z.array(z.object({
    title: z.string().describe('Job title.'),
    company: z.string().describe('Company name.'),
    location: z.string().describe('Job location.'),
    startDate: z.string().describe('Start date.'),
    endDate: z.string().optional().describe('End date or Present.'),
    description: z.array(z.string()).describe('Action-verb-led bullet points.'),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().describe('Project name.'),
    description: z.array(z.string()).describe('Project achievements as bullet points.'),
    technologies: z.array(z.string()).optional().describe('Technologies used.'),
    url: z.string().url().optional().describe('Project URL.'),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().describe('Name of the certification.'),
    issuer: z.string().describe('Issuing organization.'),
    issueDate: z.string().optional().describe('Date of issue.'),
    expirationDate: z.string().optional().describe('Expiration date.'),
  })).optional(),
});
export type GenerateResumeContentOutput = z.infer<typeof GenerateResumeContentOutputSchema>;

export async function generateResumeContent(input: GenerateResumeContentInput): Promise<GenerateResumeContentOutput> {
  return generateResumeContentFlow(input);
}

const generateResumeContentPrompt = ai.definePrompt({
  name: 'generateResumeContentPrompt',
  input: {schema: GenerateResumeContentInputSchema},
  output: {schema: GenerateResumeContentOutputSchema},
  prompt: `You are an expert resume writer.

{{#if rawInput}}
Raw Data:
{{{rawInput}}}
{{/if}}

{{#if personalInfo}}
PersonalInfo:
- Name: {{{personalInfo.name}}}
- Email: {{{personalInfo.email}}}
{{/if}}

{{#if jobDescription}}
Job Description for Optimization:
{{{jobDescription}}}
{{/if}}

Strict Rules:
1. Return JSON only.
2. Use professional action verbs.
3. No first-person pronouns.
4. Convert descriptions into 3-5 bullet points.
`,
});

const generateResumeContentFlow = ai.defineFlow(
  {
    name: 'generateResumeContentFlow',
    inputSchema: GenerateResumeContentInputSchema,
    outputSchema: GenerateResumeContentOutputSchema,
  },
  async (input) => {
    const {output} = await generateResumeContentPrompt(input);
    return output!;
  }
);

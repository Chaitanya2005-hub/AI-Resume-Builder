'use server';
/**
 * @fileOverview This file implements Genkit flows for AI Assistant operations (Summary, Bullet, Skills) using Claude.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const cloudeModel = 'anthropic/claude-3-5-sonnet-latest';

// --- SUMMARY WRITER ---
const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: z.object({
      targetJobDesc: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const prompt = `You are an expert resume writer.
Craft a 3-4 sentence professional summary tailored for executive & technical roles.
Make it impact-driven, using action verbs. Focus on measurable achievements if any are implied. No first-person pronouns.

${input.targetJobDesc ? `Target Job Description to optimize against:\n${input.targetJobDesc}\n\n` : ''}`;

    const { text } = await ai.generate({
      model: cloudeModel,
      prompt: prompt,
    });
    return text;
  }
);

// --- BULLET IMPROVER ---
const enhanceBulletFlow = ai.defineFlow(
  {
    name: 'enhanceBulletFlow',
    inputSchema: z.object({
      bulletText: z.string(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const prompt = `You are an expert resume writer.
Rewrite the following resume bullet point to be more impactful.
Start with a strong action verb, quantify results where possible, and highlight the value added.
Do NOT include any introductory or concluding text, just the single improved bullet point text (without a leading bullet point character).

Original bullet point:
${input.bulletText}`;

    const { text } = await ai.generate({
      model: cloudeModel,
      prompt: prompt,
    });
    return text.trim().replace(/^[-•*]\s*/, '');
  }
);

// --- SKILL RECOMMENDER ---
const recommendSkillsFlow = ai.defineFlow(
  {
    name: 'recommendSkillsFlow',
    inputSchema: z.object({
      targetJobDesc: z.string().optional(),
    }),
    outputSchema: z.array(z.string()),
  },
  async (input) => {
    const prompt = `You are an expert technical recruiter.
Provide a list of 10 highly relevant skills (technical, tools, or soft skills) for a modern software engineering/tech resume.
${input.targetJobDesc ? `Ensure they are highly relevant to this job description:\n${input.targetJobDesc}\n\n` : ''}
Return ONLY a JSON array of strings. No markdown formatting, no explanations. Example: ["React.js", "TypeScript"]`;

    const { text } = await ai.generate({
      model: cloudeModel,
      prompt: prompt,
    });
    
    try {
      const cleanJson = text.replace(/^```json\n?/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return ["Communication", "Problem Solving", "Adaptability"];
    }
  }
);

export async function generateSummaryAction(input: { targetJobDesc?: string }) {
  return generateSummaryFlow(input);
}

export async function enhanceBulletAction(input: { bulletText: string }) {
  return enhanceBulletFlow(input);
}

export async function recommendSkillsAction(input: { targetJobDesc?: string }) {
  return recommendSkillsFlow(input);
}

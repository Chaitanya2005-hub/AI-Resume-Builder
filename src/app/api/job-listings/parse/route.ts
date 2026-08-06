import { NextResponse } from 'next/server';
import { parseJobDescriptionFlow } from '@/ai/flows/job-matching-flows';
import { saveJobListing } from '@/lib/db';
import { JobListing } from '@/types/job';

export async function POST(req: Request) {
  try {
    const { jobDescription, userId, source = 'manual' } = await req.json();

    if (!jobDescription || !userId) {
      return NextResponse.json({ error: 'Missing jobDescription or userId' }, { status: 400 });
    }

    const parsedRequirements = await parseJobDescriptionFlow(jobDescription);

    const listing: JobListing = {
      userId,
      originalText: jobDescription,
      parsedRequirements,
      source,
      createdAt: new Date().toISOString(),
    };

    const id = await saveJobListing(listing);
    
    return NextResponse.json({ id, ...listing });
  } catch (error) {
    console.error('Failed to parse job description:', error);
    return NextResponse.json({ error: 'Failed to parse job description' }, { status: 500 });
  }
}

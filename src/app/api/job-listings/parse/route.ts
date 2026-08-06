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

    console.log('Parsing job description, length:', jobDescription.length);
    const parsedRequirements = await parseJobDescriptionFlow(jobDescription);
    console.log('Parsed requirements:', JSON.stringify(parsedRequirements, null, 2));

    const listing: JobListing = {
      userId,
      originalText: jobDescription,
      parsedRequirements,
      source,
      createdAt: new Date().toISOString(),
    };

    const id = await saveJobListing(listing);
    
    return NextResponse.json({ id, ...listing });
  } catch (error: any) {
    console.error('Failed to parse job description:', error);
    const errorMessage = error?.message || 'Failed to parse job description';
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { computeJobMatchFlow } from '@/ai/flows/job-matching-flows';
import { saveJobMatch, getJobListing } from '@/lib/db';
import { JobMatch } from '@/types/job';

export async function POST(req: Request) {
  try {
    const { userId, resumeId, resumeText, jobListingId } = await req.json();

    if (!userId || !resumeId || !resumeText || !jobListingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jobListing = await getJobListing(jobListingId);
    if (!jobListing) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    const matchResult = await computeJobMatchFlow({
      resumeText,
      jobRequirement: jobListing.parsedRequirements,
    });

    const match: JobMatch = {
      userId,
      resumeId,
      jobListingId,
      matchScore: matchResult.matchScore,
      criteriaBreakdown: matchResult.criteriaBreakdown,
      createdAt: new Date().toISOString(),
    };

    const id = await saveJobMatch(match);
    
    return NextResponse.json({ id, ...match });
  } catch (error) {
    console.error('Failed to compute match:', error);
    return NextResponse.json({ error: 'Failed to compute match' }, { status: 500 });
  }
}

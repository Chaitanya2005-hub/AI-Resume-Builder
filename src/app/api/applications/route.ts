import { NextResponse } from 'next/server';
import { getJobApplications } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const applications = await getJobApplications(userId);
    
    // Sort by most recent first
    applications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

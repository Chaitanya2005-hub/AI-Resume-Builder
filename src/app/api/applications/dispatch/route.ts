import { NextResponse } from 'next/server';
import { tailorResumeForJobFlow } from '@/ai/flows/job-matching-flows';
import { 
  saveJobApplication, 
  saveDispatchInstruction,
  addApplicationStatusLog,
  getJobListing
} from '@/lib/db';
import { JobApplication, DispatchInstruction, ApplicationStatusLog } from '@/types/job';

export async function POST(req: Request) {
  try {
    const { 
      userId, 
      resumeId, 
      resumeText,
      jobListingId, 
      companyId, 
      targetEmail,
      senderEmail,
      matchScore,
      dispatchChannel,
      confirm
    } = await req.json();

    if (!confirm) {
      return NextResponse.json({ error: 'Explicit confirmation required for dispatch' }, { status: 403 });
    }

    if (!userId || !resumeId || !resumeText || !jobListingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const jobListing = await getJobListing(jobListingId);
    if (!jobListing) {
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }

    // 1. Tailor the content using Genkit
    const tailoredContent = await tailorResumeForJobFlow({
      resumeText,
      jobDescription: jobListing.originalText,
    });

    // 2. Create the Application Record
    const application: JobApplication = {
      userId,
      resumeId,
      jobListingId,
      companyId: companyId || 'target_company',
      targetEmail: targetEmail || 'careers@targetcompany.com',
      senderEmail: senderEmail || 'user@example.com',
      matchScore,
      dispatchChannel: dispatchChannel || 'EMAIL',
      tailoredContentSnapshot: {
        coverNote: tailoredContent.coverNote,
      },
      status: 'queued',
      submittedAt: new Date().toISOString(),
      lastStatusUpdateAt: new Date().toISOString(),
    };

    const applicationId = await saveJobApplication(application);

    // 3. Create Dispatch Instruction (Audit Trail)
    const instruction: DispatchInstruction = {
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };
    await saveDispatchInstruction(instruction);

    // 4. Log initial status
    const initialLog: ApplicationStatusLog = {
      applicationId,
      status: 'queued',
      timestamp: new Date().toISOString(),
    };
    await addApplicationStatusLog(initialLog);

    // 5. SIMULATE DISPATCH (Since we are skipping actual email integrations for now)
    // We would normally call an Email Provider (SendGrid/Resend) or Job Board API here.
    const isSuccess = Math.random() > 0.1; // 90% success rate simulation

    if (isSuccess) {
      // Simulate successful dispatch
      const sentLog: ApplicationStatusLog = {
        applicationId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
      await addApplicationStatusLog(sentLog);
      
      // We would normally update the application status to 'sent' here as well.
      // But for this example we are returning early and relying on a hypothetical webhook or direct update.
      // Let's do it directly for simplicity:
      const { updateJobApplicationStatus } = await import('@/lib/db');
      await updateJobApplicationStatus(applicationId, 'sent');

      return NextResponse.json({ 
        success: true, 
        applicationId, 
        message: 'Application dispatched successfully',
        tailoredContent
      });
    } else {
      // Simulate failed dispatch
      const failedLog: ApplicationStatusLog = {
        applicationId,
        status: 'failed',
        timestamp: new Date().toISOString(),
      };
      await addApplicationStatusLog(failedLog);
      
      const { updateJobApplicationStatus } = await import('@/lib/db');
      await updateJobApplicationStatus(applicationId, 'failed', 'Simulated dispatch failure');

      return NextResponse.json({ 
        error: 'Dispatch failed', 
        applicationId,
        tailoredContent
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Dispatch failed:', error);
    return NextResponse.json({ error: 'Internal server error during dispatch' }, { status: 500 });
  }
}

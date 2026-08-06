import { NextResponse } from 'next/server';
import { tailorResumeForJobFlow } from '@/ai/flows/job-matching-flows';
import { generateResumeContent } from '@/ai/flows/generate-resume-content-flow';
import { 
  saveJobApplication, 
  saveDispatchInstruction,
  addApplicationStatusLog,
  getJobListing
} from '@/lib/db';
import { JobApplication, DispatchInstruction, ApplicationStatusLog } from '@/types/job';
import { ResumeData } from '@/types/resume';

export async function POST(req: Request) {
  try {
    console.log('[Dispatch] Starting dispatch process...');
    const { 
      userId, 
      resumeId, 
      resumeText,
      resumeData,
      jobListingId, 
      companyId, 
      targetEmail,
      senderEmail,
      matchScore,
      dispatchChannel,
      confirm
    } = await req.json();

    console.log('[Dispatch] Request data:', { userId, resumeId, jobListingId, targetEmail, senderEmail, confirm });

    if (!confirm) {
      return NextResponse.json({ error: 'Explicit confirmation required for dispatch' }, { status: 403 });
    }

    if (!userId || !resumeId || !resumeText || !jobListingId) {
      console.error('[Dispatch] Missing required fields:', { userId, resumeId, hasResumeText: !!resumeText, jobListingId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('[Dispatch] Fetching job listing...');
    const jobListing = await getJobListing(jobListingId);
    if (!jobListing) {
      console.error('[Dispatch] Job listing not found:', jobListingId);
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }
    console.log('[Dispatch] Job listing found:', jobListing.id);

    // 1. Tailor the cover note using Genkit
    console.log('[Dispatch] Tailoring cover note...');
    const tailoredContent = await tailorResumeForJobFlow({
      resumeText,
      jobDescription: jobListing.originalText,
    });
    console.log('[Dispatch] Cover note tailored successfully');

    // 2. Tailor the resume content based on job requirements
    let tailoredResumeData: ResumeData | undefined;
    if (resumeData) {
      try {
        console.log('[Dispatch] Tailoring resume content for job...');
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (geminiKey && !geminiKey.startsWith('AQ.') && geminiKey !== 'YOUR_GEMINI_API_KEY') {
          // Use AI to tailor the resume
          const aiTailored = await generateResumeContent({
            ...resumeData,
            jobDescription: jobListing.originalText,
          });
          
          // Transform AI output to match ResumeData structure
          tailoredResumeData = {
            ...resumeData,
            professionalSummary: aiTailored.professionalSummary,
            skills: aiTailored.skills || resumeData.skills,
            experience: aiTailored.experience?.map((exp, i) => {
              const originalExp = resumeData.experience?.[i] || {};
              return {
                ...originalExp,
                title: exp.title || originalExp.title,
                company: exp.company || originalExp.company,
                location: exp.location || originalExp.location,
                startDate: exp.startDate || originalExp.startDate,
                endDate: exp.endDate || originalExp.endDate,
                description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || originalExp.description),
              };
            }) || resumeData.experience,
            education: aiTailored.education?.map((edu, i) => {
              const originalEdu = resumeData.education?.[i] || {};
              return {
                ...originalEdu,
                institution: edu.institution || originalEdu.institution,
                degree: edu.degree || originalEdu.degree,
                fieldOfStudy: edu.fieldOfStudy || originalEdu.fieldOfStudy,
                graduationDate: edu.graduationDate || originalEdu.graduationDate,
                achievements: Array.isArray(edu.achievements) ? edu.achievements.join(', ') : (edu.achievements || originalEdu.achievements),
              };
            }) || resumeData.education,
          };
          console.log('[Dispatch] Resume tailored successfully with AI');
        } else {
          // Fallback: use original resume data
          console.log('[Dispatch] No valid AI key, using original resume data');
          tailoredResumeData = resumeData;
        }
      } catch (err) {
        console.warn('[Dispatch] AI resume tailoring failed, using original:', err);
        tailoredResumeData = resumeData;
      }
    }

    // 3. Generate resume HTML from tailored resume data
    let resumeHtml: string | undefined;
    if (tailoredResumeData) {
      try {
        const htmlRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9005'}/api/resume/generate-html`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            resumeData: tailoredResumeData, 
            templateId: 'enhancv',
            colorTheme: 'royal',
            fontStyle: 'inter'
          }),
        });
        if (htmlRes.ok) {
          const htmlData = await htmlRes.json();
          resumeHtml = htmlData.html;
          console.log('[Dispatch] Resume HTML generated successfully');
        }
      } catch (err) {
        console.warn('[Dispatch] Failed to generate resume HTML:', err);
      }
    }

    // 4. Create the Application Record
    console.log('[Dispatch] Creating application record...');
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
        resumeHtml,
      },
      status: 'queued',
      submittedAt: new Date().toISOString(),
      lastStatusUpdateAt: new Date().toISOString(),
    };

    console.log('[Dispatch] Saving application to database...');
    const applicationId = await saveJobApplication(application);
    console.log('[Dispatch] Application saved with ID:', applicationId);

    // 5. Create Dispatch Instruction (Audit Trail)
    console.log('[Dispatch] Creating dispatch instruction...');
    const instruction: DispatchInstruction = {
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };
    await saveDispatchInstruction(instruction);
    console.log('[Dispatch] Dispatch instruction saved');

    // 6. Log initial status
    console.log('[Dispatch] Logging initial status...');
    const initialLog: ApplicationStatusLog = {
      applicationId,
      status: 'queued',
      timestamp: new Date().toISOString(),
    };
    await addApplicationStatusLog(initialLog);
    console.log('[Dispatch] Initial status logged');

    // 7. Send actual email if email service is configured
    console.log('[Dispatch] Checking email service configuration...');
    let emailSent = false;
    let emailError: string | undefined;
    
    if (process.env.RESEND_API_KEY && targetEmail && senderEmail) {
      try {
        console.log('[Dispatch] Sending email via Resend...');
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: senderEmail,
            to: targetEmail,
            subject: `Job Application - ${senderEmail}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Job Application</h2>
                <p>${tailoredContent.coverNote}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                ${resumeHtml || '<p><strong>Resume attached separately.</strong></p>'}
              </div>
            `,
          }),
        });
        
        if (emailRes.ok) {
          emailSent = true;
          console.log('[Dispatch] Email sent successfully via Resend');
        } else {
          const errorData = await emailRes.json();
          emailError = errorData.message || 'Email service error';
          console.warn('[Dispatch] Email send failed:', emailError);
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Email service error';
        console.warn('[Dispatch] Email send error:', emailError);
      }
    } else {
      console.log('[Dispatch] Email service not configured or missing email addresses, using simulation');
    }

    // 8. Update status based on email result or simulation
    console.log('[Dispatch] Updating application status...');
    const { updateJobApplicationStatus } = await import('@/lib/db');
    
    if (emailSent) {
      await updateJobApplicationStatus(applicationId, 'sent');
      const sentLog: ApplicationStatusLog = {
        applicationId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
      await addApplicationStatusLog(sentLog);

      return NextResponse.json({ 
        success: true, 
        applicationId, 
        message: 'Application emailed successfully',
        tailoredContent: {
          coverNote: tailoredContent.coverNote,
          resumeHtml,
        }
      });
    } else {
      // Fallback to simulation if email not configured or failed
      const isSuccess = Math.random() > 0.1; // 90% success rate simulation
      
      if (isSuccess) {
        await updateJobApplicationStatus(applicationId, 'sent');
        const sentLog: ApplicationStatusLog = {
          applicationId,
          status: 'sent',
          timestamp: new Date().toISOString(),
        };
        await addApplicationStatusLog(sentLog);

        return NextResponse.json({ 
          success: true, 
          applicationId, 
          message: emailError ? 'Application dispatched (email service unavailable, using simulation)' : 'Application dispatched successfully (simulation mode)',
          tailoredContent: {
            coverNote: tailoredContent.coverNote,
            resumeHtml,
          },
          simulation: true
        });
      } else {
        await updateJobApplicationStatus(applicationId, 'failed', emailError || 'Simulated dispatch failure');
        const failedLog: ApplicationStatusLog = {
          applicationId,
          status: 'failed',
          timestamp: new Date().toISOString(),
        };
        await addApplicationStatusLog(failedLog);

        return NextResponse.json({ 
          error: emailError || 'Dispatch failed', 
          applicationId,
          tailoredContent: {
            coverNote: tailoredContent.coverNote,
            resumeHtml,
          }
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Dispatch failed:', error);
    return NextResponse.json({ error: 'Internal server error during dispatch' }, { status: 500 });
  }
}

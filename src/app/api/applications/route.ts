import { NextResponse } from 'next/server';
import { getJobApplications } from '@/lib/db';
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

export async function POST(req: Request) {
  try {
    console.log('[Dispatch] Starting dispatch process...');
    const { 
      userId, 
      resumeId, 
      resumeText,
      resumeData,
      jobListingId, 
      jobListing,
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

    if (!userId || !resumeId || !resumeText) {
      console.error('[Dispatch] Missing required fields:', { userId, resumeId, hasResumeText: !!resumeText });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use provided job listing or fetch from database
    let jobListingData = jobListing;
    if (!jobListingData && jobListingId) {
      console.log('[Dispatch] Fetching job listing from database...');
      jobListingData = await getJobListing(jobListingId);
    }
    
    if (!jobListingData) {
      console.error('[Dispatch] Job listing not found:', jobListingId);
      return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
    }
    console.log('[Dispatch] Job listing found:', jobListingData.id);

    // Extract candidate name from resume data
    const candidateName = resumeData?.personalInfo?.name || 'Applicant';
    console.log('[Dispatch] Candidate name:', candidateName);

    // 1. Tailor the cover note using Genkit
    console.log('[Dispatch] Tailoring cover note...');
    const tailoredContent = await tailorResumeForJobFlow({
      resumeText,
      jobDescription: jobListingData.originalText,
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
            jobDescription: jobListingData.originalText,
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
        resumeHtml: resumeHtml || '',
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
    console.log('[Dispatch] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
    console.log('[Dispatch] targetEmail:', targetEmail);
    console.log('[Dispatch] senderEmail:', senderEmail);
    
    let emailSent = false;
    let emailError: string | undefined;
    
    if (process.env.RESEND_API_KEY && targetEmail && senderEmail) {
      try {
        console.log('[Dispatch] Sending email via Resend...');
        console.log('[Dispatch] Email payload:', {
          from: senderEmail,
          to: targetEmail,
          subject: `Job Application - ${senderEmail}`,
          hasCoverNote: !!tailoredContent.coverNote,
          hasResumeHtml: !!resumeHtml
        });
        
        const emailPayload = {
          from: senderEmail,
          to: targetEmail,
          subject: `Job Application - ${candidateName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
              <h2 style="color: #333;">Job Application</h2>
              <p>${tailoredContent.coverNote}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #0284c7; margin-top: 0;">Resume</h3>
                ${resumeHtml || '<p><strong>Resume content will be provided separately.</strong></p>'}
              </div>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Note: This application was generated by AI Resume Architect. For a formal PDF resume, 
                please request it in your response.
              </p>
            </div>
          `,
          attachments: resumeHtml ? [{
            filename: `${candidateName.replace(/\s+/g, '_')}_Resume.html`,
            content: Buffer.from(resumeHtml).toString('base64'),
          }] : undefined
        };
        
        console.log('[Dispatch] Making fetch request to Resend API...');
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });
        
        console.log('[Dispatch] Email response status:', emailRes.status);
        
        if (emailRes.ok) {
          emailSent = true;
          console.log('[Dispatch] Email sent successfully via Resend');
        } else {
          const errorText = await emailRes.text();
          console.error('[Dispatch] Email send failed - Status:', emailRes.status);
          console.error('[Dispatch] Error response text:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            emailError = errorData.message || errorData.error || 'Email service error';
            console.error('[Dispatch] Parsed error:', errorData);
          } catch {
            emailError = errorText || 'Email service error';
          }
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Email service error';
        console.error('[Dispatch] Email send error:', emailError);
        console.error('[Dispatch] Error stack:', err instanceof Error ? err.stack : 'No stack');
      }
    } else {
      console.log('[Dispatch] Email service not configured or missing email addresses, using simulation');
      if (!process.env.RESEND_API_KEY) {
        console.warn('[Dispatch] RESEND_API_KEY is not set in environment variables');
      }
      if (!targetEmail) {
        console.warn('[Dispatch] targetEmail is missing');
      }
      if (!senderEmail) {
        console.warn('[Dispatch] senderEmail is missing');
      }
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

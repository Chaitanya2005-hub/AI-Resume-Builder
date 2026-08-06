import { NextResponse } from 'next/server';
import { ResumeData } from '@/types/resume';

export async function POST(req: Request) {
  try {
    const { resumeData, templateId = 'enhancv', colorTheme = 'royal', fontStyle = 'inter' } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'Missing resumeData' }, { status: 400 });
    }

    // Generate HTML by rendering the template server-side
    // For now, we'll return a structured HTML string that can be used in emails
    const html = generateResumeHTML(resumeData, templateId, colorTheme, fontStyle);

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Failed to generate resume HTML:', error);
    return NextResponse.json({ error: 'Failed to generate resume HTML' }, { status: 500 });
  }
}

function generateResumeHTML(data: ResumeData, templateId: string, colorTheme: string, fontStyle: string): string {
  const { personalInfo, professionalSummary, experience, education, skills, projects } = data;
  
  const themeColors: Record<string, { primary: string; bgSoft: string }> = {
    royal: { primary: '#0284c7', bgSoft: '#f0f9ff' },
    emerald: { primary: '#059669', bgSoft: '#ecfdf5' },
    sunset: { primary: '#7c3aed', bgSoft: '#f5f3ff' },
    crimson: { primary: '#dc2626', bgSoft: '#fef2f2' },
    monochrome: { primary: '#1f2937', bgSoft: '#f9fafb' },
  };
  
  const theme = themeColors[colorTheme] || themeColors.royal;

  const skillsList = Array.isArray(skills) ? skills : [];
  
  const renderBullets = (desc: string | string[]) => {
    if (Array.isArray(desc)) {
      return desc.map(b => `<li>${b}</li>`).join('');
    }
    if (typeof desc === 'string' && desc.includes('\n')) {
      return desc.split('\n').filter(b => b.trim()).map(b => `<li>${b.replace(/^[•\-\*]\s*/, '')}</li>`).join('');
    }
    return `<p>${desc}</p>`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resume - ${personalInfo?.name || 'Applicant'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .resume-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid ${theme.primary}; padding-bottom: 20px; margin-bottom: 30px; }
    .name { font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0; }
    .title { font-size: 18px; color: ${theme.primary}; margin: 5px 0 10px 0; }
    .contact-info { font-size: 12px; color: #666; display: flex; flex-wrap: wrap; gap: 15px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: ${theme.primary}; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; margin-bottom: 15px; }
    .item { margin-bottom: 15px; }
    .item-title { font-size: 14px; font-weight: bold; color: #1a1a1a; }
    .item-subtitle { font-size: 12px; color: ${theme.primary}; margin: 3px 0; }
    .item-date { font-size: 11px; color: #888; }
    .item-description { font-size: 12px; color: #444; line-height: 1.5; margin-top: 5px; }
    .item-description ul { margin: 5px 0; padding-left: 20px; }
    .item-description li { margin-bottom: 3px; }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: ${theme.bgSoft}; color: ${theme.primary}; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="header">
      <h1 class="name">${personalInfo?.name || 'Your Name'}</h1>
      ${personalInfo?.jobTitle ? `<p class="title">${personalInfo.jobTitle}</p>` : ''}
      <div class="contact-info">
        ${personalInfo?.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
        ${personalInfo?.phone ? `<span>📱 ${personalInfo.phone}</span>` : ''}
        ${personalInfo?.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
        ${personalInfo?.linkedin ? `<span>💼 ${personalInfo.linkedin}</span>` : ''}
      </div>
    </div>

    ${professionalSummary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="item-description">${professionalSummary}</p>
    </div>
    ` : ''}

    ${experience && experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Experience</div>
      ${experience.map(exp => `
        <div class="item">
          <div class="item-title">${exp.title}</div>
          <div class="item-subtitle">${exp.company}</div>
          <div class="item-date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
          <div class="item-description">${renderBullets(exp.description)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${education && education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${education.map(edu => `
        <div class="item">
          <div class="item-title">${edu.degree}</div>
          <div class="item-subtitle">${edu.institution}</div>
          <div class="item-date">${edu.graduationDate || ''}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skillsList.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills-grid">
        ${skillsList.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    ${projects && projects.length > 0 ? `
    <div class="section">
      <div class="section-title">Projects</div>
      ${projects.map(proj => `
        <div class="item">
          <div class="item-title">${proj.name}</div>
          <div class="item-description">${renderBullets(proj.description)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim();
}

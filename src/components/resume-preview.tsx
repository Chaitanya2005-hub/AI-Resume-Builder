'use client';

import React, { useRef, useEffect } from 'react';
import { Mail, Phone, Linkedin, Globe, MapPin } from 'lucide-react';
// jsPDF and html2canvas will be loaded dynamically when needed
import { useWatch, type Control } from 'react-hook-form';

interface ResumePreviewProps {
  control: Control<any>;
  optimizedData: any | null;
}

export default function ResumePreview({ control, optimizedData }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const watchedData = useWatch({ control });
  const data = optimizedData || watchedData;
  const isOptimized = !!optimizedData;

  useEffect(() => {
    (window as any).downloadResumePDF = async () => {
      if (!resumeRef.current) return;
      const element = resumeRef.current;
      try {
        const [{ jsPDF }, html2canvasModule] = await Promise.all([
          import('jspdf'),
          import('html2canvas')
        ]);
        const html2canvas = html2canvasModule.default;
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${data.personalInfo?.name || 'resume'}_Architected.pdf`);
      } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
      }
    };
    
    return () => {
      delete (window as any).downloadResumePDF;
    };
  }, [data]);

  if (!data) return null;

  const { personalInfo, professionalSummary, experience, education, skills, projects, certifications } = data;

  return (
    <div className="w-full overflow-auto scrollbar-hide">
      <div 
        ref={resumeRef} 
        className="resume-paper bg-white text-[#1a1a1a] font-sans leading-relaxed"
        style={{ color: '#1a1a1a', minHeight: '1120px' }}
      >
        {/* Header */}
        <div className="border-b-2 border-primary pb-6 mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#000]">{personalInfo?.name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-600">
            {personalInfo?.email && (
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {personalInfo.email}</span>
            )}
            {personalInfo?.phone && (
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {personalInfo.phone}</span>
            )}
            {personalInfo?.linkedin && (
              <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn</span>
            )}
            {personalInfo?.portfolio && (
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Portfolio</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {(professionalSummary || isOptimized) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Professional Summary</h2>
            <p className="text-sm leading-6">
              {professionalSummary || (isOptimized ? "Expert professional ready for the next career step." : "Add your summary...")}
            </p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && skills[0] !== '' && (
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, idx: number) => (
                <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-3 border-b pb-1">Professional Experience</h2>
            <div className="space-y-4">
              {experience.map((exp: any, idx: number) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-sm">{exp.title}</h3>
                      <div className="text-sm italic">{exp.company}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500 font-medium">
                      <div>{exp.startDate} – {exp.endDate || 'Present'}</div>
                      {exp.location && <div className="flex items-center gap-1 justify-end mt-1"><MapPin className="h-2 w-2" /> {exp.location}</div>}
                    </div>
                  </div>
                  {isOptimized ? (
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      {Array.isArray(exp.description) ? exp.description.map((bullet: string, bidx: number) => (
                        <li key={bidx} className="text-sm">{bullet}</li>
                      )) : <li className="text-sm">{exp.description}</li>}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-primary mb-3 border-b pb-1">Education</h2>
            <div className="space-y-3">
              {education.map((edu: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{edu.institution}</h3>
                    <div className="text-sm">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                  </div>
                  <div className="text-right text-xs text-gray-500 font-medium">{edu.graduationDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

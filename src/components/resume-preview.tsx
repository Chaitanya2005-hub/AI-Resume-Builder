'use client';

import React, { useRef, useEffect } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import TemplateEngine from '@/components/templates/template-engine';
import { ResumeData, TemplateId, ColorTheme, FontStyle } from '@/types/resume';

interface ResumePreviewProps {
  control?: Control<any>;
  optimizedData?: ResumeData | null;
  templateId?: TemplateId;
  colorTheme?: ColorTheme;
  fontStyle?: FontStyle;
}

export default function ResumePreview({
  control,
  optimizedData,
  templateId = 'classic',
  colorTheme = 'royal',
  fontStyle = 'inter',
}: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // If react-hook-form control is provided, watch live form state
  const watchedData = control ? useWatch({ control }) : null;
  const rawData = optimizedData || watchedData || {};

  // Safely construct normalized ResumeData object
  const data: ResumeData = {
    templateId,
    colorTheme,
    fontStyle,
    personalInfo: rawData.personalInfo || { name: 'Your Full Name', email: 'email@example.com' },
    professionalSummary: rawData.professionalSummary || '',
    experience: rawData.experience || [],
    education: rawData.education || [],
    projects: rawData.projects || [],
    skills: rawData.skills || [],
    certifications: rawData.certifications || [],
    languages: rawData.languages || [],
    achievements: rawData.achievements || [],
    interests: rawData.interests || [],
    references: rawData.references || [],
  };

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
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const totalPdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let position = 0;
        let heightLeft = totalPdfHeight;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfPageHeight;
        
        while (heightLeft > 0) {
          position -= pdfPageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
          heightLeft -= pdfPageHeight;
        }
        
        pdf.save(`${data.personalInfo?.name || 'Resume'}_Architected.pdf`);
      } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
      }
    };
    
    return () => {
      delete (window as any).downloadResumePDF;
    };
  }, [data]);

  return (
    <div className="w-full overflow-auto scrollbar-hide bg-gray-100 dark:bg-gray-900 p-2 sm:p-4 rounded-xl shadow-inner">
      <div 
        ref={resumeRef} 
        className="resume-paper shadow-2xl mx-auto rounded overflow-hidden"
        style={{ width: '100%', maxWidth: '800px', minHeight: '1050px' }}
      >
        <TemplateEngine
          data={data}
          templateId={templateId}
          colorTheme={colorTheme}
          fontStyle={fontStyle}
        />
      </div>
    </div>
  );
}

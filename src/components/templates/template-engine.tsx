'use client';

import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Award, BookOpen, Briefcase, Code, Sparkles, Calendar, Gem, Cpu, Bot, CheckCircle2 } from 'lucide-react';
import { ResumeData, TemplateId, ColorTheme, FontStyle, CategorizedSkills } from '@/types/resume';

interface TemplateEngineProps {
  data: ResumeData;
  templateId?: TemplateId;
  colorTheme?: ColorTheme;
  fontStyle?: FontStyle;
}

const themeStyles: Record<ColorTheme, { primary: string; bgSoft: string; border: string; textAccent: string }> = {
  royal: { primary: '#0284c7', bgSoft: '#f0f9ff', border: '#38bdf8', textAccent: '#0369a1' },
  emerald: { primary: '#059669', bgSoft: '#ecfdf5', border: '#10b981', textAccent: '#047857' },
  sunset: { primary: '#7c3aed', bgSoft: '#f5f3ff', border: '#8b5cf6', textAccent: '#6d28d9' },
  crimson: { primary: '#dc2626', bgSoft: '#fef2f2', border: '#ef4444', textAccent: '#b91c1c' },
  monochrome: { primary: '#1f2937', bgSoft: '#f9fafb', border: '#4b5563', textAccent: '#111827' },
};

const fontFamilies: Record<FontStyle, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  outfit: "'Outfit', sans-serif",
  playfair: "'Playfair Display', serif",
};

export default function TemplateEngine({
  data,
  templateId = 'enhancv',
  colorTheme = 'royal',
  fontStyle = 'inter',
}: TemplateEngineProps) {
  const activeTheme = themeStyles[colorTheme] || themeStyles.royal;
  const activeFont = fontFamilies[fontStyle] || fontFamilies.inter;

  const { personalInfo, professionalSummary, experience, education, projects, skills, certifications, languages, achievements, interests, references } = data;

  const getSkillsList = (): string[] => {
    if (!skills) return ['Java', 'Python', 'C', 'C++', 'HTML', 'AWS'];
    if (Array.isArray(skills)) {
      return skills.filter((s) => typeof s === 'string' && s.trim() !== '');
    }
    // CategorizedSkills: fields can be comma-separated strings OR arrays
    const catSkills = skills as CategorizedSkills;
    const splitField = (field: any): string[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field.filter((s: any) => typeof s === 'string' && s.trim() !== '');
      if (typeof field === 'string') return field.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };
    return [
      ...splitField(catSkills.technical),
      ...splitField(catSkills.tools),
      ...splitField(catSkills.soft),
    ];
  };

  const allSkills = getSkillsList();

  const renderBullets = (desc: string | string[]) => {
    if (Array.isArray(desc)) {
      return (
        <ul className="list-disc ml-4 mt-1 space-y-1 text-[11px] text-gray-800 leading-normal">
          {desc.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      );
    }
    if (typeof desc === 'string' && desc.includes('\n')) {
      const bullets = desc.split('\n').filter((b) => b.trim() !== '');
      return (
        <ul className="list-disc ml-4 mt-1 space-y-1 text-[11px] text-gray-800 leading-normal text-justify">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet.replace(/^[•\-\*]\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-[11px] text-gray-800 mt-1 whitespace-pre-wrap leading-normal text-justify">{desc}</p>;
  };

  // Helper for 5-dot proficiency rating
  const renderDotRating = (proficiency?: string) => {
    let filled = 4;
    if (proficiency === 'Native') filled = 5;
    if (proficiency === 'Fluent' || proficiency === 'Advanced') filled = 4;
    if (proficiency === 'Intermediate' || proficiency === 'Proficient') filled = 3;
    if (proficiency === 'Basic') filled = 2;

    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`w-2.5 h-2.5 rounded-full ${
              dot <= filled ? 'bg-sky-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // TEMPLATE 0: ENHANCV PROFESSIONAL TWO-COLUMN (Exact user request match)
  // --------------------------------------------------------------------------
  if (templateId === 'enhancv') {
    return (
      <div className="bg-white text-gray-900 p-8 min-h-[1100px] flex flex-col justify-between" style={{ fontFamily: activeFont }}>
        <div>
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8 pb-4">
            <div className="space-y-1.5 flex-1 pr-6">
              <h1 className="text-3xl font-extrabold tracking-wide uppercase text-gray-900">
                {personalInfo?.name || 'KARRI SRI CHAITANYA'}
              </h1>
              <p className="text-sm font-semibold" style={{ color: activeTheme.primary }}>
                {personalInfo?.jobTitle || 'The role you are applying for?'}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-700 font-medium pt-1">
                {personalInfo?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-sky-600" /> {personalInfo.phone}
                  </span>
                )}
                {personalInfo?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-sky-600" /> {personalInfo.email}
                  </span>
                )}
                {personalInfo?.linkedin && (
                  <span className="flex items-center gap-1 truncate max-w-[220px]">
                    <Linkedin className="h-3 w-3 text-sky-600 shrink-0" /> {personalInfo.linkedin}
                  </span>
                )}
                {personalInfo?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-600" /> {personalInfo.location}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Photo */}
            <div className="shrink-0">
              <img
                src={
                  personalInfo?.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={personalInfo?.name || 'Profile'}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
            </div>
          </div>

          {/* Two Column Content Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column (Width ~58%) */}
            <div className="col-span-7 space-y-6">
              {/* SUMMARY */}
              {professionalSummary && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-2">
                    SUMMARY
                  </h2>
                  <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
                    {professionalSummary}
                  </p>
                </div>
              )}

              {/* EDUCATION */}
              {education && education.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                    EDUCATION
                  </h2>
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={idx} className={`break-inside-avoid ${idx < education.length - 1 ? 'border-b border-dotted pb-2 border-gray-300' : ''}`}>
                        <h3 className="font-bold text-xs text-gray-900">{edu.degree || 'Bachelor of Technology'}</h3>
                        <p className="text-[11px] font-semibold text-sky-600">
                          {edu.institution || 'Centurion University'}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{edu.graduationDate || '08/2024 - 08/2028'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {allSkills.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                    SKILLS
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-gray-800">
                    {allSkills.map((sk, idx) => (
                      <span key={idx} className="border-b-2 border-gray-900 pb-0.5">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {experience && experience.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                    EXPERIENCE
                  </h2>
                  <div className="space-y-4">
                    {experience.map((exp, idx) => (
                      <div key={idx} className={`break-inside-avoid ${idx < experience.length - 1 ? 'border-b border-dotted pb-3 border-gray-300' : ''}`}>
                        <h3 className="font-bold text-xs text-gray-900">{exp.title}</h3>
                        <p className="text-[11px] font-semibold text-sky-600">{exp.company}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium my-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {exp.location}
                            </span>
                          )}
                        </div>
                        {renderBullets(exp.description)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KEY ACHIEVEMENTS */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  KEY ACHIEVEMENTS
                </h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Full-Stack & AI Development</h4>
                      <p className="text-[11px] text-gray-700 leading-snug">
                        Built multiple full-stack and AI-powered applications using Angular, Spring Boot, Java, MySQL, and Machine Learning, integrating secure REST APIs while strengthening problem-solving and software development skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STRENGTHS */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  STRENGTHS
                </h2>
                <div className="space-y-2 text-[11px]">
                  <div className="border-b border-dotted pb-2 border-gray-300">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <Gem className="h-3.5 w-3.5 text-sky-600" /> Problem Solving
                    </div>
                    <p className="text-gray-700 mt-0.5">Analyze complex challenges and develop practical, efficient solutions.</p>
                  </div>
                  <div className="border-b border-dotted pb-2 border-gray-300">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <Gem className="h-3.5 w-3.5 text-sky-600" /> Quick Learner
                    </div>
                    <p className="text-gray-700 mt-0.5">Learn new technologies quickly and apply them to real-world projects.</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                      <Gem className="h-3.5 w-3.5 text-sky-600" /> Team Collaboration
                    </div>
                    <p className="text-gray-700 mt-0.5">Work effectively with teams to deliver quality software projects.</p>
                  </div>
                </div>
              </div>

              {/* FIND ME ONLINE */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  FIND ME ONLINE
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">LinkedIn</div>
                      <div className="text-[10px] text-gray-500">{personalInfo?.name || 'Karri Sri Chaitanya'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">GitHub</div>
                      <div className="text-[10px] text-gray-500">Chaitanya2005-hub</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Width ~42%) */}
            <div className="col-span-5 space-y-6">
              {/* TRAINING / COURSES / CERTIFICATIONS */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  TRAINING / COURSES
                </h2>
                <div className="space-y-2 text-xs font-bold text-gray-900">
                  <div className="border-b border-dotted pb-1.5 border-gray-300">
                    <div>Cloud Infrastructure Analyst</div>
                    <div className="text-[10px] font-normal text-gray-500">SkillIndia</div>
                  </div>
                  <div className="border-b border-dotted pb-1.5 border-gray-300">
                    <div>Java</div>
                    <div className="text-[10px] font-normal text-gray-500">GeeksforGeeks</div>
                  </div>
                  <div className="border-b border-dotted pb-1.5 border-gray-300">
                    <div>Software Test Engineer</div>
                    <div className="text-[10px] font-normal text-gray-500">SkillIndia</div>
                  </div>
                  <div>
                    <div>Ethical Hacking</div>
                    <div className="text-[10px] font-normal text-gray-500">Cisco</div>
                  </div>
                </div>
              </div>

              {/* LANGUAGES */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  LANGUAGES
                </h2>
                <div className="space-y-3">
                  {languages && languages.length > 0 ? (
                    languages.map((lang, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-gray-900">{lang.language}</div>
                          <div className="text-[10px] text-gray-500">{lang.proficiency}</div>
                        </div>
                        {renderDotRating(lang.proficiency)}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-gray-900">English</div>
                          <div className="text-[10px] text-gray-500">Advanced</div>
                        </div>
                        {renderDotRating('Advanced')}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-gray-900">Telugu</div>
                          <div className="text-[10px] text-gray-500">Native</div>
                        </div>
                        {renderDotRating('Native')}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-gray-900">Hindi</div>
                          <div className="text-[10px] text-gray-500">Proficient</div>
                        </div>
                        {renderDotRating('Proficient')}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PROJECTS */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-0.5 mb-3">
                  PROJECTS
                </h2>
                <div className="space-y-4">
                  {projects && projects.length > 0 ? (
                    projects.map((proj, idx) => (
                      <div key={idx} className={`break-inside-avoid ${idx < projects.length - 1 ? 'border-b border-dotted pb-3 border-gray-300' : ''}`}>
                        <h3 className="font-bold text-xs text-gray-900">{proj.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium my-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> 02/2026 - 04/2026
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Remote
                          </span>
                        </div>
                        {renderBullets(proj.description)}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-3">
                      <div className="border-b border-dotted pb-2 border-gray-300">
                        <h3 className="font-bold text-xs text-gray-900">Diabetes Prediction System</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 my-1">
                          <Calendar className="h-3 w-3" /> 02/2026 - 04/2026 • Remote
                        </div>
                        <p className="text-[10px] text-gray-700">A machine learning application that predicts diabetes risk using healthcare datasets.</p>
                      </div>

                      <div className="border-b border-dotted pb-2 border-gray-300">
                        <h3 className="font-bold text-xs text-gray-900">AI Resume Builder</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 my-1">
                          <Calendar className="h-3 w-3" /> 02/2026 - 02/2026 • Remote
                        </div>
                        <p className="text-[10px] text-gray-700">A web-based application that uses AI to generate professional, ATS-friendly resumes.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LAYOUT 1: CLASSIC MODERN
  // --------------------------------------------------------------------------
  if (templateId === 'classic') {
    return (
      <div className="bg-white text-gray-900 p-8 min-h-[1050px]" style={{ fontFamily: activeFont }}>
        <div className="border-b-2 pb-5 mb-6" style={{ borderColor: activeTheme.primary }}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{personalInfo?.name || 'Your Name'}</h1>
          {personalInfo?.jobTitle && (
            <div className="text-lg font-semibold mt-0.5" style={{ color: activeTheme.primary }}>
              {personalInfo.jobTitle}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-3">
            {personalInfo?.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {personalInfo.email}</span>}
            {personalInfo?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {personalInfo.phone}</span>}
            {personalInfo?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {personalInfo.location}</span>}
            {personalInfo?.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn</span>}
            {personalInfo?.github && <span className="flex items-center gap-1"><Github className="h-3 w-3" /> GitHub</span>}
          </div>
        </div>

        {professionalSummary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: activeTheme.primary }}>
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed text-justify">{professionalSummary}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-gray-900">{exp.title}</span>
                    <span className="text-xs text-gray-500 font-medium">{exp.startDate} – {exp.endDate || 'Present'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-gray-900">{edu.institution}</div>
                    <div className="text-xs text-gray-700">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                    {edu.gpa && <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>}
                  </div>
                  <div className="text-right text-xs text-gray-500 font-medium">
                    <div>{edu.graduationDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allSkills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((sk, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ backgroundColor: activeTheme.bgSoft, borderColor: activeTheme.border, color: activeTheme.textAccent }}
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-gray-900">{proj.name}</span>
                    {proj.technologies && (
                      <span className="text-xs text-gray-500 font-medium">{proj.technologies}</span>
                    )}
                  </div>
                  {renderBullets(proj.description)}
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Certifications
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-xs text-gray-500">— {cert.issuer}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: activeTheme.primary }}>
              Languages
            </h2>
            <div className="flex flex-wrap gap-4">
              {languages.map((lang, i) => (
                <div key={i} className="text-xs">
                  <span className="font-bold text-gray-900">{lang.language}</span>
                  {lang.proficiency && <span className="text-gray-500"> — {lang.proficiency}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LAYOUT 2: EXECUTIVE (TWO-COLUMN WITH SIDEBAR)
  // --------------------------------------------------------------------------
  if (templateId === 'executive') {
    return (
      <div className="bg-white text-gray-900 min-h-[1050px] grid grid-cols-12" style={{ fontFamily: activeFont }}>
        <div className="col-span-4 p-6 text-white space-y-6" style={{ backgroundColor: activeTheme.primary }}>
          <div>
            <h1 className="text-2xl font-bold text-center leading-tight">{personalInfo?.name || 'Your Name'}</h1>
            {personalInfo?.jobTitle && <p className="text-xs text-center text-white/80 mt-1 font-medium">{personalInfo.jobTitle}</p>}
          </div>
          <div className="space-y-2 text-xs border-t border-white/20 pt-4">
            <h3 className="font-bold uppercase tracking-wider text-white/90 text-xs mb-2">Contact</h3>
            {personalInfo?.email && <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /> {personalInfo.email}</div>}
            {personalInfo?.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /> {personalInfo.phone}</div>}
          </div>
        </div>

        <div className="col-span-8 p-6 space-y-6">
          {professionalSummary && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b pb-1" style={{ color: activeTheme.primary }}>
                Summary
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed text-justify">{professionalSummary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LAYOUT 3: MINIMALIST
  // --------------------------------------------------------------------------
  return (
    <div className="bg-white text-gray-900 p-8 min-h-[1050px]" style={{ fontFamily: activeFont }}>
      <div className="text-center pb-6 mb-6 border-b border-gray-200">
        <h1 className="text-4xl font-light tracking-wide text-gray-900 uppercase">{personalInfo?.name || 'Your Name'}</h1>
        {personalInfo?.jobTitle && <p className="text-sm font-medium tracking-widest text-gray-500 uppercase mt-1">{personalInfo.jobTitle}</p>}
      </div>
      {professionalSummary && (
        <div className="mb-6">
          <p className="text-sm text-gray-700 leading-relaxed font-light text-justify">{professionalSummary}</p>
        </div>
      )}
    </div>
  );
}

export interface PersonalInfo {
  name: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photoUrl?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string;
}

export interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string | string[];
}

export interface ProjectItem {
  id?: string;
  name: string;
  description: string | string[];
  technologies?: string[];
  url?: string;
  githubUrl?: string;
}

export interface CategorizedSkills {
  technical: string[];
  soft: string[];
  tools: string[];
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
}

export interface LanguageItem {
  id?: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
}

export interface AchievementItem {
  id?: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface ReferenceItem {
  id?: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export type TemplateId = 'enhancv' | 'classic' | 'executive' | 'minimalist' | 'tech';
export type ColorTheme = 'emerald' | 'royal' | 'sunset' | 'crimson' | 'monochrome';
export type FontStyle = 'inter' | 'roboto' | 'outfit' | 'playfair';

export interface ResumeData {
  id?: string;
  title?: string;
  lastModified?: string;
  version?: number;
  atsScore?: number;
  templateId?: TemplateId;
  colorTheme?: ColorTheme;
  fontStyle?: FontStyle;
  
  personalInfo: PersonalInfo;
  professionalSummary?: string;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  skills?: CategorizedSkills | string[];
  certifications?: CertificationItem[];
  languages?: LanguageItem[];
  achievements?: AchievementItem[];
  interests?: string[];
  references?: ReferenceItem[];
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  Plus,
  Trash2,
  Loader2,
  Wand2,
  Code,
  Award,
  Globe,
  BookOpen,
  CheckCircle,
  Layout,
  Palette,
  Type,
  Users,
  Heart,
  ShieldCheck,
  Camera,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateScore, generatePlainText, KEYWORDS } from '@/lib/atsUtils';
import { generateResumeContent } from '@/ai/flows/generate-resume-content-flow';
import ResumePreview from '@/components/resume-preview';
import AIAssistantPanel from '@/components/ai-assistant-panel';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';
import { TemplateId, ColorTheme, FontStyle } from '@/types/resume';

const resumeFormSchema = z.object({
  magicPrompt: z.string().optional(),
  personalInfo: z.object({
    name: z.string().optional(),
    jobTitle: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
    photoUrl: z.string().optional(),
  }),
  professionalSummary: z.string().optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationDate: z.string().optional(),
    gpa: z.string().optional(),
    achievements: z.string().optional(),
  })),
  skills: z.object({
    technical: z.string().optional(),
    soft: z.string().optional(),
    tools: z.string().optional(),
  }),
  experience: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })),
  projects: z.array(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    technologies: z.string().optional(),
    url: z.string().optional(),
  })),
  certifications: z.array(z.object({
    name: z.string().optional(),
    issuer: z.string().optional(),
    issueDate: z.string().optional(),
    credentialUrl: z.string().optional(),
  })),
  languages: z.array(z.object({
    language: z.string().optional(),
    proficiency: z.string().optional(),
  })),
  achievements: z.array(z.object({
    title: z.string().optional(),
    issuer: z.string().optional(),
    description: z.string().optional(),
  })),
  interests: z.string().optional(),
  references: z.array(z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
  })),
  jobDescription: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export default function BuilderPage() {
  const [mode, setMode] = useState<'magic' | 'manual'>('manual');
  const [templateId, setTemplateId] = useState<TemplateId>('enhancv');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('royal');
  const [fontStyle, setFontStyle] = useState<FontStyle>('inter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<any | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(92);
  const { toast } = useToast();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      magicPrompt: '',
      personalInfo: {
        name: 'KARRI SRI CHAITANYA',
        jobTitle: 'Full-Stack & AI Engineer',
        email: 'karrisrichaitanya@gmail.com',
        phone: '8106057288',
        location: 'Vizianagaram',
        linkedin: 'http://www.linkedin.com/in/karri-sri-chaitanya-268149354',
        github: 'https://github.com/Chaitanya2005-hub',
        portfolio: '',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      professionalSummary:
        'Computer Science Engineering student passionate about Full-Stack Development, AI, and Software Engineering. Experienced in Angular, Java, Spring Boot, MySQL, and building real-world projects with a strong focus on problem-solving and continuous learning.\n\nComputer Science Engineering student specializing in Full-Stack and AI development, with hands-on experience in Angular, Java, Spring Boot, and MySQL. Proven ability to design and deploy secure, scalable applications.',
      education: [
        {
          institution: 'Centurion University: Best Private University in Vizianagaram, AP',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science Engineering',
          graduationDate: '08/2024 - 08/2028',
          gpa: '8.8',
          achievements: 'President of AI Club, Top 5% Academic Ranking',
        },
        {
          institution: 'Sri Chaitanya College of Education',
          degree: 'Intermediate',
          graduationDate: '03/2021 - 03/2023',
        },
      ],
      experience: [
        {
          title: 'Python Intern',
          company: 'VaultofCodes',
          location: 'Remote',
          startDate: '05/2025',
          endDate: '07/2025',
          description: '• I have accomplished the whole project by using Python algorithms and backend data automation.',
        },
        {
          title: 'Python Developer',
          company: 'Google',
          location: 'Remote',
          startDate: '08/2025',
          endDate: '07/2025',
          description: '• Highlight your accomplishments, using numbers if possible to quantify system optimizations.',
        },
      ],
      projects: [
        {
          name: 'Diabetes Prediction System',
          description:
            'A machine learning application that predicts diabetes risk using healthcare datasets and predictive analytics.\n• Cleaned and preprocessed real-world healthcare data.\n• Implemented Logistic Regression for disease prediction.\n• Evaluated model performance using standard ML metrics.',
          technologies: 'Python, Scikit-Learn, Machine Learning, Pandas',
        },
        {
          name: 'AI Resume Builder',
          description:
            'A web-based application that uses AI to generate professional, ATS-friendly resumes from user-provided information.\n• Developed an intuitive interface for resume creation.\n• Generated structured resumes using AI assistance.\n• Created modern and ATS-friendly resume layouts.',
          technologies: 'Next.js, TypeScript, Genkit AI, TailwindCSS',
        },
      ],
      skills: {
        technical: 'Java, Python, C, C++, HTML, AWS',
        soft: 'Problem Solving, Quick Learner, Team Collaboration, Adaptability',
        tools: 'MySQL, Spring Boot, Angular, Git, VS Code',
      },
      certifications: [
        {
          name: 'Cloud Infrastructure Analyst',
          issuer: 'SkillIndia',
        },
        {
          name: 'Java',
          issuer: 'GeeksforGeeks',
        },
        {
          name: 'Software Test Engineer',
          issuer: 'SkillIndia',
        },
        {
          name: 'Ethical Hacking',
          issuer: 'Cisco',
        },
      ],
      languages: [
        { language: 'English', proficiency: 'Advanced' },
        { language: 'Telugu', proficiency: 'Native' },
        { language: 'Hindi', proficiency: 'Proficient' },
        { language: 'Oriya', proficiency: 'Advanced' },
      ],
      achievements: [
        {
          title: 'GenAI Exchange Hackathon',
          issuer: 'Hack2skill',
          description: 'Participated in the hackathon and gained industrial experience in AI application development.',
        },
      ],
      interests: 'Machine Learning, Open Source, Problem Solving',
      references: [],
      jobDescription: '',
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: 'experience' });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: 'projects' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: 'certifications' });
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: 'languages' });

  const onSubmit = async (data: ResumeFormValues) => {
    setIsGenerating(true);
    try {
      let processedData;
      if (mode === 'magic') {
        processedData = { rawInput: data.magicPrompt, jobDescription: data.jobDescription };
      } else {
        processedData = {
          ...data,
          skills: [
            ...(data.skills.technical ? data.skills.technical.split(',').map((s) => s.trim()) : []),
            ...(data.skills.tools ? data.skills.tools.split(',').map((s) => s.trim()) : []),
            ...(data.skills.soft ? data.skills.soft.split(',').map((s) => s.trim()) : []),
          ],
        };
      }

      const result = await generateResumeContent(processedData as any);
      const plainText = generatePlainText(result);
      const score = calculateScore(plainText);

      setOptimizedResume(result);
      setAtsScore(score);
      toast({
        title: "Resume Architected!",
        description: `Successfully optimized content with ${score}% ATS score.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Note",
        description: "Updated preview with provided details.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if ((window as any).downloadResumePDF) {
        await (window as any).downloadResumePDF();
        toast({ title: "Downloading PDF", description: "Your PDF file is ready." });
      } else {
        throw new Error("PDF Engine loading...");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Download Error", description: "Could not generate PDF." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 lg:px-8 pt-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Builder</h1>
          <p className="text-muted-foreground">Create and optimize your professional resume with AI assistance.</p>
        </div>

        {/* Template & Style Controls */}
        <Card className="border shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layout className="text-primary h-5 w-5" /> Template & Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Template Selection */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase">Template:</span>
                <Select value={templateId} onValueChange={(v) => setTemplateId(v as TemplateId)}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="tech">Tech Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Theme */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase">Color:</span>
                <Select value={colorTheme} onValueChange={(v) => setColorTheme(v as ColorTheme)}>
                  <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="royal">Royal Blue</SelectItem>
                    <SelectItem value="emerald">Emerald Navy</SelectItem>
                    <SelectItem value="sunset">Sunset Purple</SelectItem>
                    <SelectItem value="crimson">Crimson Red</SelectItem>
                    <SelectItem value="monochrome">Monochrome</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Style */}
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase">Font:</span>
                <Select value={fontStyle} onValueChange={(v) => setFontStyle(v as FontStyle)}>
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="outfit">Outfit</SelectItem>
                    <SelectItem value="playfair">Playfair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} disabled={isDownloading} className="gap-2 font-bold">
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Builder & Preview Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Form Column */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="border shadow-xl">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5" /> Resume Content Editor
                  </CardTitle>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                    <TabsList className="h-8">
                      <TabsTrigger value="manual" className="text-xs">
                        Manual Form
                      </TabsTrigger>
                      <TabsTrigger value="magic" className="text-xs">
                        Magic AI
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form id="resume-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {mode === 'magic' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="magicPrompt" className="font-bold text-sm">
                          Paste Existing Resume or Notes
                        </Label>
                        <Textarea
                          id="magicPrompt"
                          {...form.register('magicPrompt')}
                          placeholder="Paste unstructured resume text here..."
                          className="min-h-[250px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobDesc" className="font-bold text-sm">
                          Target Job Description (Optional)
                        </Label>
                        <Textarea
                          id="jobDesc"
                          {...form.register('jobDescription')}
                          placeholder="Paste job description to extract keywords..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid grid-cols-4 h-auto p-1 mb-4 gap-1 bg-muted">
                        <TabsTrigger value="personal" className="text-xs py-1.5">
                          Personal
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="text-xs py-1.5">
                          Summary
                        </TabsTrigger>
                        <TabsTrigger value="experience" className="text-xs py-1.5">
                          Experience
                        </TabsTrigger>
                        <TabsTrigger value="education" className="text-xs py-1.5">
                          Education
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="text-xs py-1.5">
                          Skills
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="text-xs py-1.5">
                          Projects
                        </TabsTrigger>
                        <TabsTrigger value="certifications" className="text-xs py-1.5">
                          More
                        </TabsTrigger>
                      </TabsList>

                      {/* 1. Personal Info Tab */}
                      <TabsContent value="personal" className="space-y-4">
                        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" /> Personal Information
                        </h3>

                        {/* Photo Upload */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">Profile Photo</Label>
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              {form.watch('personalInfo.photoUrl') ? (
                                <>
                                  <img
                                    src={form.watch('personalInfo.photoUrl')}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => form.setValue('personalInfo.photoUrl', '')}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </>
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary/40 flex items-center justify-center">
                                  <Camera className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-2">
                              <label
                                htmlFor="photo-upload"
                                className="flex items-center gap-2 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-2 rounded-lg border border-primary/30 transition-colors w-fit"
                              >
                                <Camera className="h-3.5 w-3.5" /> Upload Photo
                              </label>
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    form.setValue('personalInfo.photoUrl', reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <p className="text-[10px] text-muted-foreground">Or paste an image URL below</p>
                              <Input
                                {...form.register('personalInfo.photoUrl')}
                                placeholder="https://example.com/photo.jpg"
                                className="h-7 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Full Name</Label>
                            <Input {...form.register('personalInfo.name')} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Job Title</Label>
                            <Input {...form.register('personalInfo.jobTitle')} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Email</Label>
                            <Input {...form.register('personalInfo.email')} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Phone</Label>
                            <Input {...form.register('personalInfo.phone')} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Location</Label>
                          <Input {...form.register('personalInfo.location')} placeholder="City, State" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">LinkedIn URL</Label>
                            <Input {...form.register('personalInfo.linkedin')} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">GitHub / Portfolio</Label>
                            <Input {...form.register('personalInfo.github')} />
                          </div>
                        </div>
                      </TabsContent>

                      {/* 2. Professional Summary Tab */}
                      <TabsContent value="summary" className="space-y-4">
                        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" /> Professional Summary
                        </h3>
                        <Textarea
                          {...form.register('professionalSummary')}
                          placeholder="Craft a 3-4 sentence overview of your accomplishments and target role..."
                          className="min-h-[160px]"
                        />
                      </TabsContent>

                      {/* 3. Work Experience Tab */}
                      <TabsContent value="experience" className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" /> Work Experience
                          </h3>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => appendExp({ title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Role
                          </Button>
                        </div>
                        {expFields.map((field, idx) => (
                          <div key={field.id} className="p-4 border rounded-xl space-y-3 bg-muted/20 relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 text-red-500"
                              onClick={() => removeExp(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                              <Input {...form.register(`experience.${idx}.title`)} placeholder="Job Title" />
                              <Input {...form.register(`experience.${idx}.company`)} placeholder="Company Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input {...form.register(`experience.${idx}.startDate`)} placeholder="Start Date (e.g. Jan 2022)" />
                              <Input {...form.register(`experience.${idx}.endDate`)} placeholder="End Date or Present" />
                            </div>
                            <Textarea
                              {...form.register(`experience.${idx}.description`)}
                              placeholder="Bullet points of achievements..."
                              className="min-h-[100px]"
                            />
                          </div>
                        ))}
                      </TabsContent>

                      {/* 4. Education Tab */}
                      <TabsContent value="education" className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" /> Education
                          </h3>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => appendEdu({ institution: '', degree: '', fieldOfStudy: '', graduationDate: '', gpa: '', achievements: '' })}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
                          </Button>
                        </div>
                        {eduFields.map((field, idx) => (
                          <div key={field.id} className="p-4 border rounded-xl space-y-3 bg-muted/20 relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 text-red-500"
                              onClick={() => removeEdu(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Input {...form.register(`education.${idx}.institution`)} placeholder="Institution / University" />
                            <div className="grid grid-cols-2 gap-3">
                              <Input {...form.register(`education.${idx}.degree`)} placeholder="Degree (e.g. B.S.)" />
                              <Input {...form.register(`education.${idx}.fieldOfStudy`)} placeholder="Field of Study" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input {...form.register(`education.${idx}.graduationDate`)} placeholder="Graduation Year/Date" />
                              <Input {...form.register(`education.${idx}.gpa`)} placeholder="GPA / Grade (Optional)" />
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      {/* 5. Skills Tab */}
                      <TabsContent value="skills" className="space-y-4">
                        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
                          <Code className="h-4 w-4 text-primary" /> Categorized Skills
                        </h3>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Technical Skills (comma separated)</Label>
                            <Textarea {...form.register('skills.technical')} placeholder="TypeScript, React, Node.js, Python..." />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tools & Technologies</Label>
                            <Textarea {...form.register('skills.tools')} placeholder="Git, Docker, AWS, Figma, VS Code..." />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Soft Skills & Leadership</Label>
                            <Textarea {...form.register('skills.soft')} placeholder="Agile Leadership, Communication, Problem Solving..." />
                          </div>
                        </div>
                      </TabsContent>

                      {/* 6. Projects Tab */}
                      <TabsContent value="projects" className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" /> Key Projects
                          </h3>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => appendProj({ name: '', description: '', technologies: '', url: '' })}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Project
                          </Button>
                        </div>
                        {projFields.map((field, idx) => (
                          <div key={field.id} className="p-4 border rounded-xl space-y-3 bg-muted/20 relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 text-red-500"
                              onClick={() => removeProj(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Input {...form.register(`projects.${idx}.name`)} placeholder="Project Name" />
                            <Input {...form.register(`projects.${idx}.technologies`)} placeholder="Technologies Used" />
                            <Textarea {...form.register(`projects.${idx}.description`)} placeholder="Short description..." />
                          </div>
                        ))}
                      </TabsContent>

                      {/* 7. Certifications & Languages Tab */}
                      <TabsContent value="certifications" className="space-y-4">
                        <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" /> Certifications & Extra Sections
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold">Certifications</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => appendCert({ name: '', issuer: '', issueDate: '', credentialUrl: '' })}
                            >
                              + Add Cert
                            </Button>
                          </div>
                          {certFields.map((field, idx) => (
                            <div key={field.id} className="grid grid-cols-2 gap-2 p-2 border rounded-lg bg-muted/20">
                              <Input {...form.register(`certifications.${idx}.name`)} placeholder="Certificate Name" />
                              <Input {...form.register(`certifications.${idx}.issuer`)} placeholder="Issuer (e.g. AWS)" />
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 border-t pt-4 bg-muted/5">
                <Button type="submit" form="resume-form" disabled={isGenerating} className="w-full h-12 text-base font-bold rounded-xl">
                  {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />} Architect & Optimize Resume
                </Button>

                {atsScore !== null && (
                  <div className="text-center text-xs font-semibold text-muted-foreground">
                    Estimated ATS Compatibility Score:{' '}
                    <span className={atsScore >= 70 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {atsScore}%
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Right Live Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" /> Live WYSIWYG Preview
              </h3>
              <Link href="/ats-checker">
                <Button variant="outline" size="sm" className="text-xs">
                  Run Full ATS Check
                </Button>
              </Link>
            </div>

            <ResumePreview
              control={form.control}
              optimizedData={optimizedResume}
              templateId={templateId}
              colorTheme={colorTheme}
              fontStyle={fontStyle}
            />
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Drawer */}
      <AIAssistantPanel
        onApplySummary={(sum) => form.setValue('professionalSummary', sum)}
        onApplySkills={(skillsList) => form.setValue('skills.technical', skillsList.join(', '))}
      />
    </DashboardLayout>
  );
}

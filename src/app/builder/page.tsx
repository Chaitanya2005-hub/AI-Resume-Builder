'use client';

import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { calculateScore, generatePlainText, KEYWORDS } from '@/lib/atsUtils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateResumeContent } from '@/ai/flows/generate-resume-content-flow';
import type { GenerateResumeContentOutput } from '@/ai/flows/generate-resume-content-flow';
import ResumePreview from '@/components/resume-preview';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

const resumeFormSchema = z.object({
  magicPrompt: z.string().optional(),
  personalInfo: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
  }),
  professionalSummary: z.string().optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationDate: z.string().optional(),
    achievements: z.string().optional(),
  })),
  skills: z.array(z.string()).optional(),
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
    url: z.string().url().optional().or(z.literal('')),
  })),
  jobDescription: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export default function BuilderPage() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'magic' | 'manual'>('magic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<GenerateResumeContentOutput | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      magicPrompt: '',
      personalInfo: { name: '', email: '', phone: '', linkedin: '', portfolio: '' },
      professionalSummary: '',
      education: [{ institution: '', degree: '', fieldOfStudy: '', graduationDate: '', achievements: '' }],
      experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
      projects: [{ name: '', description: '', technologies: '', url: '' }],
      skills: [''],
      jobDescription: '',
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const onSubmit = async (data: ResumeFormValues) => {
    setIsGenerating(true);
    try {
      let processedData;
      if (mode === 'magic') {
        processedData = {
          rawInput: data.magicPrompt,
          jobDescription: data.jobDescription,
        };
      } else {
        processedData = {
          ...data,
          projects: data.projects.map(p => ({
            ...p,
            technologies: p.technologies ? p.technologies.split(',').map(t => t.trim()) : [],
          })),
          skills: data.skills?.filter(s => s.trim() !== '') || [],
        };
      }

      const result = await generateResumeContent(processedData as any);

      // --- ATS processing ----------------------------------------------------
      // Generate plain text representation of the resume
      const plainText = generatePlainText(result);
      const score = calculateScore(plainText);
      let adjustedResume = { ...result };

      // If score is below a threshold, inject missing keywords into skills and summary
      if (score < 70) {
        const missing = KEYWORDS.filter((kw) => !plainText.toLowerCase().includes(kw));
        // Add missing keywords to skills (avoid duplicates)
        const existingSkills = Array.isArray(adjustedResume.skills) ? adjustedResume.skills : [];
        adjustedResume.skills = Array.from(new Set([...existingSkills, ...missing]));
        // Append missing keywords to professional summary for better coverage
        const extraSummary = missing.join(' ');
        adjustedResume.professionalSummary =
          (adjustedResume.professionalSummary || '') + (adjustedResume.professionalSummary ? ' ' : '') + extraSummary;
      }

      setOptimizedResume(adjustedResume);
      setAtsScore(score);
      // ----------------------------------------------------------------------
      toast({
        title: "Success!",
        description: "Your resume has been architected by AI.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate resume. Please try again.",
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
        toast({
          title: "Downloading",
          description: "Generating your professional PDF...",
        });
      } else {
        throw new Error("Download engine not ready");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Resume Architect</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/ats-checker" className="ml-4 text-sm font-medium text-primary hover:underline">ATS Checker</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <Card className="border shadow-xl">
              <CardHeader className="bg-primary/5 rounded-t-xl border-b">
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Sparkles className="text-primary h-6 w-6" /> Builder
                  </CardTitle>
                  <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                    <TabsList>
                      <TabsTrigger value="magic">Magic</TabsTrigger>
                      <TabsTrigger value="manual">Manual</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>
                  {mode === 'magic' ? "AI-powered generation from raw text." : "Complete your details manually."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form id="resume-form" onSubmit={form.handleSubmit(onSubmit)}>
                  {mode === 'magic' ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="magicPrompt" className="text-lg font-bold">Paste Your Resume Content</Label>
                        <Textarea 
                          id="magicPrompt"
                          {...form.register('magicPrompt')}
                          placeholder="My name is Alex. I have 5 years of experience in project management..."
                          className="min-h-[300px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobDesc" className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Target Job</Label>
                        <Textarea 
                          id="jobDesc"
                          {...form.register('jobDescription')}
                          placeholder="Paste a job description to optimize for..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2"><User /> Personal Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...form.register('personalInfo.name')} placeholder="Name" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" {...form.register('personalInfo.email')} placeholder="Email" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2"><Briefcase /> Experience</h3>
                        {expFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-xl relative bg-muted/20">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Input {...form.register(`experience.${index}.title`)} placeholder="Job Title" className="mb-2" />
                            <Input {...form.register(`experience.${index}.company`)} placeholder="Company" className="mb-2" />
                            <Textarea {...form.register(`experience.${index}.description`)} placeholder="Achievements..." />
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => appendExp({ title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}>
                          <Plus className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/5">
                <Button 
                  type="submit" 
                  form="resume-form" 
                  disabled={isGenerating}
                  className="w-full h-14 text-lg font-bold rounded-xl"
                >
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Architecting...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Generate Professional Resume</>
                  )}
                </Button>
                {atsScore !== null && (
                  <div className="mt-2 text-center text-sm font-medium">
                    ATS Match Score: <span className={atsScore >= 70 ? 'text-green-600' : 'text-red-600'}>{atsScore}%</span>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="text-primary" /> Preview
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="default" onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                        Download PDF
                      </Button>
                    </TooltipTrigger>
                    {!optimizedResume && (
                      <TooltipContent>
                        <p>Generate resume first to download</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
             </div>
             
             <div className="rounded-xl overflow-hidden border-4 border-primary/10 shadow-2xl">
              <ResumePreview 
                control={form.control}
                optimizedData={optimizedResume}
              />
             </div>
            <div className="mt-4 text-center">
              <Link href="/ats-checker">
                <Button variant="outline">Check ATS Compatibility</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {isGenerating && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center">
          <Wand2 className="h-20 w-20 text-primary animate-bounce" />
          <h2 className="text-3xl font-bold mt-8">AI is Building...</h2>
          <p className="text-muted-foreground mt-4">Crafting your professional profile.</p>
        </div>
      )}
    </div>
  );
}

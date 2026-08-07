'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Briefcase, FileText, CheckCircle2, XCircle, Globe, Link2, Mail, Zap } from 'lucide-react';
import { MatchPreviewModal } from '@/components/job-matching/MatchPreviewModal';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardResumeItem } from '../page';

export default function JobMatchingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedJob, setParsedJob] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [resumes, setResumes] = useState<DashboardResumeItem[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [autoApply, setAutoApply] = useState(false);
  const [senderEmail, setSenderEmail] = useState(user?.email || '');

  useEffect(() => {
    const stored = localStorage.getItem('ai_resumes_list');
    console.log('[Job Matching] Loading resumes from localStorage:', !!stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[Job Matching] Parsed resumes:', parsed);
        setResumes(parsed);
      } catch (e) {
        console.error('[Job Matching] Failed to parse resumes from local storage:', e);
      }
    } else {
      console.log('[Job Matching] No resumes found in localStorage, using initial data');
      // Add sample resumes for testing
      const sampleResumes = [
        {
          id: 'sample_1',
          title: 'Sample Software Engineer Resume',
          targetRole: 'Full Stack Developer',
          lastModified: 'Just now',
          atsScore: 85,
          templateId: 'tech' as const,
        }
      ];
      setResumes(sampleResumes);
      localStorage.setItem('ai_resumes_list', JSON.stringify(sampleResumes));
    }
  }, []);

  const handleSearchJobs = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Error', description: 'Enter a keyword (e.g., React Developer)', variant: 'destructive' });
      return;
    }

    setIsSearchingJobs(true);
    try {
      const res = await fetch('/api/job-listings/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data || []);
        toast({ 
          title: 'Search Results Loaded', 
          description: `Found ${data.data?.length || 0} jobs via ${data.source === 'jsearch_api' ? 'RapidAPI JSearch' : 'Job Feed'}` 
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to search job platforms', variant: 'destructive' });
    } finally {
      setIsSearchingJobs(false);
    }
  };

  const handleSelectJob = (job: any) => {
    const text = job.job_description || `${job.job_title} at ${job.employer_name}`;
    setJobDescription(text);
    toast({ title: 'Job Selected', description: `Loaded "${job.job_title}" for matching!` });
  };

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter a job posting URL', variant: 'destructive' });
      return;
    }

    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/job-listings/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobDescription(data.extractedText);
        toast({ title: 'Job Content Loaded', description: `Successfully extracted text from ${data.hostname}` });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({ 
        title: 'URL Fetch Warning', 
        description: error.message || 'Could not fetch directly. You can paste the job description text manually below.', 
        variant: 'destructive' 
      });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleParseJob = async () => {
    console.log('[handleParseJob] Starting...', { jobDescriptionLength: jobDescription.length, userId: user?.id });
    toast({ title: 'Debug', description: 'Starting job analysis...' });
    
    if (!jobDescription.trim()) {
      toast({ title: 'Error', description: 'Please enter a job description or URL', variant: 'destructive' });
      return;
    }
    if (!user) {
      console.log('[handleParseJob] No user found');
      toast({ title: 'Error', description: 'User not authenticated', variant: 'destructive' });
      return;
    }

    setIsParsing(true);
    try {
      console.log('[handleParseJob] Calling parse API...');
      toast({ title: 'Debug', description: 'Parsing job description...' });
      
      const res = await fetch('/api/job-listings/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, userId: user.id, source: jobUrl ? 'url' : 'manual' }),
      });
      const data = await res.json();
      console.log('[handleParseJob] Parse response:', { ok: res.ok, data });
      
      if (res.ok) {
        setParsedJob(data);
        toast({ title: 'Success', description: 'Job description parsed successfully.' });
        console.log('[handleParseJob] Calling computeMatches...');
        toast({ title: 'Debug', description: 'Computing resume matches...' });
        computeMatches(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('[handleParseJob] Error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to parse job description.', variant: 'destructive' });
    } finally {
      setIsParsing(false);
    }
  };

  const computeMatches = async (jobListing: any) => {
    console.log('[computeMatches] Starting...', { user: !!user, resumesCount: resumes.length });
    
    if (!user) {
      console.log('[computeMatches] Early return - no user');
      toast({ title: 'Error', description: 'User not authenticated', variant: 'destructive' });
      return;
    }
    
    if (resumes.length === 0) {
      console.log('[computeMatches] Early return - no resumes');
      toast({ title: 'Error', description: 'No resumes available. Please create a resume first.', variant: 'destructive' });
      return;
    }
    
    setIsMatching(true);
    setMatches([]);
    
    try {
      const computedMatches = [];
      // Calculate match for each resume
      for (const resume of resumes) {
        // Since resume data isn't fully structured in local storage for the dashboard item, 
        // we'll pass the title/target role as a simplified text representation for matching.
        // In a full implementation, we would fetch the complete resume JSON.
        const resumeText = `Title: ${resume.title}\nTarget Role: ${resume.targetRole}\n`;
        
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            resumeId: resume.id,
            resumeText,
            jobListingId: jobListing.id,
          }),
        });

        if (res.ok) {
          const matchData = await res.json();
          computedMatches.push({ ...matchData, resume });
        }
      }

      // Sort by highest score
      computedMatches.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(computedMatches);

      // Auto-apply if enabled and we have matches
      console.log('[Auto-Apply Check]', { autoApply, matchesCount: computedMatches.length, senderEmail: !!senderEmail });
      if (autoApply && computedMatches.length > 0 && senderEmail) {
        console.log('[Auto-Apply] Triggering auto-apply...');
        toast({ title: 'Auto-Apply Starting', description: 'Tailoring resume and sending application...' });
        await autoApplyToJobs(computedMatches, jobListing);
      } else {
        console.log('[Auto-Apply] Skipped - conditions not met');
        if (autoApply) {
          if (!senderEmail) {
            toast({ title: 'Auto-Apply Skipped', description: 'Please enter your email address for auto-apply', variant: 'destructive' });
          } else if (computedMatches.length === 0) {
            toast({ title: 'Auto-Apply Skipped', description: 'No resumes available to match', variant: 'destructive' });
          }
        }
      }
    } catch (error) {
      console.error('[Auto-Apply] Error in computeMatches:', error);
      toast({ title: 'Error', description: 'Failed to compute matches.', variant: 'destructive' });
    } finally {
      setIsMatching(false);
    }
  };

  const autoApplyToJobs = async (matches: any[], jobListing: any) => {
    console.log('[Auto-Apply] Starting auto-apply process...', { matchesCount: matches.length });
    const bestMatch = matches[0]; // Apply with the best matching resume
    console.log('[Auto-Apply] Best match:', { score: bestMatch?.matchScore, resumeId: bestMatch?.resume?.id });
    
    if (!bestMatch || bestMatch.matchScore < 70) {
      console.log('[Auto-Apply] Skipped - score below 70 or no match');
      toast({ 
        title: 'Auto-Apply Skipped', 
        description: 'Best match score below 70%. Review manually before applying.', 
        variant: 'default' 
      });
      return;
    }

    if (!user) {
      console.log('[Auto-Apply] Skipped - user not authenticated');
      toast({ title: 'Error', description: 'User not authenticated', variant: 'destructive' });
      return;
    }

    try {
      // Try to extract company email from job listing
      const targetEmail = extractCompanyEmail(jobListing.originalText) || 'careers@company.com';
      console.log('[Auto-Apply] Target email:', targetEmail);
      
      // Fetch resume data
      let resumeData: any = null;
      try {
        const storedResumes = localStorage.getItem('ai_resumes_data');
        if (storedResumes) {
          const resumesData = JSON.parse(storedResumes);
          resumeData = resumesData[bestMatch.resume.id];
          console.log('[Auto-Apply] Resume data found:', !!resumeData);
        }
      } catch (e) {
        console.warn('[Auto-Apply] Could not fetch resume data:', e);
      }

      console.log('[Auto-Apply] Calling dispatch API...');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resumeId: bestMatch.resume.id,
          resumeText: `Title: ${bestMatch.resume.title}\nTarget Role: ${bestMatch.resume.targetRole}`,
          resumeData,
          jobListingId: jobListing.id,
          jobListing: jobListing,
          targetEmail,
          senderEmail: senderEmail.trim(),
          matchScore: bestMatch.matchScore,
          dispatchChannel: 'EMAIL',
          confirm: true,
        }),
      });

      const data = await res.json();
      console.log('[Auto-Apply] Dispatch response:', { status: res.status, data });
      
      if (res.ok) {
        console.log('[Auto-Apply] Success!');
        toast({ 
          title: 'Auto-Apply Successful!', 
          description: `Application sent to ${targetEmail} with ${bestMatch.matchScore}% match score.` 
        });
      } else {
        console.log('[Auto-Apply] Failed:', data);
        toast({ 
          title: 'Auto-Apply Failed', 
          description: data.error || 'Failed to send application automatically.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('[Auto-Apply] Exception:', error);
      toast({ 
        title: 'Auto-Apply Error', 
        description: 'Failed to send automatic application.', 
        variant: 'destructive' 
      });
    }
  };

  const extractCompanyEmail = (text: string): string | null => {
    // List of common company email patterns to prioritize
    const companyEmailPatterns = [
      /careers@[\w.-]+\.[a-z]{2,}/gi,
      /jobs@[\w.-]+\.[a-z]{2,}/gi,
      /hr@[\w.-]+\.[a-z]{2,}/gi,
      /recruiting@[\w.-]+\.[a-z]{2,}/gi,
      /recruitment@[\w.-]+\.[a-z]{2,}/gi,
      /talent@[\w.-]+\.[a-z]{2,}/gi,
      /hiring@[\w.-]+\.[a-z]{2,}/gi,
      /apply@[\w.-]+\.[a-z]{2,}/gi,
      /people@[\w.-]+\.[a-z]{2,}/gi,
    ];

    // First try to find company-specific email patterns
    for (const pattern of companyEmailPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }

    // Fallback: any non-personal email
    const emailRegex = /[a-zA-Z0-9._%+-]+@(?!gmail|yahoo|hotmail|outlook|aol|icloud|protonmail)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const matches = text.match(emailRegex);
    return matches && matches.length > 0 ? matches[0] : null;
  };

  const handleOpenPreview = async (match: any) => {
    setSelectedMatch(match);
    
    // Try to fetch full resume data from localStorage
    let resumeData: any = null;
    try {
      const storedResumes = localStorage.getItem('ai_resumes_data');
      if (storedResumes) {
        const resumesData = JSON.parse(storedResumes);
        resumeData = resumesData[match.resume.id];
      }
    } catch (e) {
      console.warn('Could not fetch resume data:', e);
    }
    
    setSelectedMatch({ ...match, resumeData });
    setPreviewModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">AI Job Matching</h1>
          <p className="text-muted-foreground">
            Paste a job description to see which of your resumes is the best fit, and auto-tailor an application.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Target Job
              </CardTitle>
              <CardDescription>Search live job boards (LinkedIn, Indeed, Glassdoor) or paste URL/text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-Apply Settings */}
              <div className="space-y-3 bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <label className="text-sm font-semibold text-foreground">Auto-Apply Mode</label>
                  </div>
                  <Switch 
                    checked={autoApply}
                    onCheckedChange={setAutoApply}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically tailor and email your resume to companies after matching (70%+ score required)
                </p>
                {autoApply && (
                  <div className="pt-2 border-t border-primary/20">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder="your.email@example.com"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="text-xs pl-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Search Live Job Platforms */}
              <div className="space-y-2 bg-muted/40 p-3 rounded-xl border">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-primary" /> Search Live Platforms (JSearch API)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. React Developer, Software Engineer"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                    className="text-xs bg-background"
                  />
                  <Button 
                    onClick={handleSearchJobs} 
                    disabled={isSearchingJobs || !searchQuery.trim()} 
                    size="sm"
                    className="gap-1 whitespace-nowrap"
                  >
                    {isSearchingJobs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Select a role to match:</p>
                    {searchResults.map((job) => (
                      <div 
                        key={job.job_id} 
                        onClick={() => handleSelectJob(job)}
                        className="p-2.5 bg-background border rounded-lg hover:border-primary cursor-pointer transition-all text-xs flex justify-between items-center group"
                      >
                        <div className="space-y-0.5 max-w-[80%]">
                          <p className="font-bold group-hover:text-primary transition-colors line-clamp-1">{job.job_title}</p>
                          <p className="text-[11px] text-muted-foreground">{job.employer_name} • {job.job_city || 'Remote'}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {job.job_publisher || 'LinkedIn'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Import */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" /> Import via Job URL (LinkedIn, Indeed, etc.)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="text-xs"
                  />
                  <Button 
                    onClick={handleFetchUrl} 
                    disabled={isFetchingUrl || !jobUrl.trim()} 
                    variant="secondary" 
                    size="sm"
                    className="gap-1 whitespace-nowrap"
                  >
                    {isFetchingUrl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                    Fetch
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Job Description Text
                </label>
                <Textarea
                  placeholder="Paste job description text here..."
                  className="min-h-[180px] resize-none text-xs"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleParseJob} 
                disabled={isParsing || !jobDescription.trim()} 
                className="w-full gap-2"
              >
                {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isParsing ? 'Analyzing...' : 'Analyze Job Description'}
              </Button>
            </CardFooter>
          </Card>

          {parsedJob && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-md">Extracted Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm space-y-4">
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Role/Seniority</span>
                  <span>{parsedJob.parsedRequirements.seniority}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Domain</span>
                  <span>{parsedJob.parsedRequirements.domain}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider">Location</span>
                  <span>{parsedJob.parsedRequirements.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground block text-xs uppercase tracking-wider mb-1">Key Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {parsedJob.parsedRequirements.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm min-h-[500px] border-none bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Resume Match Results</CardTitle>
              <CardDescription>Ranked shortlist of your resumes for this role</CardDescription>
            </CardHeader>
            <CardContent>
              {!parsedJob && !isMatching && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-lg">No Job Selected</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-1">
                    Paste a job description on the left to see which of your resumes matches best.
                  </p>
                </div>
              )}

              {isMatching && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium animate-pulse">Computing semantic matches...</p>
                </div>
              )}

              {matches.length > 0 && (
                <div className="space-y-4">
                  {matches.map((match, index) => (
                    <Card key={match.id} className={`overflow-hidden transition-all hover:shadow-md ${index === 0 ? 'border-primary/50 shadow-sm' : ''}`}>
                      {index === 0 && (
                        <div className="bg-primary/10 text-primary text-xs font-bold text-center py-1 uppercase tracking-wider">
                          Best Fit
                        </div>
                      )}
                      <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Score Circle */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-muted relative">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="36" cy="36" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted" />
                            <circle 
                              cx="36" cy="36" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" 
                              className={match.matchScore >= 80 ? "text-emerald-500" : match.matchScore >= 60 ? "text-amber-500" : "text-red-500"}
                              strokeDasharray={`${match.matchScore * 2.26} 226`}
                            />
                          </svg>
                          <span className="text-xl font-bold">{match.matchScore}</span>
                        </div>

                        {/* Resume Info */}
                        <div className="flex-1 space-y-1">
                          <h3 className="font-bold text-lg leading-tight">{match.resume.title}</h3>
                          <p className="text-sm text-muted-foreground">{match.resume.targetRole}</p>
                          
                          <div className="flex gap-4 mt-3 pt-3 border-t">
                            <div className="text-xs">
                              <span className="flex items-center gap-1 text-emerald-600 mb-1 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills
                              </span>
                              <span className="text-muted-foreground">
                                {match.criteriaBreakdown.skillsMatch.length} found
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="flex items-center gap-1 text-red-600 mb-1 font-medium">
                                <XCircle className="h-3.5 w-3.5" /> Missing Skills
                              </span>
                              <span className="text-muted-foreground">
                                {match.criteriaBreakdown.missingSkills.length} missing
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto">
                          <Button 
                            onClick={() => handleOpenPreview(match)}
                            className="w-full md:w-auto"
                          >
                            Preview & Apply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {selectedMatch && (
        <MatchPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          jobListingId={parsedJob?.id}
          resumeId={selectedMatch.resume.id}
          resumeText={`Title: ${selectedMatch.resume.title}\nTarget Role: ${selectedMatch.resume.targetRole}`}
          resumeData={selectedMatch.resumeData}
          matchScore={selectedMatch.matchScore}
          jobDescription={parsedJob?.originalText}
          jobListing={parsedJob}
        />
      )}
    </DashboardLayout>
  );
}

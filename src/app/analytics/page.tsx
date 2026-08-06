'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, BarChart2, CheckCircle2, AlertTriangle, ArrowUpRight, Award, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AnalyticsPage() {
  const completenessSections = [
    { section: 'Personal Information', status: 'Complete', score: 100 },
    { section: 'Professional Summary', status: 'Complete', score: 100 },
    { section: 'Work Experience', status: 'Optimal', score: 95 },
    { section: 'Education', status: 'Complete', score: 100 },
    { section: 'Key Skills & Keywords', status: 'Needs Expansion', score: 75 },
    { section: 'Certifications', status: 'Optional Added', score: 80 },
    { section: 'Languages & Achievements', status: 'Complete', score: 90 },
  ];

  const overallCompleteness = Math.round(
    completenessSections.reduce((acc, curr) => acc + curr.score, 0) / completenessSections.length
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Bar */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <FileText className="h-5 w-5" />
            </div>
            Resume Architect
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/builder" className="text-muted-foreground hover:text-foreground">
              Builder
            </Link>
            <Link href="/ats-checker" className="text-muted-foreground hover:text-foreground">
              ATS Checker
            </Link>
            <Link href="/analytics" className="text-primary font-semibold">
              Analytics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 pt-8 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart2 className="h-8 w-8 text-primary" /> Resume Analytics & ATS Insights
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Detailed breakdown of formatting health, keyword match density, and section completeness.
            </p>
          </div>
          <Link href="/builder">
            <Button size="lg" className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
              <Zap className="h-4 w-4" /> Optimize Resume Now
            </Button>
          </Link>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs font-bold tracking-wider">Overall ATS Health Score</CardDescription>
              <CardTitle className="text-4xl font-bold text-emerald-600">88 / 100</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={88} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">Passed 14 out of 16 ATS parser checks.</p>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs font-bold tracking-wider">Section Completeness</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary">{overallCompleteness}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overallCompleteness} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">All major resume sections populated.</p>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase text-xs font-bold tracking-wider">Keyword Match Rate</CardDescription>
              <CardTitle className="text-4xl font-bold text-indigo-600">82%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={82} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">Strong match for Senior Developer roles.</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Section Completeness Breakdown */}
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Section Completeness Breakdown</CardTitle>
            <CardDescription>Metrics evaluating depth and clarity across each resume section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completenessSections.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`h-5 w-5 ${item.score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <div>
                    <span className="font-semibold text-sm">{item.section}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-48">
                  <Progress value={item.score} className="h-2 flex-1" />
                  <span className="text-xs font-bold w-9 text-right">{item.score}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actionable Suggestions */}
        <Card className="border shadow-lg bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5" /> High-Impact Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Add Quantifiable Metrics to Experience</h4>
                <p className="text-xs text-muted-foreground">
                  Resumes with numerical achievements (e.g., "Increased sales by 30%") rank 40% higher in ATS scanners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Include Target Role Keywords in Skills</h4>
                <p className="text-xs text-muted-foreground">
                  Ensure keywords like "TypeScript", "CI/CD", and "Agile Architecture" appear in both the skills list and experience descriptions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Download, CheckCircle, ArrowRight, Layout, ShieldCheck, BarChart2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-8 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 justify-between">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Resume Architect</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href="/ats-checker">
            ATS Checker
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Sign In
          </Link>
          <Button asChild size="sm" className="rounded-xl font-bold">
            <Link href="/builder">Build Resume</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background via-primary/5 to-secondary/10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-2">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Next-Gen AI Resume & ATS Engine</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl leading-tight">
                Architect Your Career with <span className="text-primary">AI-Powered</span> Precision
              </h1>
              <p className="mx-auto max-w-[750px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Create ATS-optimized resumes in minutes. Features 4 customizable template layouts, real-time match scoring, instant PDF exports, and AI copilot support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button asChild size="lg" className="h-12 px-8 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                  <Link href="/builder">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-bold rounded-xl">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-all">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Cross-Cutting AI Assistant</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate professional summaries, improve bullet points with action verbs & metrics, and extract high-value target role skills.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-all">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Real-Time ATS Checker</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate formatting health and keyword match density against target job descriptions for 90%+ pass rates.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-all">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <Layout className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">4 Distinct Templates</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose between Classic Modern, Executive Two-Column, Minimalist, and Creative Tech layouts with customizable fonts & color palettes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-8 border-t bg-background">
        <p className="text-xs text-muted-foreground">© 2026 AI Resume Architect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/builder">
            Builder
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/ats-checker">
            ATS Checker
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </footer>
    </div>
  );
}

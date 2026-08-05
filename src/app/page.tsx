import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Download, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Resume Architect</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/builder">
            Start Building
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-secondary/10">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Powered by Gemini 1.5 Flash</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl font-headline leading-tight">
                Architect Your Future with <span className="text-primary">AI-Powered</span> Resumes
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Build professional, ATS-friendly resumes in minutes. Our AI optimizes your content using strong action verbs and industry-standard formatting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
                  <Link href="/builder">Build My Resume</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-primary text-primary hover:bg-primary/5">
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-shadow">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-headline">AI-Optimized Content</h3>
                <p className="text-muted-foreground">
                  Our advanced AI transforms your basic input into impactful professional statements and bullet points.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-shadow">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <CheckCircle className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-headline">ATS-Friendly Layouts</h3>
                <p className="text-muted-foreground">
                  Resumes designed to pass through Applicant Tracking Systems, ensuring you get noticed by recruiters.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-shadow">
                <div className="p-3 bg-secondary/80 rounded-xl">
                  <Download className="h-10 w-10 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Instant PDF Export</h3>
                <p className="text-muted-foreground">
                  Generate and download your resume as a clean, high-quality PDF ready for any job application.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6 mx-auto">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Three simple steps to your dream job resume.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative p-6 bg-card rounded-2xl border">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                <h4 className="text-xl font-bold mb-2 pt-4">Enter Your Details</h4>
                <p className="text-muted-foreground">Fill in our structured forms with your experience, education, and skills.</p>
              </div>
              <div className="relative p-6 bg-card rounded-2xl border">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                <h4 className="text-xl font-bold mb-2 pt-4">AI Optimization</h4>
                <p className="text-muted-foreground">The AI rewrites your bullet points using powerful action verbs and keywords.</p>
              </div>
              <div className="relative p-6 bg-card rounded-2xl border">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-secondary-foreground text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                <h4 className="text-xl font-bold mb-2 pt-4">Download & Apply</h4>
                <p className="text-muted-foreground">Review your clean resume and download it as a professional PDF instantly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-xs text-muted-foreground">© 2024 AI Resume Architect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, ArrowRight, X, Bot, Zap, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateSummaryAction, enhanceBulletAction, recommendSkillsAction } from '@/ai/flows/assistant-flows';

interface AIAssistantPanelProps {
  onApplySummary?: (summary: string) => void;
  onApplyBullet?: (bullet: string) => void;
  onApplySkills?: (skills: string[]) => void;
  targetJobDesc?: string;
}

export default function AIAssistantPanel({
  onApplySummary,
  onApplyBullet,
  onApplySkills,
  targetJobDesc = '',
}: AIAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'bullet' | 'skills'>('summary');
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | string[] | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsProcessing(true);
    try {
      const summary = await generateSummaryAction({ targetJobDesc });
      setGeneratedOutput(summary);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to generate summary', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnhanceBullet = async () => {
    if (!promptText.trim()) return;
    setIsProcessing(true);
    try {
      const enhancedBullet = await enhanceBulletAction({ bulletText: promptText.trim() });
      setGeneratedOutput(enhancedBullet);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to enhance bullet', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecommendSkills = async () => {
    setIsProcessing(true);
    try {
      const recommended = await recommendSkillsAction({ targetJobDesc });
      setGeneratedOutput(recommended);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to recommend skills', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl bg-primary text-white hover:bg-primary/90 px-4 h-12 gap-2 font-bold animate-bounce"
        >
          <Sparkles className="h-5 w-5" /> AI Assistant
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Bot className="h-6 w-6 text-primary" /> AI Copilot
          </SheetTitle>
          <SheetDescription>
            Instant AI rewrites, skill extraction, and bullet point enhancements for your resume.
          </SheetDescription>
        </SheetHeader>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl my-4">
          <button
            onClick={() => {
              setActiveTab('summary');
              setGeneratedOutput(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'summary' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Summary Writer
          </button>
          <button
            onClick={() => {
              setActiveTab('bullet');
              setGeneratedOutput(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'bullet' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Bullet Improver
          </button>
          <button
            onClick={() => {
              setActiveTab('skills');
              setGeneratedOutput(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'skills' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            Skill Recommender
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Generate Professional Summary</Label>
              <p className="text-xs text-muted-foreground">
                Our AI will craft an impact-driven professional summary tailored for executive & technical roles.
              </p>
              <Button onClick={handleGenerateSummary} disabled={isProcessing} className="w-full gap-2">
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate Summary
              </Button>
            </div>
          )}

          {activeTab === 'bullet' && (
            <div className="space-y-4">
              <Label htmlFor="bulletPrompt" className="text-sm font-semibold">
                Paste Bullet Point to Improve
              </Label>
              <Textarea
                id="bulletPrompt"
                placeholder="e.g. Worked on building user dashboards and fixing bugs."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleEnhanceBullet} disabled={isProcessing || !promptText} className="w-full gap-2">
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Enhance with Action Verbs & Metrics
              </Button>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Extract Recommended Skills</Label>
              <p className="text-xs text-muted-foreground">
                Get high-impact skills matching your target job role.
              </p>
              <Button onClick={handleRecommendSkills} disabled={isProcessing} className="w-full gap-2">
                {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Recommend Top Skills
              </Button>
            </div>
          )}

          {/* Generated Result Output Box */}
          {generatedOutput && (
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> AI Generated Result
                </span>
              </div>

              {typeof generatedOutput === 'string' ? (
                <p className="text-xs leading-relaxed text-foreground bg-background p-3 rounded-lg border">
                  {generatedOutput}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 bg-background p-3 rounded-lg border">
                  {generatedOutput.map((sk, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {sk}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={() => {
                  if (activeTab === 'summary' && onApplySummary && typeof generatedOutput === 'string') {
                    onApplySummary(generatedOutput);
                  } else if (activeTab === 'bullet' && onApplyBullet && typeof generatedOutput === 'string') {
                    onApplyBullet(generatedOutput);
                  } else if (activeTab === 'skills' && onApplySkills && Array.isArray(generatedOutput)) {
                    onApplySkills(generatedOutput);
                  }
                  toast({ title: 'Applied to Resume', description: 'Updated your resume draft.' });
                  setIsOpen(false);
                }}
                className="w-full gap-2 text-xs font-bold"
              >
                Apply to Resume <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

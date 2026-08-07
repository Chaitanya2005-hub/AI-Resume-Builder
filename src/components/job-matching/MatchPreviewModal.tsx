import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, Send, XCircle, Mail, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface MatchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobListingId: string;
  resumeId: string;
  resumeText: string;
  resumeData?: any;
  matchScore: number;
  jobDescription?: string;
  jobListing?: any;
}

export function MatchPreviewModal({
  isOpen,
  onClose,
  jobListingId,
  resumeId,
  resumeText,
  resumeData,
  matchScore,
  jobDescription,
  jobListing,
}: MatchPreviewModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const extractCompanyEmail = (text: string): string => {
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

    for (const pattern of companyEmailPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@(?!gmail|yahoo|hotmail|outlook|aol|icloud|protonmail)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const matches = text.match(emailRegex);
    return matches && matches.length > 0 ? matches[0] : 'careers@company.com';
  };

  const [targetEmail, setTargetEmail] = useState('careers@company.com');
  const [senderEmail, setSenderEmail] = useState(user?.email || 'myaccount@example.com');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string; coverNote?: string } | null>(null);

  // Auto-extract company email when modal opens or job description changes
  React.useEffect(() => {
    if (isOpen && jobDescription) {
      const extractedEmail = extractCompanyEmail(jobDescription);
      setTargetEmail(extractedEmail);
    }
  }, [isOpen, jobDescription]);

  const handleDispatch = async () => {
    if (!user) return;
    
    setIsDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resumeId,
          resumeText,
          resumeData,
          jobListingId,
          jobListing,
          targetEmail: targetEmail.trim(),
          senderEmail: senderEmail.trim(),
          matchScore,
          dispatchChannel: 'EMAIL',
          confirm: true,
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setDispatchResult({ 
          success: true, 
          message: data.message || `Application dispatched from ${senderEmail} to ${targetEmail}!`, 
          coverNote: data.tailoredContent?.coverNote 
        });
        toast({ title: 'Success', description: data.message || 'Application has been sent.' });
      } else {
        setDispatchResult({ success: false, message: data.error || 'Dispatch failed' });
        toast({ title: 'Error', description: data.error || 'Failed to dispatch', variant: 'destructive' });
      }
    } catch (error) {
      setDispatchResult({ success: false, message: 'An unexpected error occurred' });
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setIsDispatching(false);
    }
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`Application for Role - ${user?.name || 'Applicant'}`);
    const body = encodeURIComponent(
      dispatchResult?.coverNote || 
      `Dear Hiring Manager,\n\nI am submitting my tailored application for this role.\n\nBest regards,\n${user?.name || 'Applicant'}`
    );
    return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review & Dispatch Application</DialogTitle>
          <DialogDescription>
            Authorize AI to tailor your cover note and email your application directly to the target company.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!dispatchResult && !isDispatching && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company Contact Email
                  </label>
                  <Input
                    placeholder="careers@company.com"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sender Account Email
                  </label>
                  <Input
                    placeholder="your.email@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg text-xs space-y-2">
                <h4 className="font-semibold text-foreground">Application Process:</h4>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Customized cover note generated based on role requirements.</li>
                  <li>Application emailed from your account (<span className="font-medium text-foreground">{senderEmail}</span>) to <span className="font-medium text-foreground">{targetEmail}</span>.</li>
                  <li>Persisted to your application tracker with audit trail.</li>
                </ul>
              </div>
            </div>
          )}

          {isDispatching && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium text-muted-foreground">Tailoring Resume & Emailing Application...</p>
            </div>
          )}

          {dispatchResult && dispatchResult.success && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-600 bg-emerald-500/10 p-4 rounded-lg">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <p className="font-bold">{dispatchResult.message}</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">Sent to {targetEmail}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Generated Cover Note</h4>
                  <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                    <a href={getMailtoUrl()} target="_blank" rel="noopener noreferrer">
                      <Mail className="h-3.5 w-3.5" /> Open in Mail App (Outlook/Gmail)
                    </a>
                  </Button>
                </div>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{dispatchResult.coverNote}</p>
              </div>
            </div>
          )}

          {dispatchResult && !dispatchResult.success && (
            <div className="flex items-center gap-3 text-red-600 bg-red-500/10 p-4 rounded-lg">
              <XCircle className="h-6 w-6" />
              <p className="font-medium">{dispatchResult.message}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {!dispatchResult ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isDispatching}>Cancel</Button>
              <Button onClick={handleDispatch} disabled={isDispatching || !targetEmail.trim()} className="gap-2">
                {isDispatching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isDispatching ? 'Sending...' : 'Email Tailored Resume'}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

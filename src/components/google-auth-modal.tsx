'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  const handleConfirmGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) {
      toast({
        variant: 'destructive',
        title: 'Google Sign In',
        description: 'Please enter your Google email address.',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const derivedName = googleName || googleEmail.split('@')[0].replace('.', ' ');
      updateProfile({
        name: derivedName,
        email: googleEmail,
        jobTitle: 'Google Account User',
      });

      toast({
        title: 'Signed in with Google',
        description: `Authenticated as ${googleEmail}`,
      });
      setLoading(false);
      onClose();
      onSuccess();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary mb-1">
            G
          </div>
          <DialogTitle className="text-xl font-bold">Sign in with Google</DialogTitle>
          <DialogDescription>
            Choose or enter your Google account details to proceed to Resume Architect.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmGoogleLogin} className="space-y-4 py-2">
          {/* Preset Google accounts for 1-click select */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select an account
            </Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setGoogleEmail('chaitanya.sri@gmail.com');
                  setGoogleName('Chaitanya Sri');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  C
                </div>
                <div className="flex-1 truncate">
                  <div className="font-semibold text-sm">Chaitanya Sri</div>
                  <div className="text-xs text-muted-foreground">chaitanya.sri@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGoogleEmail('alex.developer@gmail.com');
                  setGoogleName('Alex Developer');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  A
                </div>
                <div className="flex-1 truncate">
                  <div className="font-semibold text-sm">Alex Developer</div>
                  <div className="text-xs text-muted-foreground">alex.developer@gmail.com</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or enter another Google account</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="googleEmail" className="text-xs">Google Email</Label>
              <Input
                id="googleEmail"
                type="email"
                placeholder="your.email@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="googleName" className="text-xs">Display Name (Optional)</Label>
              <Input
                id="googleName"
                placeholder="Full Name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2 font-bold">
              {loading ? 'Authenticating...' : 'Continue to Dashboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

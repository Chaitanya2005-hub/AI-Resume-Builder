'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, User, Mail, Settings, Bell, Moon, Sun, Shield, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [atsAlerts, setAtsAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, jobTitle });
    toast({
      title: 'Profile Updated',
      description: 'Your settings have been saved successfully.',
    });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all locally saved resumes?')) {
      localStorage.removeItem('ai_resumes_list');
      toast({
        title: 'Data Cleared',
        description: 'All local resume drafts have been reset.',
      });
    }
  };

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
            <Link href="/settings" className="text-primary font-semibold">
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 pt-8 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" /> Settings & Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences.</p>
        </div>

        {/* Profile Settings Card */}
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Details
            </CardTitle>
            <CardDescription>Update your personal info used across resume defaults.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Default Job Title</Label>
                  <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <Button type="submit" className="gap-2 font-bold">
                <Save className="h-4 w-4" /> Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Preferences & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <h4 className="font-semibold text-sm">Email Notifications</h4>
                <p className="text-xs text-muted-foreground">Receive periodic resume optimization tips.</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-semibold text-sm">ATS Match Alerts</h4>
                <p className="text-xs text-muted-foreground">Get notified when a resume falls below 75% ATS match.</p>
              </div>
              <Switch checked={atsAlerts} onCheckedChange={setAtsAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border border-red-500/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Data Reset & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Clear locally stored resume drafts and reset to defaults.</p>
            <Button variant="destructive" onClick={handleClearData} className="gap-2">
              <Trash2 className="h-4 w-4" /> Reset Local Resumes
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

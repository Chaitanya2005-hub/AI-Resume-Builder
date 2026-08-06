'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Sparkles,
  Copy,
  Trash2,
  Edit,
  Download,
  BarChart2,
  Search,
  MoreVertical,
  Clock,
  CheckCircle,
  ExternalLink,
  Layers,
  FolderOpen,
  Briefcase,
  Send,
  Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard-layout';

export interface DashboardResumeItem {
  id: string;
  title: string;
  targetRole: string;
  lastModified: string;
  atsScore: number;
  templateId: 'classic' | 'executive' | 'minimalist' | 'tech';
}

const INITIAL_RESUMES: DashboardResumeItem[] = [
  {
    id: 'res_1',
    title: 'Senior Software Engineer Resume',
    targetRole: 'Full Stack Tech Lead',
    lastModified: '2 hours ago',
    atsScore: 88,
    templateId: 'executive',
  },
  {
    id: 'res_2',
    title: 'Frontend Developer - Remote',
    targetRole: 'Senior React Developer',
    lastModified: 'Yesterday',
    atsScore: 76,
    templateId: 'classic',
  },
  {
    id: 'res_3',
    title: 'Product Manager Resume',
    targetRole: 'Lead Product Strategist',
    lastModified: '3 days ago',
    atsScore: 92,
    templateId: 'tech',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [resumes, setResumes] = useState<DashboardResumeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ai_resumes_list');
    if (stored) {
      try {
        setResumes(JSON.parse(stored));
      } catch (e) {
        setResumes(INITIAL_RESUMES);
      }
    } else {
      setResumes(INITIAL_RESUMES);
      localStorage.setItem('ai_resumes_list', JSON.stringify(INITIAL_RESUMES));
    }
  }, []);

  const saveResumes = (items: DashboardResumeItem[]) => {
    setResumes(items);
    localStorage.setItem('ai_resumes_list', JSON.stringify(items));
  };

  const handleDuplicate = (id: string) => {
    const item = resumes.find((r) => r.id === id);
    if (!item) return;
    const duplicated: DashboardResumeItem = {
      ...item,
      id: 'res_' + Date.now(),
      title: `${item.title} (Copy)`,
      lastModified: 'Just now',
    };
    const updated = [duplicated, ...resumes];
    saveResumes(updated);
    toast({
      title: 'Resume Duplicated',
      description: `Created copy of "${item.title}".`,
    });
  };

  const handleDelete = (id: string) => {
    const updated = resumes.filter((r) => r.id !== id);
    saveResumes(updated);
    toast({
      title: 'Resume Deleted',
      description: 'The selected resume was removed from your dashboard.',
    });
  };

  const handleRename = () => {
    if (!renameId || !newTitle.trim()) return;
    const updated = resumes.map((r) => (r.id === renameId ? { ...r, title: newTitle.trim(), lastModified: 'Just now' } : r));
    saveResumes(updated);
    setRenameId(null);
    setNewTitle('');
    toast({
      title: 'Resume Renamed',
      description: 'Updated title successfully.',
    });
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 lg:px-8 pt-8 max-w-7xl">
        {/* Welcome Section & Quick Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name || 'Architect'}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your resumes, optimize ATS scores, and launch your job search.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => router.push('/dashboard/job-matching')} variant="outline" size="lg" className="rounded-xl gap-2 font-bold border-primary/30">
              <Briefcase className="h-5 w-5 text-primary" /> Job Match & Apply
            </Button>
            <Button onClick={() => router.push('/builder')} size="lg" className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Create New Resume
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Resumes</p>
                <h3 className="text-3xl font-bold mt-1">{resumes.length}</h3>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FolderOpen className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average ATS Score</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                  {resumes.length ? Math.round(resumes.reduce((acc, r) => acc + r.atsScore, 0) / resumes.length) : 0}%
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Roles</p>
                <h3 className="text-3xl font-bold mt-1">
                  {new Set(resumes.map((r) => r.targetRole)).size}
                </h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                <Layers className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or target role..."
              className="pl-9 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Resume Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((item) => (
            <Card key={item.id} className="group border shadow-md hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold">
                      {item.templateId} Layout
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                          <Settings className="mr-2 h-4 w-4" /> Settings & Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/analytics')}>
                          <BarChart2 className="mr-2 h-4 w-4" /> ATS Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/builder?id=${item.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/job-matching')}>
                          <Briefcase className="mr-2 h-4 w-4" /> Match with Job
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setRenameId(item.id);
                            setNewTitle(item.title);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Rename Title
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(item.id)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 mt-2">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">{item.targetRole}</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Updated {item.lastModified}
                    </span>
                    <span className={`font-bold ${item.atsScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ATS Score: {item.atsScore}%
                    </span>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="border-t bg-muted/10 pt-3 pb-3 flex gap-2">
                <Button onClick={() => router.push(`/builder?id=${item.id}`)} variant="default" className="flex-1 rounded-lg gap-2">
                  <Edit className="h-4 w-4" /> Edit Resume
                </Button>
                <Button onClick={() => router.push('/dashboard/job-matching')} variant="outline" size="icon" className="rounded-lg" title="Job Match & Apply">
                  <Briefcase className="h-4 w-4 text-primary" />
                </Button>
                <Button onClick={() => router.push('/ats-checker')} variant="outline" size="icon" className="rounded-lg" title="ATS Checker">
                  <Sparkles className="h-4 w-4 text-primary" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Enter a new title for this resume draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Resume Title" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save Title</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

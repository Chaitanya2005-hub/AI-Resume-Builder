'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Globe, Clock, CheckCircle2, XCircle, ExternalLink, Send } from 'lucide-react';
import { JobApplication } from '@/types/job';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function ApplicationsTrackerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/applications?userId=${user?.id}`);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Sent</Badge>;
      case 'viewed':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Viewed</Badge>;
      case 'responded':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Responded</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-500">Failed</Badge>;
      case 'queued':
      default:
        return <Badge variant="secondary">Queued</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Application Tracker</h1>
            <p className="text-muted-foreground">
              Track the status of all your AI-dispatched applications.
            </p>
          </div>
        </div>

      <Card className="shadow-sm border-none bg-muted/30 min-h-[400px]">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>History of dispatches and current status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No applications found. Go to the Job Matching page to apply for a role.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{app.companyId === 'unknown_company' ? 'Unknown Company' : app.companyId}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> 
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {app.dispatchChannel === 'EMAIL' ? <Mail className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                          Via {app.dispatchChannel}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          Match Score: {app.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 border sm:border-none p-3 sm:p-0 rounded-lg sm:bg-transparent bg-muted/50">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Resume Used</p>
                      <p className="text-sm font-medium">{app.resumeId}</p>
                    </div>

                  </div>
                  
                  {app.errorMessage && (
                    <div className="bg-red-500/10 text-red-600 px-5 py-3 text-sm flex items-start gap-2 border-t border-red-500/20">
                      <XCircle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="font-bold">Dispatch Error:</span> {app.errorMessage}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}

export interface JobRequirement {
  skills: string[];
  seniority: string;
  domain: string;
  location: string;
  keywords: string[];
}

export interface JobListing {
  id?: string;
  userId: string;
  originalText: string;
  parsedRequirements: JobRequirement;
  source: string;
  createdAt: string;
}

export interface JobMatch {
  id?: string;
  userId: string;
  resumeId: string;
  jobListingId: string;
  matchScore: number;
  criteriaBreakdown: {
    skillsMatch: string[];
    missingSkills: string[];
    seniorityMatch: boolean;
    domainMatch: boolean;
  };
  createdAt: string;
}

export interface Company {
  id?: string;
  name: string;
  contactType: 'API' | 'EMAIL';
  contactEndpoint: string;
}

export interface JobApplication {
  id?: string;
  userId: string;
  resumeId: string;
  jobListingId: string;
  companyId: string;
  targetEmail?: string;
  senderEmail?: string;
  matchScore: number;
  dispatchChannel: 'API' | 'EMAIL';
  tailoredContentSnapshot: {
    resumeHtml?: string;
    coverNote: string;
  };
  status: 'queued' | 'sent' | 'delivered' | 'viewed' | 'responded' | 'rejected' | 'failed';
  submittedAt: string;
  lastStatusUpdateAt: string;
  errorMessage?: string;
}

export interface ApplicationStatusLog {
  id?: string;
  applicationId: string;
  status: string;
  timestamp: string;
}

export interface DispatchInstruction {
  id?: string;
  userId: string;
  applicationId: string;
  timestamp: string;
}

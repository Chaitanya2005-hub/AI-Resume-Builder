import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  JobListing,
  JobMatch,
  JobApplication,
  ApplicationStatusLog,
  DispatchInstruction,
  Company,
} from '@/types/job';

// In-memory fallback store to ensure instant responses even when using demo Firebase keys
const memoryStore: Record<string, any[]> = {
  job_listings: [],
  job_matches: [],
  companies: [],
  job_applications: [],
  application_status_logs: [],
  dispatch_instructions: [],
};

async function withTimeout<T>(promise: Promise<T>, fallback: () => T, timeoutMs: number = 800): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn('Firestore call timed out, using fallback store');
      resolve(fallback());
    }, timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer!);
      return res;
    }),
    timeoutPromise,
  ]).catch((err) => {
    console.warn('Firestore call error, using fallback store:', err.message);
    return fallback();
  });
}

// Job Listings
export const saveJobListing = async (listing: JobListing): Promise<string> => {
  const newListing = { ...listing, id: 'listing_' + Date.now() + Math.random().toString(36).substring(2, 7) };
  return withTimeout(
    addDoc(collection(db, 'job_listings'), listing).then((ref) => ref.id),
    () => {
      memoryStore.job_listings.push(newListing);
      return newListing.id!;
    }
  );
};

export const getJobListings = async (userId: string): Promise<JobListing[]> => {
  return withTimeout(
    getDocs(query(collection(db, 'job_listings'), where('userId', '==', userId))).then((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobListing))
    ),
    () => memoryStore.job_listings.filter((item) => item.userId === userId)
  );
};

export const getJobListing = async (id: string): Promise<JobListing | null> => {
  return withTimeout(
    getDoc(doc(db, 'job_listings', id)).then((snapshot) =>
      snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as JobListing) : null
    ),
    () => memoryStore.job_listings.find((item) => item.id === id) || null
  );
};

// Job Matches
export const saveJobMatch = async (match: JobMatch): Promise<string> => {
  const newMatch = { ...match, id: 'match_' + Date.now() };
  return withTimeout(
    addDoc(collection(db, 'job_matches'), match).then((ref) => ref.id),
    () => {
      memoryStore.job_matches.push(newMatch);
      return newMatch.id!;
    }
  );
};

export const getJobMatches = async (userId: string, resumeId?: string): Promise<JobMatch[]> => {
  return withTimeout(
    getDocs(
      resumeId
        ? query(collection(db, 'job_matches'), where('userId', '==', userId), where('resumeId', '==', resumeId))
        : query(collection(db, 'job_matches'), where('userId', '==', userId))
    ).then((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobMatch))),
    () =>
      memoryStore.job_matches.filter(
        (item) => item.userId === userId && (!resumeId || item.resumeId === resumeId)
      )
  );
};

// Companies
export const getCompany = async (id: string): Promise<Company | null> => {
  return withTimeout(
    getDoc(doc(db, 'companies', id)).then((snapshot) =>
      snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Company) : null
    ),
    () => memoryStore.companies.find((item) => item.id === id) || null
  );
};

export const saveCompany = async (company: Company): Promise<string> => {
  const newCompany = { ...company, id: 'comp_' + Date.now() };
  return withTimeout(
    addDoc(collection(db, 'companies'), company).then((ref) => ref.id),
    () => {
      memoryStore.companies.push(newCompany);
      return newCompany.id!;
    }
  );
};

// Applications
export const saveJobApplication = async (application: JobApplication): Promise<string> => {
  const newApp = { ...application, id: 'app_' + Date.now() };
  return withTimeout(
    addDoc(collection(db, 'job_applications'), application).then((ref) => ref.id),
    () => {
      memoryStore.job_applications.push(newApp);
      return newApp.id!;
    }
  );
};

export const updateJobApplicationStatus = async (
  id: string,
  status: JobApplication['status'],
  errorMessage?: string
): Promise<void> => {
  return withTimeout(
    updateDoc(doc(db, 'job_applications', id), {
      status,
      lastStatusUpdateAt: new Date().toISOString(),
      ...(errorMessage ? { errorMessage } : {}),
    }),
    () => {
      const existing = memoryStore.job_applications.find((item) => item.id === id);
      if (existing) {
        existing.status = status;
        existing.lastStatusUpdateAt = new Date().toISOString();
        if (errorMessage) existing.errorMessage = errorMessage;
      }
    }
  );
};

export const getJobApplications = async (userId: string): Promise<JobApplication[]> => {
  return withTimeout(
    getDocs(query(collection(db, 'job_applications'), where('userId', '==', userId))).then((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JobApplication))
    ),
    () => memoryStore.job_applications.filter((item) => item.userId === userId)
  );
};

// Status Logs
export const addApplicationStatusLog = async (log: ApplicationStatusLog): Promise<string> => {
  const newLog = { ...log, id: 'log_' + Date.now() };
  return withTimeout(
    addDoc(collection(db, 'application_status_logs'), log).then((ref) => ref.id),
    () => {
      memoryStore.application_status_logs.push(newLog);
      return newLog.id!;
    }
  );
};

export const getApplicationStatusLogs = async (applicationId: string): Promise<ApplicationStatusLog[]> => {
  return withTimeout(
    getDocs(query(collection(db, 'application_status_logs'), where('applicationId', '==', applicationId))).then((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ApplicationStatusLog))
    ),
    () => memoryStore.application_status_logs.filter((item) => item.applicationId === applicationId)
  );
};

// Dispatch Instructions
export const saveDispatchInstruction = async (instruction: DispatchInstruction): Promise<string> => {
  const newInst = { ...instruction, id: 'inst_' + Date.now() };
  return withTimeout(
    addDoc(collection(db, 'dispatch_instructions'), instruction).then((ref) => ref.id),
    () => {
      memoryStore.dispatch_instructions.push(newInst);
      return newInst.id!;
    }
  );
};

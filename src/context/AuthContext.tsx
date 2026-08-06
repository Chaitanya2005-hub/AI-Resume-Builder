'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserProfile>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stored user session if exists
    const storedUser = localStorage.getItem('ai_resume_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ai_resume_user');
      }
    } else {
      const defaultUser: UserProfile = {
        id: 'user_demo_123',
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        jobTitle: 'Senior Software Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      };
      setUser(defaultUser);
      localStorage.setItem('ai_resume_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    const loggedUser: UserProfile = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0].replace('.', ' '),
      email,
      jobTitle: 'Software Architect',
    };
    setUser(loggedUser);
    localStorage.setItem('ai_resume_user', JSON.stringify(loggedUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser: UserProfile = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
        email: result.user.email || 'google.user@example.com',
        avatarUrl: result.user.photoURL || undefined,
        jobTitle: 'Google Authenticated Specialist',
      };
      setUser(googleUser);
      localStorage.setItem('ai_resume_user', JSON.stringify(googleUser));
      setIsLoading(false);
      return googleUser;
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      name,
      email,
      jobTitle: 'Professional Specialist',
    };
    setUser(newUser);
    localStorage.setItem('ai_resume_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore firebase signout error if offline
    }
    setUser(null);
    localStorage.removeItem('ai_resume_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('ai_resume_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

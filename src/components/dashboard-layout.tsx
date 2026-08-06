'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { FileText, Briefcase, BarChart2, Settings, LogOut, User, Sparkles, LayoutDashboard, FileCheck, Send } from 'lucide-react';
import { usePathname } from 'next/navigation';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Resume Builder',
    url: '/builder',
    icon: FileText,
  },
  {
    title: 'ATS Checker',
    url: '/ats-checker',
    icon: FileCheck,
  },
  {
    title: 'Job Matching',
    url: '/dashboard/job-matching',
    icon: Briefcase,
  },
  {
    title: 'Application Tracker',
    url: '/dashboard/applications',
    icon: Send,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart2,
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <FileText className="h-4 w-4" />
              </div>
              Resume Architect
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-h-screen">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50 h-16 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold hidden md:block">
                {items.find(item => pathname === item.url)?.title || 'Resume Architect'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium">{user?.name || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <Settings className="mr-2 h-4 w-4" /> Settings & Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/analytics'}>
                    <BarChart2 className="mr-2 h-4 w-4" /> ATS Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    await logout();
                    window.location.href = '/login';
                  }}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t py-4 bg-muted/30 text-center text-sm text-muted-foreground">
            <p>© 2024 Resume Architect. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

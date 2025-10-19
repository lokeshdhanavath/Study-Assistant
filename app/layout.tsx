'use client';
import { useEffect, useState } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import SessionProvider from './sessionProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Your existing theme initialization
    try {
      const t = localStorage.getItem('sf-theme') || 'ink-sky';
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'ink-sky');
    }

    // Your existing user initialization
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        const newUserData = {
          progress: {
            dailyProgress: 0,
            weeklyProgress: 0,
            overallProgress: 0,
            currentStreak: 0,
            longestStreak: 0
          },
          preferences: {
            theme: 'system',
            notifications: true,
            language: 'en'
          },
          activity: {
            completedTasks: [],
            currentLevel: 1,
            points: 0,
            lastActive: new Date().toISOString()
          },
          onboarding: {
            completed: false,
            currentStep: 0
          }
        };
        localStorage.setItem('userData', JSON.stringify(newUserData));
      }
    } catch (e) {
      console.log('User initialization failed:', e);
    }
  }, []);

  if (!isClient) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
            <Sidebar />
            <div className="min-h-screen flex flex-col">
              <Topbar />
              <div className="container mx-auto px-6 py-6 flex-1">
                {children}
              </div>
              <footer className="mt-auto border-t border-border/60">
                <div className="container mx-auto px-6 py-4 text-xs opacity-70">
                  © 2025 <span className="font-semibold">StudyMate</span>. Designed and Programmed by Team Zenith.
                </div>
              </footer>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
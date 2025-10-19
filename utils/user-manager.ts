import { UserData } from '@/types/user-type';

export function initializeNewUser(): UserData {
  const userData: UserData = {
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
  
  localStorage.setItem('userData', JSON.stringify(userData));
  return userData;
}
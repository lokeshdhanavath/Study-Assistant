export interface UserData {
  progress: ProgressData;
  preferences: PreferenceData;
  activity: ActivityData;
  onboarding: OnboardingData;
}

export interface ProgressData {
  dailyProgress: number;
  weeklyProgress: number;
  overallProgress: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PreferenceData {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

export interface ActivityData {
  completedTasks: string[];
  currentLevel: number;
  points: number;
  lastActive: string;
}

export interface OnboardingData {
  completed: boolean;
  currentStep: number;
}
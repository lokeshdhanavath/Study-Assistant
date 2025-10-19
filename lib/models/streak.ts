export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  totalStudyDays: number;
  weeklyGoal: number;
  streakHistory: {
    date: Date;
    streakCount: number;
    activity: 'incremented' | 'reset' | 'maintained';
  }[];
  achievements: string[];
}

export interface StudySession {
  userId: string;
  date: Date;
  duration: number;
  tasksCompleted: string[];
  resourcesUsed: string[];
  sessionType: 'plan' | 'resources' | 'quiz' | 'summary';
}
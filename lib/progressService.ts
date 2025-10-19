import { StreakManager } from './streakManager';
import { checkAchievements } from './achievements';

// Mock database functions - replace with your actual database calls
async function getUserStreak(userId: string): Promise<any> {
  // Replace with your database call
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date(0),
    totalStudyDays: 0,
    weeklyGoal: 5,
    streakHistory: [],
    achievements: []
  };
}

async function updateUserStreak(userId: string, data: any): Promise<void> {
  // Replace with your database call
  console.log('Updating streak for user:', userId, data);
}

export async function trackDailyProgress(userId: string, activity: any) {
  const userStreak = await getUserStreak(userId);
  const newStreak = StreakManager.calculateStreak(
    userStreak.currentStreak, 
    userStreak.lastActiveDate
  );
  
  const newAchievements = checkAchievements(
    newStreak, 
    userStreak.totalStudyDays + 1, 
    userStreak.achievements
  );
  
  await updateUserStreak(userId, {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, userStreak.longestStreak),
    lastActiveDate: new Date(),
    totalStudyDays: userStreak.totalStudyDays + 1,
    achievements: [...userStreak.achievements, ...newAchievements],
    streakHistory: [
      ...userStreak.streakHistory,
      {
        date: new Date(),
        streakCount: newStreak,
        activity: newStreak > userStreak.currentStreak ? 'incremented' : 
                 newStreak === 1 ? 'reset' : 'maintained'
      }
    ]
  });
  
  return {
    streak: newStreak,
    message: StreakManager.getStreakMessage(newStreak),
    achievements: newAchievements,
    totalStudyDays: userStreak.totalStudyDays + 1
  };
}

export async function completeStudySession(userId: string, sessionData: any) {
  // Your existing session completion logic here
  // await saveStudySession(userId, sessionData);
  
  // Update streak
  const progress = await trackDailyProgress(userId, sessionData);
  
  return { session: sessionData, progress };
}
export class StreakManager {
  static calculateStreak(currentStreak: number, lastActive: Date): number {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastActiveDate = new Date(lastActive);
    
    // Reset if gap more than 1 day
    if (lastActiveDate.toDateString() === yesterday.toDateString()) {
      return currentStreak + 1;
    } else if (lastActiveDate.toDateString() === today.toDateString()) {
      return currentStreak; // Already updated today
    } else {
      return 1; // Reset to 1
    }
  }
  
  static getStreakMessage(streak: number): string {
    if (streak >= 30) return `🔥 ${streak} days! You're unstoppable!`;
    if (streak >= 14) return `🌟 ${streak} days! Amazing consistency!`;
    if (streak >= 7) return `💪 ${streak} days! Great discipline!`;
    if (streak >= 3) return `🚀 ${streak} days! Keep going!`;
    return `🎯 Day ${streak}! Start your journey!`;
  }
}
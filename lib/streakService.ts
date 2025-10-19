'use client';

class StreakService {
  private static instance: StreakService;
  
  private constructor() {}
  
  public static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }
  
  // Fix: Add index signature
  private ACTIVITY_WEIGHTS: { [key: string]: number } = {
    timer: 2,
    quiz: 1.5,
    notes: 1,
    resources: 0.5,
    plan: 0.3,
  };
  
  private DAILY_GOAL = 15;

  public recordActivity(activity: string, duration?: number): void {
    // Fix: Type-safe access
    const weight = this.ACTIVITY_WEIGHTS[activity] || 0.5;
    let points = weight;
    
    if (activity === 'timer' && duration) {
      points = Math.min(weight * (duration / 25), 5);
    }
    
    this.addDailyPoints(points);
  }

  // Add missing method for Timer.tsx
  public completeStudyActivity(activity: string, duration?: number): void {
    this.recordActivity(activity, duration);
  }

  // ... rest of your existing code remains the same
  private addDailyPoints(points: number): void {
    const today = new Date().toDateString();
    const currentPoints = parseFloat(localStorage.getItem(`points_${today}`) || '0');
    const newPoints = currentPoints + points;
    
    localStorage.setItem(`points_${today}`, newPoints.toString());
    
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    const currentStreak = parseInt(localStorage.getItem('studyStreak') || '0');
    
    if (newPoints >= this.DAILY_GOAL && currentPoints < this.DAILY_GOAL) {
      let newStreak = 1;
      
      if (lastStudyDate === today) {
        return;
      } else if (this.isConsecutiveDay(lastStudyDate)) {
        newStreak = currentStreak + 1;
      }
      
      localStorage.setItem('studyStreak', newStreak.toString());
      localStorage.setItem('lastStudyDate', today);
      
      const completedDays = parseInt(localStorage.getItem('completedDays') || '0');
      localStorage.setItem('completedDays', (completedDays + 1).toString());
      
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: { 
          streak: newStreak, 
          completedDays: completedDays + 1,
          points: newPoints 
        }
      }));
      
      console.log(`🎯 Streak updated: ${newStreak} days (Points: ${newPoints})`);
    } else {
      window.dispatchEvent(new CustomEvent('streakUpdated', {
        detail: { 
          streak: currentStreak, 
          completedDays: parseInt(localStorage.getItem('completedDays') || '0'),
          points: newPoints 
        }
      }));
    }
  }
  
  private isConsecutiveDay(lastDate: string | null): boolean {
    if (!lastDate) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return lastDate === yesterday.toDateString();
  }
  
  public getTodaysProgress() {
    const today = new Date().toDateString();
    const points = parseFloat(localStorage.getItem(`points_${today}`) || '0');
    
    return {
      points,
      goal: this.DAILY_GOAL,
      progress: Math.min((points / this.DAILY_GOAL) * 100, 100),
      needsMore: Math.max(this.DAILY_GOAL - points, 0)
    };
  }
  
  public getStreakData() {
    return {
      streak: parseInt(localStorage.getItem('studyStreak') || '0'),
      completedDays: parseInt(localStorage.getItem('completedDays') || '0'),
      today: this.getTodaysProgress()
    };
  }
}

export const streakService = StreakService.getInstance();
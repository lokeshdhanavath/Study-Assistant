export const ACHIEVEMENTS = {
  FIRST_DAY: { name: "Getting Started", icon: "🎯", condition: (streak: number) => streak >= 1 },
  THREE_DAY: { name: "Building Momentum", icon: "🚀", condition: (streak: number) => streak >= 3 },
  ONE_WEEK: { name: "Weekly Warrior", icon: "⭐", condition: (streak: number) => streak >= 7 },
  TWO_WEEKS: { name: "Discipline Master", icon: "💎", condition: (streak: number) => streak >= 14 },
  ONE_MONTH: { name: "Unstoppable", icon: "🔥", condition: (streak: number) => streak >= 30 },
  PERFECT_WEEK: { name: "Perfect Week", icon: "🏆", condition: (studyDays: number) => studyDays >= 7 },
  STUDY_MARATHON: { name: "Study Marathon", icon: "📚", condition: (totalDays: number) => totalDays >= 100 }
};

export function checkAchievements(currentStreak: number, totalStudyDays: number, existingAchievements: string[]): string[] {
  const unlocked: string[] = [];
  
  Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
    if (!existingAchievements.includes(key)) {
      if (key === 'PERFECT_WEEK' && achievement.condition(totalStudyDays)) {
        unlocked.push(key);
      } else if (key === 'STUDY_MARATHON' && achievement.condition(totalStudyDays)) {
        unlocked.push(key);
      } else if (achievement.condition(currentStreak)) {
        unlocked.push(key);
      }
    }
  });
  
  return unlocked;
}
'use client';
import { useState, useEffect } from 'react';
import { streakService } from '@/lib/streakService';

export default function Dashboard() {
  const [streak, setStreak] = useState(1);
  const [completedDays, setCompletedDays] = useState(1);
  const [todayProgress, setTodayProgress] = useState({ points: 0, goal: 3, progress: 0 });
  const [activityPoints, setActivityPoints] = useState(125); // Starting points
  const [level, setLevel] = useState(1);
  const [nextLevelPoints, setNextLevelPoints] = useState(500);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedStreak = localStorage.getItem('studyStreak');
    const savedCompletedDays = localStorage.getItem('completedDays');
    const savedPoints = localStorage.getItem('activityPoints');
    
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedCompletedDays) setCompletedDays(parseInt(savedCompletedDays));
    if (savedPoints) setActivityPoints(parseInt(savedPoints));
    
    // Load today's progress
    const progress = streakService.getTodaysProgress();
    setTodayProgress(progress);
  }, []);

  // Listen for streak updates from other components
  useEffect(() => {
    const handleStreakUpdate = (event: CustomEvent) => {
      setStreak(event.detail.streak);
      setCompletedDays(event.detail.completedDays);
      
      // Update progress when streak updates
      const progress = streakService.getTodaysProgress();
      setTodayProgress(progress);
    };

    window.addEventListener('streakUpdated', handleStreakUpdate as EventListener);
    
    return () => {
      window.removeEventListener('streakUpdated', handleStreakUpdate as EventListener);
    };
  }, []);

  // Calculate level progress
  const levelProgress = (activityPoints / nextLevelPoints) * 100;
  const pointsNeeded = nextLevelPoints - activityPoints;

  // Only keep StreakDisplay component
  const StreakDisplay = ({ streak, onShowDetails }: { streak: number; onShowDetails: () => void }) => {
    const getMessage = (streak: number) => {
      if (streak >= 30) return `🔥 ${streak} days! You're unstoppable!`;
      if (streak >= 14) return `🌟 ${streak} days! Amazing consistency!`;
      if (streak >= 7) return `💪 ${streak} days! Great discipline!`;
      if (streak >= 3) return `🚀 ${streak} days! Keep going!`;
      return `🎯 Day ${streak}! Start your journey!`;
    };

    return (
      <div 
        className="p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg text-white cursor-pointer shadow-lg"
        onClick={onShowDetails}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl mr-2">🔥</div>
            <div className="text-3xl font-bold">{streak}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Day Streak</div>
            <div className="text-xs mt-1 opacity-80">
              {getMessage(streak)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Daily Progress</h1>
        <p className="text-gray-600">Track your learning journey and stay motivated!</p>
      </div>

      {/* Study Streak Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🔥</div>
          <h2 className="text-2xl font-bold text-gray-800">Study Streak</h2>
        </div>
        <p className="text-gray-600 mb-4">Keep your learning momentum going! Your streak resets if you miss a day.</p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Today's Progress: {todayProgress.points.toFixed(1)}/{todayProgress.goal} points</span>
            <span>{todayProgress.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all" 
              style={{ width: `${todayProgress.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {todayProgress.points < todayProgress.goal 
              ? `Need ${(todayProgress.goal - todayProgress.points).toFixed(1)} more points to maintain streak`
              : 'Daily goal completed! 🎉'
            }
          </div>
        </div>
        
        {/* Only StreakDisplay - No WeeklyProgress */}
        <div className="grid grid-cols-1 gap-4">
          <StreakDisplay 
            streak={streak} 
            onShowDetails={() => alert(`Your current streak: ${streak} days! Keep up the great work! 🎯`)}
          />
        </div>
      </div>

      {/* Activity Points Section */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">⭐</div>
          <h2 className="text-2xl font-bold text-gray-800">Activity Points</h2>
        </div>
        
        {/* Points Summary */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-green-600 mb-2">{activityPoints}</div>
          <div className="text-gray-600 text-lg">Total Points Earned</div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-700">Level {level} - Beginner</div>
            <div className="text-sm font-semibold text-gray-700">{activityPoints}/{nextLevelPoints} points</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-600 text-center">
            <strong>{pointsNeeded} points needed</strong> to reach Level {level + 1} Explorer
          </div>
        </div>

        {/* Ways to Earn Points */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Ways to Earn Points:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-700">Complete Lessons</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">+5 pts</div>
              </div>
              <div className="text-sm text-gray-600">Finish any learning module</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-700">Daily Streak</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">+10 pts</div>
              </div>
              <div className="text-sm text-gray-600">Maintain your daily study habit</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-700">Weekly Goals</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">+50 pts</div>
              </div>
              <div className="text-sm text-gray-600">Achieve your weekly targets</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-green-700">Challenges</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">+25 pts</div>
              </div>
              <div className="text-sm text-gray-600">Complete special challenges</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Quick Tip</h4>
          <p className="text-sm text-yellow-700">
            Complete at least <strong>2 lessons today</strong> to earn 10 points and maintain your streak!
          </p>
        </div>
      </div>

      {/* Your existing dashboard features below */}
      <div>
        {/* Your study plan, resources, timer, etc. */}
      </div>
    </div>
  );
}
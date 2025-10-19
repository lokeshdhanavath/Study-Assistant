'use client';

export function StreakDisplay({ streak, onShowDetails }: { streak: number; onShowDetails: () => void }) {
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
}
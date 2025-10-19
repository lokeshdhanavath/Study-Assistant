'use client';

interface AchievementModalProps {
  achievement: {
    name: string;
    icon: string;
  };
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
        <div className="text-6xl mb-4">{achievement.icon}</div>
        <h3 className="text-lg font-semibold text-gray-600">Achievement Unlocked!</h3>
        <h2 className="text-2xl font-bold my-3">{achievement.name}</h2>
        <p className="text-gray-600 mb-6">Keep up the great work! Your consistency is paying off.</p>
        <button 
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}
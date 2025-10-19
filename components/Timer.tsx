'use client';
import { streakService } from '@/lib/streakService';

export function Timer() {
  // Your existing timer logic...
  
  const handleTimerComplete = (duration: number) => {
    // Your existing timer completion logic
    console.log(`Timer completed: ${duration} minutes`);
    
    // Update streak when timer completes
    if (duration >= 25) { // Only count sessions longer than 25 minutes
      streakService.completeStudyActivity('timer');
      alert(`🎉 Great study session! Your streak has been updated.`);
    }
    
    // Your existing code...
  };

  return (
    // Your existing timer JSX
    <button onClick={() => handleTimerComplete(30)}>
      Complete Study Session
    </button>
  );
}
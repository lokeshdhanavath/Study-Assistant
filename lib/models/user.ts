// Add this UserStreak interface
export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  totalStudyDays: number;
}

// Then your existing User interface
export interface User {
  id: string;
  email: string;
  name: string;
  // ... existing fields
  streak?: UserStreak; // This will now work
}
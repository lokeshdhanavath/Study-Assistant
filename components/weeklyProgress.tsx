// 'use client';

// export function WeeklyProgress({ completedDays, weeklyGoal = 5 }: { 
//   completedDays: number; 
//   weeklyGoal?: number;
// }) {
//   const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//   const progress = (completedDays / weeklyGoal) * 100;
  
//   return (
//     <div className="p-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg text-white shadow-lg">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center">
//           <div className="text-2xl mr-2">📅</div>
//           <div>
//             <div className="text-sm opacity-90">Weekly Progress</div>
//             <div className="text-xl font-bold">{completedDays}/{weeklyGoal} days</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Progress Bar */}
//       <div className="mb-4">
//         <div className="flex justify-between text-sm mb-1">
//           <span>{progress.toFixed(0)}% Complete</span>
//           <span>
//             {completedDays >= weeklyGoal 
//               ? 'Goal Achieved! 🎉' 
//               : `${weeklyGoal - completedDays} days left`
//             }
//           </span>
//         </div>
//         <div className="w-full bg-blue-300 rounded-full h-2">
//           <div 
//             className="bg-white h-2 rounded-full transition-all" 
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>
      
//       {/* Day Indicators */}
//       <div className="flex justify-between text-xs">
//         {days.map((day, index) => (
//           <div 
//             key={day} 
//             className={`flex flex-col items-center ${
//               index < completedDays ? 'text-white' : 'text-blue-200'
//             }`}
//           >
//             <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
//               index < completedDays 
//                 ? 'bg-white text-blue-500 border-white font-bold' 
//                 : 'bg-blue-300 border-blue-200'
//             }`}>
//               {day.charAt(0)}
//             </div>
//             <div className="mt-1 text-[10px]">{day}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
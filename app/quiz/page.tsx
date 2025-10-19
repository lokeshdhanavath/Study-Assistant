'use client';
import { useState } from 'react';
import { streakService } from '@/lib/streakService';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const questions = [
    {
      question: "What is the main benefit of the Pomodoro technique?",
      options: [
        "Longer study sessions",
        "Better focus through timed intervals", 
        "More coffee breaks",
        "Fewer study materials needed"
      ],
      correct: 1
    },
    {
      question: "Which study method uses active recall?",
      options: [
        "Highlighting text",
        "Re-reading notes",
        "Flashcards and self-testing",
        "Listening to music while studying"
      ],
      correct: 2
    },
    {
      question: "What does 'spaced repetition' help with?",
      options: [
        "Making study sessions longer",
        "Remembering information long-term",
        "Finding more study resources", 
        "Writing faster notes"
      ],
      correct: 1
    }
  ];

  const handleAnswerClick = (selectedIndex: number) => {
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
      // ✅ STREAK INTEGRATION - When quiz is completed
      streakService.recordActivity('quiz');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Study Methods Quiz</h1>
      
      {showScore ? (
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            You scored {score} out of {questions.length}!
          </div>
          <div className="mb-6">
            {score === questions.length ? "🎉 Perfect! You're a study expert!" :
             score >= questions.length / 2 ? "👍 Good job! Keep learning!" :
             "📚 Keep practicing! You'll get better!"}
          </div>
          
          {/* ✅ STREAK MESSAGE */}
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ✅ Quiz completed! +1.5 points added to your daily streak progress.
          </div>
          
          <button 
            onClick={resetQuiz}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <span className="text-lg font-semibold">
              Question {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          
          <div className="text-xl font-semibold mb-6">
            {questions[currentQuestion].question}
          </div>
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import Loader from '@/components/Loader';
import Markdown from '@/components/Markdown';
import { streakService } from '@/lib/streakService'; // ✅ ADD STREAK IMPORT

type Card = { question: string; answer: string }
type QuizQ = { question: string; choices: string[]; correctIndex: number; explanation?: string }

export default function NotesStudio() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [outline, setOutline] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  async function analyze(e?: any) {
    e?.preventDefault();
    if (!text.trim()) { 
      toast.error('Paste some notes first'); 
      return; 
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ FIXED: Match the data structure from your API
      console.log('API Response:', data); // Debug log
      
      setSummary(data.summary || '');
      setOutline(Array.isArray(data.outline) ? data.outline : []);
      setCards(Array.isArray(data.flashcards) ? data.flashcards : []);
      setQuiz(Array.isArray(data.quiz) ? data.quiz : []);
      setAnswers(new Array((data.quiz || []).length).fill(-1));
      setSubmitted(false);
      
      // ✅ ADD STREAK INTEGRATION - When notes are analyzed
      if (data.summary || data.flashcards?.length > 0 || data.quiz?.length > 0) {
        streakService.recordActivity('notes');
      }
      
      toast.success('Notes analyzed successfully!');
      
    } catch (error: any) { 
      console.error('Analysis error:', error);
      toast.error(error?.message || 'Failed to analyze notes');
    } finally { 
      setLoading(false); 
    }
  }

  function submitQuiz() {
    const score = quiz.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    setSubmitted(true);
    
    // ✅ ADD STREAK INTEGRATION - When quiz is submitted
    if (score > 0) {
      streakService.recordActivity('quiz');
    }
    
    toast.info(`Quiz Score: ${score}/${quiz.length}`);
  }

  function clearAll() {
    setText('');
    setSummary('');
    setOutline([]);
    setCards([]);
    setQuiz([]);
    setAnswers([]);
    setSubmitted(false);
    toast.info('Cleared all content');
  }

  return (
    <div className="space-y-6 p-6">
      <Toaster richColors />
      <h1 className="text-3xl font-bold">Notes Analyzer</h1>
      <p className="text-gray-600">Paste your notes to get AI-powered summary, flashcards, and quiz</p>

      <form onSubmit={analyze} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Notes</label>
          <textarea 
            className="input min-h-[220px] w-full" 
            placeholder="Paste your notes, textbook content, or study material here…" 
            value={text} 
            onChange={e => setText(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="btn bg-blue-500 hover:bg-blue-600" 
            disabled={loading}
          >
            {loading ? 'Analyzing…' : 'Generate Summary & Quiz'}
          </button>
          <button 
            type="button" 
            onClick={clearAll}
            className="btn bg-gray-500 hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </form>

      {loading && (
        <div className="loader-overlay">
          <Loader size={200} label="AI is analyzing your notes..." />
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xl font-semibold">📝 Summary</div>
            <div className="badge bg-green-100 text-green-800">AI Generated</div>
          </div>
          <div className="prose max-w-none">
            <Markdown>{summary}</Markdown>
          </div>
          
          {outline.length > 0 && (
            <div className="mt-6">
              <div className="font-semibold mb-3">📋 Key Points</div>
              <ul className="list-disc list-inside space-y-2 opacity-90">
                {outline.map((point, i) => (
                  <li key={i} className="pl-2">{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Flashcards Section */}
      {cards.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xl font-semibold">🎴 Flashcards</div>
            <div className="badge bg-blue-100 text-blue-800">{cards.length} cards</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <FlipCard key={i} q={card.question} a={card.answer} />
            ))}
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {quiz.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="text-xl font-semibold">❓ Quiz</div>
              <div className="badge bg-purple-100 text-purple-800">{quiz.length} questions</div>
            </div>
            <button 
              className="btn bg-green-500 hover:bg-green-600" 
              onClick={submitQuiz} 
              disabled={submitted}
            >
              {submitted ? 'Submitted' : 'Submit Quiz'}
            </button>
          </div>

          <div className="space-y-6">
            {quiz.map((question, questionIndex) => (
              <div key={questionIndex} className="card p-5 border">
                <div className="font-medium mb-4 text-lg">
                  {questionIndex + 1}. {question.question}
                </div>
                
                <div className="grid gap-3">
                  {question.choices.map((choice, choiceIndex) => {
                    const isPicked = answers[questionIndex] === choiceIndex;
                    const isCorrect = question.correctIndex === choiceIndex;
                    const isWrongPick = submitted && isPicked && !isCorrect;
                    const isCorrectPick = submitted && isCorrect;
                    
                    let className = 'p-3 rounded-lg border cursor-pointer transition-all ';
                    
                    if (isCorrectPick) {
                      className += 'bg-green-100 border-green-500 text-green-800';
                    } else if (isWrongPick) {
                      className += 'bg-red-100 border-red-500 text-red-800';
                    } else if (isPicked) {
                      className += 'bg-blue-100 border-blue-500 text-blue-800';
                    } else {
                      className += 'bg-white border-gray-300 hover:bg-gray-50';
                    }

                    return (
                      <label key={choiceIndex} className={className}>
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          className="hidden"
                          disabled={submitted}
                          checked={isPicked}
                          onChange={() => {
                            const newAnswers = [...answers];
                            newAnswers[questionIndex] = choiceIndex;
                            setAnswers(newAnswers);
                          }}
                        />
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + choiceIndex)}.
                        </span>
                        {choice}
                      </label>
                    );
                  })}
                </div>

                {submitted && question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">💡 Explanation: </span>
                    {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlipCard({ q, a }: { q: string; a: string }) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  return (
    <div
      className="relative h-48 [perspective:800px] cursor-pointer group"
      onClick={() => setShowAnswer(!showAnswer)}
    >
      <div className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
        showAnswer ? '[transform:rotateY(180deg)]' : ''
      }`}>
        {/* Front of card */}
        <div className="card p-4 absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center text-center bg-blue-50 border-blue-200">
          <div className="text-blue-500 mb-2">❓ Question</div>
          <div className="font-medium text-gray-800">{q}</div>
          <div className="mt-3 text-xs text-blue-600 opacity-70">Click to reveal answer</div>
        </div>
        
        {/* Back of card */}
        <div className="card p-4 absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center text-center bg-green-50 border-green-200">
          <div className="text-green-500 mb-2">💡 Answer</div>
          <div className="font-medium text-gray-800 whitespace-pre-wrap">{a}</div>
          <div className="mt-3 text-xs text-green-600 opacity-70">Click to see question</div>
        </div>
      </div>
    </div>
  );
}
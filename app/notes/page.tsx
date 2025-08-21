// app/notes/page.tsx
'use client';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import Loader from '@/components/Loader';
import Markdown from '@/components/Markdown';

type Card = { question:string; answer:string }
type QuizQ = { question:string; choices:string[]; correctIndex:number; explanation?:string }

export default function NotesStudio(){
  const [text,setText]=useState('');
  const [loading,setLoading]=useState(false);
  const [summary,setSummary]=useState('');
  const [outline,setOutline]=useState<string[]>([]);
  const [cards,setCards]=useState<Card[]>([]);
  const [quiz,setQuiz]=useState<QuizQ[]>([]);
  const [answers,setAnswers]=useState<number[]>([]);
  const [submitted,setSubmitted]=useState(false);

  async function analyze(e?:any){
    e?.preventDefault();
    if(!text.trim()) { toast.error('Paste some notes first'); return; }
    setLoading(true);
    try{
      const r=await fetch('/api/summarize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});
      const data=await r.json();
      setSummary(data.summary||'');
      setOutline(Array.isArray(data.outline)?data.outline:[]);
      setCards(Array.isArray(data.flashcards)?data.flashcards:[]);
      setQuiz(Array.isArray(data.quiz)?data.quiz:[]);
      setAnswers(new Array((data.quiz||[]).length).fill(-1));
      setSubmitted(false);
      toast.success('Notes analyzed');
    }catch(e:any){ toast.error(e?.message||'Failed'); }
    finally{ setLoading(false); }
  }

  function submitQuiz(){
    const score = quiz.reduce((acc,q,i)=> acc + (answers[i]===q.correctIndex ? 1 : 0), 0);
    setSubmitted(true);
    toast.info(`Score: ${score}/${quiz.length}`);
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <h1 className="text-3xl font-bold">Notes Analyzer</h1>

      <form onSubmit={analyze} className="card p-5 grid gap-4">
        <textarea className="input min-h-[220px]" placeholder="Paste your notes or textbook text here…" value={text} onChange={e=>setText(e.target.value)} />
        <button className="btn w-full md:w-auto" disabled={loading}>{loading?'Analyzing…':'Generate Summary, Flashcards & Quiz'}</button>
      </form>

      {loading && <div className="loader-overlay"><Loader size={200} label="Analyzing" /></div>}

      {summary && (
        <div className="card p-5">
          <div className="text-xl font-semibold mb-2">Summary</div>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
           <Markdown>{summary}</Markdown> 
            </div>
          {!!outline?.length && (
            <ul className="mt-4 list-disc list-inside space-y-1 opacity-90">
              {outline.map((o,i)=><li key={i}>{o}</li>)}
            </ul>
          )}
        </div>
      )}

      {!!cards.length && (
        <div className="card p-5">
          <div className="text-xl font-semibold mb-3">Flashcards</div>
          <div className="grid md:grid-cols-3 gap-4">
            {cards.map((c,i)=><FlipCard key={i} q={c.question} a={c.answer} />)}
          </div>
        </div>
      )}

      {!!quiz.length && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">Quiz</div>
            <button className="btn" onClick={submitQuiz} disabled={submitted}>Submit</button>
          </div>

          <div className="mt-4 grid gap-4">
            {quiz.map((q,qi)=>(
              <div key={qi} className="card p-4">
                <div className="font-medium mb-2">{qi+1}. {q.question}</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {q.choices.map((ch,ci)=>{
                    const picked = answers[qi]===ci;
                    const correct = q.correctIndex===ci;
                    const wrongPick = submitted && picked && !correct;
                    const correctPick = submitted && correct;
                    const base = 'card p-3 cursor-pointer transition ring-0';
                    const color =
                      correctPick ? 'bg-green-500/15 ring-2 ring-green-500' :
                      wrongPick   ? 'bg-red-500/15 ring-2 ring-red-500' :
                      picked      ? 'ring-2 ring-purple-500' :
                      '';
                    return (
                      <label key={ci} className={`${base} ${color}`}>
                        <input
                          type="radio"
                          name={`q${qi}`}
                          className="hidden"
                          disabled={submitted}
                          checked={answers[qi]===ci}
                          onChange={()=>setAnswers(prev=>{ const c=[...prev]; c[qi]=ci; return c; })}
                        />
                        {String.fromCharCode(65+ci)}. {ch}
                      </label>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="mt-2 text-sm opacity-90">
                    <span className="text-green-400 font-medium">Why correct:</span> {q.explanation}
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

function FlipCard({ q, a }: { q:string; a:string }){
  const [showAns,setShow]=useState(false);
  return (
    <div
      className="relative h-40 [perspective:800px] cursor-pointer"
      onClick={()=>setShow(v=>!v)}
    >
      <div className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${showAns? '[transform:rotateY(180deg)]':''}`}>
        <div className="card p-4 absolute inset-0 [backface-visibility:hidden] flex items-center justify-center text-center">
          <div>
            <div className="text-sm opacity-70 mb-1">Tap to reveal</div>
            <div className="font-medium">{q}</div>
          </div>
        </div>
        <div className="card p-4 absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center text-center">
          <div className="font-medium whitespace-pre-wrap">{a}</div>
        </div>
      </div>
    </div>
  );
}

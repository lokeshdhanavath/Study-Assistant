import { NextResponse } from 'next/server'
import { callOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Card = { question: string; answer: string }
type QuizQ = { question: string; choices: string[]; correctIndex: number; explanation?: string }

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function POST(req: Request) {
  // ---- read body safely (never throw on bad/empty JSON) -------------------
  let text = ''
  let title = 'Untitled'
  try {
    const raw = await req.text()
    if (raw) {
      const parsed = JSON.parse(raw)
      text = String(parsed?.text ?? '').trim()
      if (parsed?.title) title = String(parsed.title)
    }
  } catch {
    // ignore; fall back to empty text
  }

  const emptyPayload = { summary: '', flashcards: [], quiz: [] as QuizQ[] }
  if (!text) {
    return NextResponse.json(emptyPayload, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    // ---- model prompt ------------------------------------------------------
    const prompt = `You are a study assistant. Work ONLY with the user's notes below.
Produce detailed, well-structured output grounded strictly in the notes (no fabrications).

CRITICAL: Return ONLY valid JSON with exactly this structure (no markdown, no extra text):
{
 "summary": "≤350 words, Markdown allowed. Use short ### subheads. Include: (1) TL;DR (2–3 sentences), (2) Core ideas & why they matter, (3) Any step-by-step procedures present, (4) A mini cheat-sheet for definitions/tables (e.g., types/sizes/ranges) if present, (5) One tiny worked example or pseudocode if present, and (6) 3–5 common pitfalls/misconceptions. No new facts beyond the notes.",
 "flashcards": [{"question": "...", "answer": "..."} x 12..18],
 "quiz_seed": [
   {
     "question":"(directly answerable from the notes)",
     "correct_answer":"(short, verbatim or near-verbatim from notes)",
     "distractors":["(three plausible but wrong choices derived from the notes context)"],
     "explanation":"(ONE sentence explaining why the correct answer is right, grounded in the notes)"
   }
 ]
}

Notes title: ${title}
Notes:
"""${text.slice(0, 12000)}"""`

    // Add better error handling for OpenAI response
    let json: any
    let rawResponse: string
    
    try {
      rawResponse = await callOpenAI(prompt)
      console.log('Raw OpenAI response:', rawResponse?.slice(0, 200) + '...')
      
      // Try to parse the response
      if (typeof rawResponse === 'string') {
        // Remove any markdown code blocks if present
        const cleanResponse = rawResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
        json = JSON.parse(cleanResponse)
      } else if (typeof rawResponse === 'object') {
        json = rawResponse
      } else {
        throw new Error('Unexpected response type from OpenAI')
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      
      
      // Return fallback response
      return NextResponse.json({
        summary: `### TL;DR\nFailed to generate AI summary. Please try again.\n\n### Original Notes\n${text.slice(0, 300)}...`,
        flashcards: [],
        quiz: []
      }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    // ---- flashcards --------------------------------------------------------
    const flashcards: Card[] = Array.isArray(json?.flashcards)
      ? json.flashcards
          .filter((c: any) => c?.question && c?.answer)
          .slice(0, 18)
          .map((c: any) => ({ 
            question: String(c.question).slice(0, 200), 
            answer: String(c.answer).slice(0, 500) 
          }))
      : []

    // ---- quiz --------------------------------------------------------------
    let quiz: QuizQ[] = []
    if (Array.isArray(json?.quiz_seed)) {
      quiz = json.quiz_seed.slice(0, 8).map((q: any) => {
        const correctAnswer = String(q.correct_answer).slice(0, 200)
        const distractors = (q.distractors || [])
          .map((d: any) => String(d).slice(0, 200))
          .slice(0, 3)
        
        const choices = shuffle([correctAnswer, ...distractors])
        const correctIndex = Math.max(0, choices.findIndex((c) => c === correctAnswer))
        
        return {
          question: String(q.question).slice(0, 300),
          choices,
          correctIndex,
          explanation: String(q.explanation || '').slice(0, 200),
        }
      })
    }

    // ---- fallbacks (always return JSON) -----------------------------------
    if (!flashcards.length) {
      const lines = text.split(/\n+/).filter(Boolean).slice(0, 12)
      for (const ln of lines) {
        if (ln.length >= 40) {
          flashcards.push({ 
            question: `Explain: ${ln.slice(0, 60)}…`, 
            answer: ln.slice(0, 300) 
          })
        }
      }
    }
    
    if (!quiz.length) {
      const sentences = text.split(/[.!?]\s+/).filter((s) => s.length > 25).slice(0, 8)
      quiz = sentences.map((s) => {
        const correct = s.slice(0, 80)
        const distractors = shuffle(sentences.filter((x) => x !== s))
          .slice(0, 3)
          .map((d) => d.slice(0, 80))
        const choices = shuffle([correct, ...distractors])
        return {
          question: 'Which statement appears in your notes?',
          choices,
          correctIndex: choices.indexOf(correct),
          explanation: 'This option appears directly in your notes.',
        }
      })
    }

    const result = {
      summary: String(json?.summary || 'No summary generated').slice(0, 1000),
      flashcards: flashcards.slice(0, 18),
      quiz: quiz.slice(0, 8)
    }

    return NextResponse.json(result, { 
      status: 200, 
      headers: { 'Cache-Control': 'no-store' } 
    })
    
  } catch (e) {
    console.error('summarize error', e)
    return NextResponse.json({
      summary: `### Error\nFailed to process your notes. Please try again with shorter text.\n\n### Original Notes Preview\n${text.slice(0, 300)}...`,
      flashcards: [],
      quiz: []
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
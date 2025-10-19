

// Fix: Explicitly declare the necessary structure of the global 'process' object.
// This resolves the TypeScript error 'Cannot find name process'.
declare const process: {
  env: {
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    OPENAI_BASE_URL?: string;
    [key: string]: string | undefined; // Allows for other environment variables
  }
}

export type Resource = {
  title: string; description: string; url: string; source?: string;
  type?: string; difficulty?: string; is_free?: boolean; rating?: number; tags?: string[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
// Uses the OPENAI_BASE_URL from .env (which should be https://openrouter.ai/api/v1)
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

export async function callOpenAI(prompt: string) {
  // If no key, indicate fallback
  if (!OPENAI_API_KEY) return { _fallback: true } as any

  const body: any = {
    // Uses the custom model name from .env (e.g., deepseek/deepseek-r1-0528:free)
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content:
        'You are StudyFlow, an academic assistant. When asked for JSON, output ONLY valid JSON with the requested top-level keys. Do not include prose outside JSON.' },
      { role: 'user', content: prompt }
    ],
    // Use generic JSON object mode
    response_format: { type: 'json_object' },
    temperature: 0.2,
  }

  // Construct the API URL using the dynamic base URL
  const apiUrl = `${OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI API error (${apiUrl}): ${res.status} ${text}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content ?? '{}'
  try {
    return JSON.parse(content)
  } catch {
    // If the model ever returns non-JSON, fall back
    return { _fallback: true }
  }
}

export async function aiResources(query: string, category: string) {
  const prompt = `Return JSON with keys { "resources": [...], "total_found": number, "search_summary": string }.
Each "resources" item MUST include: title, description, url, source, type, difficulty, is_free, rating (3.5-5), tags[].
Topic: "${query}". Category hint: "${category || 'any'}".
Prioritize credible platforms (Khan Academy, MIT OCW, edX, GeeksforGeeks, Coursera, Real Python, W3Schools, university pages, reputable YouTube channels) Do not fabricate URLs only return URLs that actually work and have relevant content in them.`

  const json: any = await callOpenAI(prompt)
  if (json?._fallback || !Array.isArray(json?.resources)) {
    return {
      resources: [
        { title: 'Khan Academy', description: 'Free lessons and practice', url: 'https://khanacademy.org', source: 'Khan Academy', type: 'course', difficulty: 'beginner', is_free: true, rating: 4.8, tags: ['general', 'free'] },
        { title: 'MIT OpenCourseWare', description: 'University courses and materials', url: 'https://ocw.mit.edu', source: 'MIT OCW', type: 'course', difficulty: 'intermediate', is_free: true, rating: 4.7, tags: ['university', 'open'] },
        { title: 'Coursera', description: 'University-level online courses', url: 'https://coursera.org', source: 'Coursera', type: 'course', difficulty: 'intermediate', is_free: false, rating: 4.6, tags: ['MOOC'] },
      ],
      total_found: 3,
      search_summary: 'fallback',
    }
  }
  return json
}

export async function aiPlan(subject: string, examISO: string) {
  const daysLeft = Math.max(1, Math.ceil((new Date(examISO).getTime() - Date.now()) / 86400000))
  const must = daysLeft <= 7
    ? `Return exactly ONE week with a "days" array of length ${daysLeft}.
      Each "day" must use a weekday name starting from today (e.g., Monday) and list 2–3 concrete tasks.
      Avoid generic phrases like "Read Chapter 1".`
    : `Return exactly ${Math.max(1, Math.ceil(daysLeft/7))} weeks.
      Each week must contain 7 "days" objects with concrete tasks.`

  const prompt = `Output ONLY JSON with keys { "subject", "examDate", "weeks": [...], "tips": [...] }.
- "weeks": [ { "week": number, "milestones": [string], "days": [ { "day": string, "tasks": [string] } ] } ]
- Subject: "${subject}". Exam date: "${examISO}".
- Use detailed, subject-specific topics (e.g., for Computer Science: algorithms, DS, OS, DBMS, networks; for DSA: arrays, trees, graphs, DP; for Thermodynamics: First/Second law, entropy, etc.).
- ${must}
Return strict JSON.`

  const json: any = await callOpenAI(prompt)
  if (json?._fallback) return {}
  return json
}

export async function aiTopics(subject: string): Promise<string[]> {
  // Uses the same callOpenAI() helper you already have in this file.
  const prompt = `Return ONLY JSON: {"topics":[string,...]}.
- Provide 12 concise, domain-specific subtopics for "${subject}".
- Avoid generic labels like "Chapter 1" or "Introduction".
- Prefer concrete concepts (e.g., "Hash tables", "Entropy & the Second Law", "SQL Joins", "Bayes' Theorem").`

  const json: any = await callOpenAI(prompt)
  if (json?._fallback || !Array.isArray(json?.topics)) return []

  // Keep it tidy & non-empty strings
  return (json.topics as string[]).map(t => String(t).trim()).filter(Boolean).slice(0, 20)
}

export async function aiSummarizeAndQuiz(text: string) {
  const prompt = `Return ONLY JSON with keys:
{
  "outline": [string],
  "summary": string,
  "flashcards": [ { "q": string, "a": string } ],
  "mcq": [ { "question": string, "options": [string], "answer": string } ]
}
Use the following text:
${text.slice(0, 6000)}
`
  const json: any = await callOpenAI(prompt)

  if (json?._fallback) {
    const sentences = text.split('. ').slice(0, 10)
    const outline = sentences.slice(0, 4)
    const flashcards = outline.map((s, i) => ({ q: `Key idea ${i + 1}?`, a: s }))
    const mcq = outline.map((s, i) => ({
      question: `Which relates to idea ${i + 1}?`,
      options: [s, 'Unrelated 1', 'Unrelated 2', 'Unrelated 3'],
      answer: s,
    }))
    return { outline, summary: sentences.slice(0, 3).join('. '), flashcards, mcq }
  }
  return json
}
// app/api/plan/route.ts
import { NextResponse } from 'next/server'
import { aiPlan, aiTopics } from '@/lib/openai'

type Day = { day: string; tasks: string[] }
type Week = { week: number; milestones: string[]; days: Day[] }
type Plan = { subject: string; examDate: string; weeks: Week[]; tips: string[] }

const DAY_MS = 86400000

function daysUntil(examISO: string) {
  const ms = new Date(examISO).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)
  return Math.max(1, Math.ceil(ms / DAY_MS))
}
function weeksUntil(examISO: string) {
  return Math.max(1, Math.ceil(daysUntil(examISO) / 7))
}

const ALIASES: Record<string, string> = {
  cs: 'computer science',
  'comp sci': 'computer science',
  'comp-sci': 'computer science',
  stats: 'statistics',
  stat: 'statistics',
  dsa: 'dsa',
}

const SUBJECT_TOPICS: Record<string, string[]> = {
  'computer science': [
    'Algorithms vs. data structures',
    'Big-O & complexity analysis',
    'Arrays, strings & hash maps',
    'Stacks & queues',
    'Trees & binary search trees',
    'Graphs (BFS/DFS, shortest paths)',
    'Sorting (quick/merge/heap) & binary search',
    'Dynamic programming basics',
    'Operating systems (processes, threads, deadlocks)',
    'Databases (ER, normalization, SQL joins)',
    'Computer networks (TCP/IP, HTTP/HTTPS, DNS)',
  ],
  'dsa': [
    'Arrays & strings',
    'Linked lists',
    'Stacks & queues',
    'Hash tables',
    'Trees & BST',
    'Heaps & priority queues',
    'Graphs (BFS/DFS)',
    'Topological sort',
    'Shortest paths (Dijkstra)',
    'Greedy strategies',
    'Two-pointers & sliding window',
    'DP: knapsack / LIS / grid paths',
  ],
  'statistics': [
    'Descriptive stats & visualization',
    'Probability axioms & combinatorics',
    'Random variables & distributions',
    'Expectation & variance',
    'Common distributions (Normal, Binomial, Poisson)',
    'Sampling & CLT',
    'Estimation & confidence intervals',
    'Hypothesis testing (z, t, χ²)',
    'p-values, power & effect size',
    'Linear regression & correlation',
    'ANOVA basics',
    'Bayesian inference (Bayes’ theorem, priors/posteriors)',
  ],
  'calculus': [
    'Limits & continuity',
    'Differentiation rules',
    'Applications of derivatives (rates, optimization)',
    'Integrals & FTC',
    'Techniques of integration',
    'Sequences & series basics',
  ],
  'thermodynamics': [
    'Zeroth & First laws',
    'Second law & entropy',
    'State variables & equations of state',
    'Enthalpy, Gibbs free energy',
    'Heat engines & efficiency',
    'Phase diagrams & transitions',
  ],
  'organic chemistry': [
    'Nomenclature & structure',
    'Isomerism & stereochemistry',
    'Reaction mechanisms',
    'Substitution vs. elimination',
    'Aromatic compounds',
    'Carbonyl chemistry',
    'Spectroscopy (IR/NMR) basics',
  ],
}

function canonicalSubject(raw: string) {
  let k = raw.trim().toLowerCase()
  if (ALIASES[k]) k = ALIASES[k]
  return k
}

function isGenericTask(t: string) {
  const s = t.toLowerCase()
  return s.includes('chapter') || s.includes('read chapter') || s.includes('notes') || s === 'review notes'
}

async function topicListFor(subject: string): Promise<string[]> {
  const key = canonicalSubject(subject)

  // 1) exact mapping
  if (SUBJECT_TOPICS[key]) return SUBJECT_TOPICS[key]

  // 2) partial match
  for (const k of Object.keys(SUBJECT_TOPICS)) {
    if (key.includes(k)) return SUBJECT_TOPICS[k]
  }

  // 3) AI topics (cheap, json_object mode). If not available → []
  const generated = await aiTopics(subject).catch(() => [])
  if (generated.length) return generated

  // 4) deterministic generic, but still subject-anchored
  return [
    `${subject}: key definitions & formulas`,
    `${subject}: foundational concepts`,
    `${subject}: core problem patterns`,
    `${subject}: mixed practice problems`,
    `${subject}: error-log review`,
    `${subject}: timed mock & analysis`,
  ]
}

/** Ensure output matches remaining time & has concrete topics */
async function normalizePlan(raw: any, subject: string, examISO: string): Promise<Plan> {
  const dLeft = daysUntil(examISO)
  const wTarget = weeksUntil(examISO)
  const topics = await topicListFor(subject)            // <— ALWAYS have domain topics now

  // 1) Start with model output if present
  const rawWeeks: any[] = Array.isArray(raw?.weeks) ? raw.weeks : []
  let weeks: Week[] = rawWeeks.map((w: any, i: number) => ({
    week: typeof w?.week === 'number' ? w.week : i + 1,
    milestones: Array.isArray(w?.milestones) ? w.milestones.filter(Boolean) : [],
    days: (Array.isArray(w?.days) ? w.days : []).map((d: any, di: number) => ({
      day: typeof d?.day === 'string' && d.day.trim() ? d.day : `Day ${di + 1}`,
      tasks: Array.isArray(d?.tasks) ? d.tasks.filter(Boolean) : [],
    })),
  }))

  // 2) If exam ≤ 7 days → Final Week, exactly dLeft days, always SPECIFIC
  if (dLeft <= 7) {
    const days: Day[] = Array.from({ length: dLeft }, (_, i) => {
      const weekday = new Date(Date.now() + i * DAY_MS).toLocaleDateString(undefined, { weekday: 'long' })
      const t = topics[i % topics.length]
      return {
        day: weekday,
        tasks: [
          t,
          `Practice problems on ${t}`,
          i >= dLeft - 2 ? 'Timed mock & error-log review' : 'Summarize mistakes & re-study',
        ],
      }
    })

    weeks = [{
      week: 1,
      milestones: ['Final review', 'Timed mocks', 'Error-log focus'],
      days,
    }]
  } else {
    // 3) Weekly horizon → fit to wTarget, always SPECIFIC per day
    if (weeks.length === 0) {
      weeks = Array.from({ length: wTarget }, (_, wi) => {
        const start = wi * 7
        const slice = topics.slice(start, start + 7)
        const dnames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        const days: Day[] = dnames.map((name, di) => {
          const t = slice[di] || topics[(start + di) % topics.length]
          const tasks = di >= 5
            ? [`Timed mock on ${t}`, 'Immediate review & error-log']
            : [t, `Practice problems on ${t}`, 'Summarize weak points']
          return { day: name, tasks }
        })
        return { week: wi + 1, milestones: [slice[0] || 'Milestone', slice[1] || 'Practice'], days }
      })
    } else {
      // Trim/extend
      weeks = weeks.slice(0, wTarget)
      while (weeks.length < wTarget) {
        const wi = weeks.length
        const dnames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        const days: Day[] = dnames.map((name, di) => {
          const t = topics[(wi * 7 + di) % topics.length]
          const tasks = di >= 5
            ? [`Timed mock on ${t}`, 'Immediate review & error-log']
            : [t, `Practice problems on ${t}`, 'Summarize weak points']
          return { day: name, tasks }
        })
        weeks.push({ week: wi + 1, milestones: ['Reinforcement', 'Practice'], days })
      }
    }

    // Final 1–2 weeks emphasize mocks
    const last = weeks.length - 1
    ;[last - 1, last].forEach((i) => {
      if (i >= 0) {
        const sat = weeks[i].days?.[5]; const sun = weeks[i].days?.[6]
        if (sat) sat.tasks = ['Full-length mock (timed)', 'Immediate review']
        if (sun) sun.tasks = ['Weak-topic drills', 'Light recap & rest']
      }
    })
  }

  // 4) Replace any generic tasks that slipped through
  for (const w of weeks) {
    for (const d of w.days) {
      d.tasks = d.tasks.map((t, idx) => isGenericTask(t) ? (topics[idx % topics.length] || 'Targeted practice') : t)
    }
  }

  const tips = Array.isArray(raw?.tips) && raw.tips.length
    ? raw.tips
    : ['Spaced repetition daily', 'One full mock near the end', 'Maintain an error log']

  return {
    subject: String(raw?.subject || subject),
    examDate: String(raw?.examDate || examISO),
    weeks,
    tips,
  }
}

export async function POST(req: Request) {
  try {
    const { subject, examDate } = await req.json()
    const raw = await aiPlan(subject, examDate) // may be {} if fallback
    const plan = await normalizePlan(raw, subject, examDate)
    return NextResponse.json(plan)
  } catch (e) {
    console.error('plan route error:', e)
    // Hard fallback, still date-accurate & specific
    const alt = new Date(Date.now() + 6 * DAY_MS).toISOString().slice(0, 10)
    const plan = await normalizePlan({}, 'General Study', alt)
    return NextResponse.json(plan, { status: 200 })
  }
}

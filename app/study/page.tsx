// app/study/page.tsx
'use client'
import Loader from '@/components/Loader';
import { useEffect, useMemo, useState } from 'react'
import { toast, Toaster } from 'sonner'

type Day = { day: string; tasks: string[] }
type Week = { week: number; milestones: string[]; days: Day[] }
type Plan = { subject: string; examDate: string; weeks: Week[]; tips: string[] }
type SavedPlan = Plan & { id: string; createdAt: number }

const STORAGE_KEY = 'studyflow_plans'

function loadSaved(): SavedPlan[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveAll(list: SavedPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function Study() {
  const [subject, setSubject] = useState('Calculus')
  const [date, setDate] = useState<string>(new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [saved, setSaved] = useState<SavedPlan[]>([])

  useEffect(() => {
    setSaved(loadSaved())
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, examDate: date }) })
      const data = await res.json()
      const weeks: Week[] = Array.isArray(data?.weeks) ? data.weeks : []
      const safePlan: Plan = { subject: data?.subject || subject, examDate: data?.examDate || date, weeks, tips: Array.isArray(data?.tips) ? data.tips : [] }
      setPlan(safePlan)
      setTimeout(() => toast.success('Plan generated'), 0)
    } catch (e: any) {
      console.error(e); setPlan(null)
      setTimeout(() => toast.error(e?.message || 'Failed to generate plan'), 0)
    } finally { setLoading(false) }
  }

  const weeksCount = useMemo(() => (plan?.weeks?.length || 0), [plan])

  const savePlan = () => {
    if (!plan) return
    const item: SavedPlan = { ...plan, id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, createdAt: Date.now() }
    const list = [item, ...saved].slice(0, 20)
    setSaved(list); saveAll(list)
    toast.success('Plan saved')
  }
  const loadPlan = (id: string) => {
    const p = saved.find(s => s.id === id)
    if (p) { setPlan(p); setSubject(p.subject); setDate(p.examDate); toast.info('Plan loaded') }
  }
  const deletePlan = (id: string) => {
    const list = saved.filter(s => s.id !== id)
    setSaved(list); saveAll(list)
    toast.success('Deleted')
  }

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">AI Study Planner</h1>

      <div className="card p-6 grid md:grid-cols-[4fr_150px_2fr] gap-3 items-end">
        <div>
          <div className="text-sm opacity-60 mb-1">Subject</div>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <div className="text-sm opacity-60 mb-1">Exam Date</div>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn flex-1" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate Plan'}</button>
          <button className="btn flex-1" onClick={savePlan} disabled={!plan}>Save</button>
        </div>
      </div>

      {loading && (
        <div className="loader-overlay">
          <Loader size={200} label="Generating" />
        </div>
      )}

      {plan && (
        <div className="mt-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="card p-4"><div className="text-xs opacity-60">Subject</div><div className="text-xl font-semibold">{plan.subject}</div></div>
            <div className="card p-4"><div className="text-xs opacity-60">Exam</div><div className="text-xl font-semibold">{plan.examDate}</div></div>
            <div className="card p-4"><div className="text-xs opacity-60">Weeks</div><div className="text-xl font-semibold">{weeksCount}</div></div>
          </div>

          <div className="space-y-4">
            {(plan.weeks || []).map((w) => (
              <div className="card p-4" key={w.week}>
                <div className="font-semibold">Week {w.week}</div>
                <div className="text-sm opacity-70 mt-1">Milestones: {(w.milestones || []).join(', ')}</div>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {(w.days || []).map((d, i) => (
                    <div key={i} className="border border-border rounded-2xl p-3">
                      <div className="font-medium mb-1">{d.day}</div>
                      <ul className="list-disc pl-5 text-sm opacity-80">
                        {(d.tasks || []).map((t, ti) => (<li key={ti}>{t}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card p-4">
            <div className="font-semibold mb-2">Tips</div>
            <ul className="list-disc pl-5 opacity-80">
              {(plan.tips || []).map((t, i) => (<li key={i}>{t}</li>))}
            </ul>
          </div>
        </div>
      )}

      {/* Saved plans list */}
      <div className="mt-10">
        <div className="text-xl font-semibold mb-3">Saved Plans</div>
        {saved.length === 0 && <div className="card p-4 opacity-70">No saved plans yet.</div>}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {saved.map(sp => (
            <div key={sp.id} className="card p-4 flex flex-col gap-2">
              <div className="font-semibold">{sp.subject}</div>
              <div className="text-sm opacity-70">Exam: {sp.examDate}</div>
              <div className="text-sm opacity-70">Weeks: {sp.weeks.length}</div>
              <div className="text-xs opacity-60">Saved: {new Date(sp.createdAt).toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                <button className="btn flex-1" onClick={() => loadPlan(sp.id)}>Open</button>
                <button className="btn flex-1" onClick={() => deletePlan(sp.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

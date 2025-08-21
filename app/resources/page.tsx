'use client'
import Loader from '@/components/Loader'
import { useState } from 'react'
import { toast, Toaster } from 'sonner'

type R = {
  title: string
  description: string
  url: string
  source?: string
  type?: string
  difficulty?: string
  is_free?: boolean
  rating?: number
  tags?: string[]
}

export default function Resources() {
  const [q, setQ] = useState('')
  const [category, setCat] = useState<'all' | 'videos' | 'courses' | 'articles'>('all')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<R[]>([])

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!q.trim()) {
      toast.info('Type a topic first')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ query: q.trim(), category }),
      })

      // Safely parse body (even on non-200)
      const data = await res.json().catch(() => ({} as any))

      if (!res.ok) {
        throw new Error(data?.error || 'Search failed')
      }

      const resources: R[] = Array.isArray(data?.resources) ? data.resources : []
      setItems(resources)

      if (resources.length > 0) {
        toast.success(`Found ${resources.length} resources`)
      } else {
        toast.error('No resources found. Try a different query.')
      }
    } catch (err: any) {
      console.error('resources search error:', err)
      toast.error(err?.message || 'Failed to search resources')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Toaster richColors />

      <h1 className="text-3xl font-bold mb-6">Resource Discovery</h1>

      <form onSubmit={search} className="card p-6 grid md:grid-cols-[1fr_180px_140px] gap-3 items-end">
        <div>
          <div className="text-sm opacity-60 mb-1">Topic</div>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g., Thermodynamics"
          />
        </div>

        <div>
          <div className="text-sm opacity-60 mb-1">Category</div>
          <select
            className="input"
            value={category}
            onChange={(e) => setCat(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="videos">Videos</option>
            <option value="courses">Courses</option>
            <option value="articles">Articles</option>
          </select>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching…' : 'Search Resources'}
        </button>
      </form>

      {loading && <div className="loader-overlay"><Loader size={200} label="Searching" /></div>}

      <div className="mt-8 grid gap-4">
        {items.map((r, i) => (
          <div className="card p-5" key={i}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xl font-semibold">{r.title}</div>
                {r.description && <p className="opacity-70 mt-1">{r.description}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {r.source && <span className="badge">{r.source}</span>}
                  {r.difficulty && <span className="badge">{r.difficulty}</span>}
                  {'is_free' in r && <span className="badge">{r.is_free ? 'Free' : 'Paid'}</span>}
                  {typeof r.rating === 'number' && <span className="badge">★ {r.rating.toFixed(1)}</span>}
                </div>
              </div>
              <a className="btn" href={r.url} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

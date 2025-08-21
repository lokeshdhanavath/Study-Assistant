// lib/search.ts
import 'server-only'

export type WebHit = { title: string; url: string; source?: string }
export type YTHit = { title: string; url: string; source?: string }

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search'

function pick<T = any>(obj: any, path: string): T[] {
  // read dotted path safely and return [] if not found
  const segs = path.split('.')
  let cur: any = obj
  for (const s of segs) {
    if (cur && typeof cur === 'object' && s in cur) cur = cur[s]
    else return []
  }
  return Array.isArray(cur) ? cur : []
}

function normalizeHit(u: string, t: string): WebHit | null {
  try {
    const url = new URL(u).toString()
    return { title: (t || '').trim(), url, source: new URL(url).hostname }
  } catch {
    return null
  }
}

export async function braveWebSearch(query: string, count = 12): Promise<WebHit[]> {
  const key = process.env.BRAVE_API_KEY
  if (!key) return []

  const url =
    `${BRAVE_ENDPOINT}?q=${encodeURIComponent(query)}` +
    `&count=${count}&country=us&spellcheck=1&safesearch=moderate`

  const res = await fetch(url, {
    headers: { 'X-Subscription-Token': key, 'Accept': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Brave search failed: ${res.status}`)
  const json = await res.json()

  // Brave can return results in multiple buckets; merge them
  const buckets = [
    ...pick(json, 'web.results'),
    ...pick(json, 'news.results'),
    ...pick(json, 'videos.results'),
    ...pick(json, 'mixed.results'),
  ]

  const raw = buckets
    .filter((r: any) => r?.url && r?.title)
    .map((r: any) => normalizeHit(r.url, r.title))
    .filter(Boolean) as WebHit[]

  // de-dupe by url
  const seen = new Set<string>()
  const out: WebHit[] = []
  for (const h of raw) {
    if (!seen.has(h.url)) { out.push(h); seen.add(h.url) }
  }
  return out.slice(0, count * 2) // allow a few extra before validation
}

export async function urlExists(url: string, timeoutMs = 6000): Promise<boolean> {
  // lenient validator: only reject clear "not found" statuses
  const rejectCodes = new Set([404, 410, 451])

  const timedFetch = async (init: RequestInit) => {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal })
      return res
    } finally {
      clearTimeout(to)
    }
  }

  try {
    // Some sites block HEAD – it’s fine if it fails
    const head = await timedFetch({ method: 'HEAD', redirect: 'follow' })
    if (head && !rejectCodes.has(head.status)) return true
  } catch { /* ignore */ }

  try {
    const get = await timedFetch({ method: 'GET', redirect: 'follow' })
    if (!get) return false
    if (!rejectCodes.has(get.status)) return true

    // As a last check, read a small slice of body and look for “not found”
    const text = (await get.text()).slice(0, 600).toLowerCase()
    if (
      text.includes('page not found') ||
      text.includes('404') ||
      text.includes('not found') ||
      text.includes('does not exist')
    ) return false

    // body didn’t scream 404 – accept as exists
    return true
  } catch {
    // Network flake? Assume exists rather than dropping everything.
    return true
  }
}

// Optional: if you later add YouTube Data API v3, keep a function here.
// For now, rely on Brave’s video results (already merged above).
export async function ytSearch(_q: string, _max = 6): Promise<YTHit[]> {
  return []
}

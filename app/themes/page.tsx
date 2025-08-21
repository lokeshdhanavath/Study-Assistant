'use client'
import { useEffect, useMemo, useState } from 'react'
import { Check, Palette } from 'lucide-react'

/**
 * Themes: keep "ink-sky" as your Cloud Gray dark base,
 * replace the others with 5 elegant palettes.
 */
const THEMES = [
  'ink-sky',          // Cloud Gray (unchanged)
  'lilac-noir',       // pink–lilac with slate accents
  'caribbean-teal',   // teal + soft mints
  'saffron-slate',    // warm saffron + cool slate
  'periwinkle',       // airy blues + periwinkle
  'fern-mint',        // fresh greens
] as const

// Friendly names, taglines, and preview dots per theme
const META: Record<(typeof THEMES)[number], { name: string; tag: string; dots: string[] }> = {
  'ink-sky':        { name: 'Cloud Gray',     tag: 'Classic soft gray with purple accents', dots: ['#8b5cf6', '#9ca3af', '#c7c9d1'] },
  'lilac-noir':     { name: 'Lilac Noir',     tag: 'Elegant lilac with rosy tints and deep slate',   dots: ['#E3BAC6', '#BC9EC1', '#596475'] },
  'caribbean-teal': { name: 'Caribbean Teal', tag: 'Calming mints with bold teal accents',           dots: ['#9CC5A1', '#49A078', '#216869'] },
  'saffron-slate':  { name: 'Saffron Slate',  tag: 'Warm saffron balanced by modern slate',          dots: ['#F5CB5C', '#CFDBD5', '#242423'] },
  'periwinkle':     { name: 'Periwinkle Sky', tag: 'Airy sky blues with periwinkle depth',           dots: ['#A3D5FF', '#83C9F4', '#6F73D2'] },
  'fern-mint':      { name: 'Fern Mint',      tag: 'Fresh greens from mint to fern',                 dots: ['#CCFCCB', '#96E6B3', '#568259'] },
}

// Visual tokens for card preview (kept local to this page)
const TOKENS: Record<(typeof THEMES)[number], { bg: string; card: string; primary: string; border: string; muted?: string }> = {
  'ink-sky':        { bg:'hsl(224 20% 10%)', card:'hsl(224 18% 12%)', primary:'hsl(257 90% 64%)', border:'hsl(224 12% 22%)', muted:'hsl(224 12% 18%)' },
  // Lilac/pink family with a slate touch
  'lilac-noir':     { bg:'hsl(350 60% 96%)', card:'hsl(340 35% 88%)', primary:'hsl(290 30% 60%)', border:'hsl(340 25% 78%)', muted:'hsl(350 40% 93%)' },
  // Teal & mint family
  'caribbean-teal': { bg:'hsl(160 20% 94%)', card:'hsl(150 30% 85%)', primary:'hsl(165 40% 40%)', border:'hsl(150 18% 75%)', muted:'hsl(155 22% 92%)' },
  // Saffron + slate neutrals
  'saffron-slate':  { bg:'hsl(90 20% 91%)',  card:'hsl(150 16% 83%)', primary:'hsl(45 90% 66%)',  border:'hsl(160 12% 74%)', muted:'hsl(95 24% 95%)' },
  // Periwinkle / blue family
  'periwinkle':     { bg:'hsl(205 90% 94%)', card:'hsl(210 90% 82%)', primary:'hsl(236 45% 63%)', border:'hsl(205 70% 73%)', muted:'hsl(205 65% 92%)' },
  // Greens from mint to fern
  'fern-mint':      { bg:'hsl(150 60% 97%)', card:'hsl(120 55% 90%)', primary:'hsl(140 22% 41%)', border:'hsl(145 45% 76%)', muted:'hsl(150 45% 94%)' },
}

function Dots({ colors }: { colors: string[] }) {
  return (
    <div className="flex gap-2">
      {colors.map((c, i) => (
        <span key={i} className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c }} />
      ))}
    </div>
  )
}

function Preview({ t }: { t: (typeof THEMES)[number] }) {
  const tok = TOKENS[t]
  return (
    <div
      className="h-24 w-full rounded-xl relative overflow-hidden glass-surface"
      style={{ background: tok.card, borderColor: tok.border }}
    >
      <div
        className="absolute top-3 left-4 h-3/5 w-40 rounded-xl"
        style={{ background: tok.muted ?? tok.bg, opacity: 0.85 }}
      />
      <div className="absolute bottom-4 left-4">
        <Dots colors={META[t].dots} />
      </div>
      <div
        className="absolute top-4 right-4 w-7 h-7 rounded-md"
        style={{ background: tok.card, border: `1px solid ${tok.border}` }}
      />
    </div>
  )
}

type Theme = (typeof THEMES)[number];

export default function Themes() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'ink-sky' as Theme;
    const fromDom = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (fromDom && THEMES.includes(fromDom)) return fromDom;
    const saved = localStorage.getItem('sf-theme') as Theme | null;
    return (saved && THEMES.includes(saved)) ? saved : ('ink-sky' as Theme);
  });

  // Keep DOM + storage in sync when user changes theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sf-theme', theme);
  }, [theme]);

  const current = useMemo(() => META[theme], [theme])

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="glass-icon"><Palette size={18} /></div>
        <h1 className="text-2xl font-semibold">Theme Customization</h1>
      </div>

      {/* Current theme */}
      <div className="glass-card p-5">
        <div className="text-sm font-medium opacity-80 mb-3">Current Theme</div>
        <div className="grid md:grid-cols-[1fr_200px] items-center gap-4">
          <div className="rounded-xl p-3 glass-inner">
            <div className="font-semibold">{current.name}</div>
            <div className="text-sm opacity-70">{current.tag}</div>
          </div>
          <div className="flex items-center justify-end">
            <span className="px-2 py-1 rounded-md text-xs flex items-center gap-1 glass-chip">
              <Check size={14} /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Theme grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {THEMES.map(t => {
          const active = t === theme
          const meta = META[t]
          return (
            <div key={t} className={`glass-card p-4 ${active ? 'ring-2' : ''}`}>
              <Preview t={t} />
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{meta.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{meta.tag}</div>
                  </div>
                  {active && (
                    <span className="px-2 py-1 rounded-md text-xs flex items-center gap-1 glass-chip">
                      <Check size={14} /> Active
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Dots colors={meta.dots} />
                  <button className="btn-ghost" onClick={() => setTheme(t)}>Use Theme</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

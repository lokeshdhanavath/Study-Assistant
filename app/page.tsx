
'use client'

import Link from 'next/link'
import { BookOpen, Search, FileText, StickyNote, Timer, Palette } from 'lucide-react'

const FEATURES = [
  {
    title: 'AI Study Planner',
    desc: 'Generate personalized study schedules that adapt to your exam timeline and learning pace',
    href: '/study',
    Icon: BookOpen,
  },
  {
    title: 'Resource Discovery',
    desc: 'Discover relevant academic materials and study resources tailored to your subjects',
    href: '/resources',
    Icon: Search,
  },
  {
    title: 'Notes Analyzer',
    desc: 'Upload your notes and get in-depth and insightful summaries, auto-generated flashcards, and adaptive quizzes—built for active recall.',
    href: '/notes',
    Icon: StickyNote,
  },
  {
    title: 'Focus Timer',
    desc: 'Pomodoro technique with progress tracking and contribution visualization',
    href: '/timer',
    Icon: Timer,
  },
  {
    title: 'Beautiful Themes',
    desc: 'Carefully crafted themes with neumorphic design for comfortable studying',
    href: '/themes',
    Icon: Palette,
  },
]

export default function Home() {
  return (

    <div className="container mx-auto px-6 py-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-6xl font-extrabold mt-6 tracking-tight">StudyMate</h1>
        <p className="opacity-70 mt-3 text-lg">Minimal, fast, and thoughtfully designed AI study helper.</p>
      </div>
       <br/>
        
      <div className="home-grid">
        {FEATURES.map(({ title, desc, href, Icon }) => (
          <Link key={href} href={href} className="home-card" aria-label={title}>
            <div className="home-card__inner">
              <div className="home-card__icon"><Icon size={20} /></div>
              <div className="home-card__title">{title}</div>
              <div className="home-card__desc">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

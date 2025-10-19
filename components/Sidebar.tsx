'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  Search,
  FileText,
  StickyNote,
  Timer as TimerIcon,
  Palette,
  Flame
} from 'lucide-react';
import Image from 'next/image';

type Item = { href: string; label: string; icon: any };

const NAV: Item[] = [
  { href: '/',   label: 'Dashboard',  icon: LayoutGrid },
  { href: '/dashboard',   label: 'Daily Progress',  icon: Flame },
  { href: '/study',       label: 'Study Plan', icon: BookOpen   },
  { href: '/resources',   label: 'Resources',  icon: Search     },
  { href: '/notes',       label: 'Notes',      icon: StickyNote },
  { href: '/timer',       label: 'Timer',      icon: TimerIcon  },
  { href: '/themes',      label: 'Themes',     icon: Palette    },


];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-rail sticky top-0 min-h-dvh p-4 md:p-5">
      {/* floating glow */}
      <div className="sidebar-glow" aria-hidden />

      <Link href="/" className="flex items-center gap-3 px-3 py-2 mb-6 rounded-xl hover:opacity-95">
        <div className="glass-icon shrink-0">
          <Image
            src="/brand/studymate-logo.svg"
            alt="StudyMate"
            width={40}
            height={40}
            priority
          />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight">StudyMate</div>
          <div className="text-xs opacity-70">Your Personal AI Study Assistant</div>
        </div>
      </Link>
      <nav className="space-y-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="nav-pill group"
              data-active={active ? 'true' : 'false'}
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, BookOpen, Award, Clock } from 'lucide-react';
import { streakService } from '@/lib/streakService'; // ✅ ADDED

type Mode = 'focus' | 'short' | 'long';

const DUR = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export default function TimerPage() {
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(DUR.focus);
  const [running, setRunning] = useState(false);

  // stats
  const [sessions, setSessions] = useState(0);
  const [minutesFocused, setMinutesFocused] = useState(0);
  const [longBreaks, setLongBreaks] = useState(0);

  // restore
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sf.timer') || '{}');
      if (saved.mode) setMode(saved.mode);
      if (typeof saved.timeLeft === 'number') setTimeLeft(saved.timeLeft);
      if (typeof saved.sessions === 'number') setSessions(saved.sessions);
      if (typeof saved.minutesFocused === 'number') setMinutesFocused(saved.minutesFocused);
      if (typeof saved.longBreaks === 'number') setLongBreaks(saved.longBreaks);
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(
      'sf.timer',
      JSON.stringify({ mode, timeLeft, sessions, minutesFocused, longBreaks })
    );
  }, [mode, timeLeft, sessions, minutesFocused, longBreaks]);

  // ticking
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // handle transitions
  useEffect(() => {
    if (timeLeft >= 0) return;

    if (mode === 'focus') {
      setSessions(s => s + 1);
      setMinutesFocused(m => m + Math.round(DUR.focus / 60));

      // ✅ ADDED STREAK UPDATE - When focus session completes
      streakService.recordActivity('timer', DUR.focus / 60); // 25 minutes

      // every 4th focus session -> long break
      const nextIsLong = ( (sessions + 1) % 4 ) === 0;
      if (nextIsLong) {
        setMode('long');
        setTimeLeft(DUR.long);
        setLongBreaks(b => b + 1);
      } else {
        setMode('short');
        setTimeLeft(DUR.short);
      }
    } else {
      setMode('focus');
      setTimeLeft(DUR.focus);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const total = useMemo(() => DUR[mode], [mode]);
  const progress = 1 - timeLeft / total;
  const mins = Math.max(0, Math.floor(timeLeft / 60));
  const secs = Math.max(0, timeLeft % 60);

  const toggle = () => setRunning(r => !r);
  const reset = () => { setRunning(false); setMode('focus'); setTimeLeft(DUR.focus); };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-1">Focus Timer</h1>
      <p className="text-center opacity-70 mb-6">
        Use the Pomodoro technique to maximize your productivity
      </p>

      {/* main card */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-[var(--primary)]" />
          <div className="font-semibold">Focus Time</div>
          <div className="ml-auto">
            <div className="mini-toggle">
              <button
                data-active={mode === 'focus'}
                onClick={() => { setMode('focus'); setTimeLeft(DUR.focus); }}
                title="Focus"
              />
              <button
                data-active={mode === 'short'}
                onClick={() => { setMode('short'); setTimeLeft(DUR.short); }}
                title="Short Break"
              />
              <button
                data-active={mode === 'long'}
                onClick={() => { setMode('long'); setTimeLeft(DUR.long); }}
                title="Long Break"
              />
            </div>
          </div>
        </div>

        <div className="grid place-items-center my-6">
          <ProgressRing progress={progress} />
          <div className="text-5xl font-extrabold mt-6 tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="mt-2 text-sm opacity-70 capitalize">{mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}</div>

          <div className="mt-6 flex gap-3">
            <button className="btn" onClick={toggle}>
              {running ? <><Pause size={16} className="mr-2" />Pause</> : <><Play size={16} className="mr-2" />Start</>}
            </button>
            <button className="btn" onClick={reset}>
              <RotateCcw size={16} className="mr-2" />Reset
            </button>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<Award size={18} />}
          label="Sessions Today"
          value={sessions}
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Minutes Focused"
          value={minutesFocused}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Long Breaks Earned"
          value={longBreaks}
        />
      </div>

      {/* info blocks */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <div className="font-semibold mb-3">The Pomodoro Technique</div>
          <ul className="list-disc pl-5 space-y-1 opacity-80">
            <li>25 minutes of focused work</li>
            <li>5 minute short break</li>
            <li>15 minute long break every 4 sessions</li>
          </ul>
        </div>
        <div className="glass-card p-6">
          <div className="font-semibold mb-3">Benefits</div>
          <ul className="list-disc pl-5 space-y-1 opacity-80">
            <li>Improved focus and concentration</li>
            <li>Better time management</li>
            <li>Reduced mental fatigue</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="glass-icon">{icon}</div>
        <div className="text-sm opacity-75">{label}</div>
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 180;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, progress)) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="drop-shadow"
      viewBox="0 0 200 200"
      role="img"
      aria-label="time progress"
    >
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="14"
      />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 100 100)"
      />
    </svg>
  );
}
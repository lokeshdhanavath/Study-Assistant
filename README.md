<p align="center">
  <img src="public/brand/studymate-logo.svg" alt="StudyMate logo" width="96" height="96">
</p>

<h1 align="center">StudyMate</h1>
<p align="center">
  Your personal AI study assistant. Plan smarter, learn faster.
</p>

<p align="center">
  <a href="https://nextjs.org">Next.js</a> ·
  <a href="https://www.typescriptlang.org/">TypeScript</a> ·
  <a href="https://tailwindcss.com/">Tailwind CSS</a> ·
  <a href="#">MIT License</a>
</p>

---

## ✨ What it does

- **AI Study Planner**

  - Generates day-by-day plans from _today → exam date_ (always date-aware).
  - Topic-specific tasks (e.g., “DSA”, “Electrochemistry”) regardless of time window.
  - Save/restore plans locally for quick access.

- **Resource Discovery (real links only)**

  - Web search via Brave Search API + lightweight validation (no dead URLs).
  - Blends courses, docs, videos, tutorials; optional category filter.
  - Optional OpenAI pass to enrich results (types, difficulty, tags).

- **Notes Analyzer**

  - Deep, structured summary that keeps key details.
  - **Flashcards**: front-only question → click to flip with a smooth 3D animation.
  - **Quiz**: randomized choices, tracks score, shows _green_ for correct, _red_ for chosen wrong, and adds a one-line AI explanation.

- **Focus Timer (Pomodoro)**

  - Minimal, glassy UI with sessions, minutes focused, and long-break counters.

- **Themes**

  - Six elegant themes (Cloud Gray + 5 curated colorways), theme tokens via CSS variables.
  - Persisted in `localStorage` and applied across the app.
  - Apple/Tesla-style “glass” components and themed sidebar pills.

- **Branding**
  - Custom logo + favicon wired through `app/icon.tsx` and `app/manifest.ts`.

---

## 🧩 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS, custom “glass” primitives
- **Icons**: lucide-react
- **Toasts**: sonner
- **AI**: OpenAI (configurable model), optional classification pass for resources
- **Search**: Brave Search API for reliable links

---

## 📸 Screens

Place screenshots in `public/screens/` and reference here:

- Study Planner
- Resources
- Notes → Summary/Flashcards/Quiz
- Focus Timer
- Themes

---

## 📽️ Demo


<video src='StudyMate Demo.mp4' width=180/>


---

## 🚀 Getting Started

### 1) Requirements

- Node.js **18+** (or 20+)
- npm / pnpm / yarn

### 2) Install

```bash
npm i
# or
pnpm i
```

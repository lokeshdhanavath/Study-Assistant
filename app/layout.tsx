
import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export const metadata: Metadata = { title: 'StudyMate', description: 'Clean AI study helper',  icons: { icon: '/brand/studymate-logo.svg' }}
const themeInit = `
    (function () {
      try {
        var t = localStorage.getItem('sf-theme') || 'ink-sky';
        document.documentElement.setAttribute('data-theme', t);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'ink-sky');
      }
    })();
`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
     <head>
        {/* Apply saved theme ASAP to avoid flash of default theme */}
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>

      <body>
        <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
          <Sidebar />

          {/* Make the main column a flex-col so footer sticks to bottom */}
          <div className="min-h-screen flex flex-col">
            <Topbar />

            {/* page content */}
            <div className="container mx-auto px-6 py-6 flex-1">
              {children}
            </div>

            {/* footer */}
            <footer className="mt-auto border-t border-border/60">
              <div className="container mx-auto px-6 py-4 text-xs opacity-70">
                © 2025 <span className="font-semibold">StudyMate</span>. Designed and Programmed by Harsh Patel.
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
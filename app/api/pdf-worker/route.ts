import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
export async function GET(){
  // Serve the minified pdf.js worker as plain JS from node_modules to avoid bundler transforms.
  const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.min.js')
  const code = await fs.readFile(workerPath, 'utf-8')
  return new NextResponse(code, { headers: { 'content-type':'application/javascript' } })
}

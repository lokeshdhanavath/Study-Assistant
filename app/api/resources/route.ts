import { NextResponse } from 'next/server'
import { aiResources } from '@/lib/openai'
export async function POST(req:Request){
  const { query, category } = await req.json()
  try{
    const data = await aiResources(query, category)
    const ranked = (data.resources||[]).sort((a:any,b:any)=> ((b.is_free?1:.5)*(b.rating||3))-((a.is_free?1:.5)*(a.rating||3)) )
    return NextResponse.json({ ...data, resources: ranked.slice(0,20) })
  }catch(e:any){
    console.error('API error', e); return NextResponse.json({ _fallback: true })
  }
}

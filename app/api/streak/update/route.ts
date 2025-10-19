import { NextRequest, NextResponse } from 'next/server';
import { trackDailyProgress } from '@/lib/progressService';

export async function POST(request: NextRequest) {
  try {
    const { userId, activity } = await request.json();
    
    const progress = await trackDailyProgress(userId, activity);
    
    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}
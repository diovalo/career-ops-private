import { NextResponse } from 'next/server';
import { getFileOrNull } from '@/lib/github';
import { AppContextMap } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getFileOrNull('data/app-context.json');
    if (!result) return NextResponse.json({});
    const map = JSON.parse(result.content) as AppContextMap;
    return NextResponse.json(map);
  } catch (error) {
    console.error('Failed to load context map:', error);
    return NextResponse.json({}, { status: 500 });
  }
}

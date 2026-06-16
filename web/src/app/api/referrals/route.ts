import { NextResponse } from 'next/server';
import { getFileOrNull } from '@/lib/github';
import { Referrer } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getFileOrNull('data/referrals.json');
    if (!result) return NextResponse.json([]);
    const referrers = JSON.parse(result.content) as Referrer[];
    return NextResponse.json(referrers);
  } catch (error) {
    console.error('Failed to load referrals:', error);
    return NextResponse.json([], { status: 500 });
  }
}

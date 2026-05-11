import { NextRequest, NextResponse } from 'next/server';
import { getInsight, setInsight } from '@/lib/kv';
import { Insight } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    const insight = await getInsight(appId);

    if (!insight) {
      return NextResponse.json({ text: '', updatedAt: new Date().toISOString() });
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error('Failed to fetch insight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insight' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    const body = await request.json() as Partial<Insight>;

    const insight: Insight = {
      text: body.text || '',
      applyAngle: body.applyAngle,
      updatedAt: new Date().toISOString(),
    };

    await setInsight(appId, insight);

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('Failed to save insight:', error);
    return NextResponse.json(
      { error: 'Failed to save insight' },
      { status: 500 }
    );
  }
}

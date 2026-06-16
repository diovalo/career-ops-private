import { NextResponse } from 'next/server';
import { getFileOrNull, putFile } from '@/lib/github';
import { Referrer } from '@/lib/types';

export const dynamic = 'force-dynamic';

const REFERRALS_PATH = 'data/referrals.json';

async function loadReferrals(): Promise<{ list: Referrer[]; sha: string }> {
  const result = await getFileOrNull(REFERRALS_PATH);
  if (!result) return { list: [], sha: '' };
  try {
    return { list: JSON.parse(result.content) as Referrer[], sha: result.sha };
  } catch {
    return { list: [], sha: result.sha };
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = (await req.json()) as Partial<Referrer>;
    const { list, sha } = await loadReferrals();

    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    list[idx] = { ...list[idx], ...body, updatedAt: new Date().toISOString().slice(0, 10) };

    await putFile(
      REFERRALS_PATH,
      JSON.stringify(list, null, 2),
      sha,
      `dashboard: update referral for ${list[idx].name}`
    );

    return NextResponse.json(list[idx]);
  } catch (error) {
    console.error('Failed to update referral:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}

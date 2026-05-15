import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { secret } = (await req.json()) as { secret?: string };

  if (!process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: 'DASHBOARD_SECRET not configured' }, { status: 500 });
  }

  if (secret !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('dashboard_auth', process.env.DASHBOARD_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

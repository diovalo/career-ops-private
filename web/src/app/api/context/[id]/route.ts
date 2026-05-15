import { NextResponse } from 'next/server';
import { getFileOrNull, putFile } from '@/lib/github';
import { AppContext, AppContextMap } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CONTEXT_PATH = 'data/app-context.json';

async function loadContextMap(): Promise<{ map: AppContextMap; sha: string }> {
  const result = await getFileOrNull(CONTEXT_PATH);
  if (!result) return { map: {}, sha: '' };
  try {
    return { map: JSON.parse(result.content) as AppContextMap, sha: result.sha };
  } catch {
    return { map: {}, sha: result.sha };
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { map } = await loadContextMap();
    return NextResponse.json(map[id] ?? {});
  } catch (error) {
    console.error('Failed to load context:', error);
    return NextResponse.json({ error: 'Failed to load context' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = (await req.json()) as Partial<AppContext>;
    const { map, sha } = await loadContextMap();

    const existing = map[id] ?? { updatedAt: '' };
    map[id] = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await putFile(
      CONTEXT_PATH,
      JSON.stringify(map, null, 2),
      sha,
      `dashboard: update context for #${id}`
    );

    return NextResponse.json(map[id]);
  } catch (error) {
    console.error('Failed to update context:', error);
    return NextResponse.json({ error: 'Failed to update context' }, { status: 500 });
  }
}

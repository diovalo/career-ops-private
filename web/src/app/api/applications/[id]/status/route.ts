import { NextRequest, NextResponse } from 'next/server';
import { getFile, putFile } from '@/lib/github';
import { replaceStatusInLine, normalizeStatus } from '@/lib/parser';
import { Status, StatusColors } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appId = parseInt(id, 10);
    const body = await request.json() as { status: string };

    const newStatus = normalizeStatus(body.status) as Status;

    // Validate status
    if (!Object.keys(StatusColors).includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current file + SHA
    const { content, sha } = await getFile('data/applications.md');

    // Replace status in the file
    const updated = replaceStatusInLine(content, appId, newStatus);

    // Write back to GitHub
    await putFile(
      'data/applications.md',
      updated,
      sha,
      `dashboard: update #${appId} status to ${newStatus}`
    );

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

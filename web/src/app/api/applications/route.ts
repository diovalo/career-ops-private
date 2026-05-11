import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/github';
import { parseApplications } from '@/lib/parser';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { content } = await getFile('data/applications.md');
    const applications = parseApplications(content);

    return NextResponse.json(applications, {
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

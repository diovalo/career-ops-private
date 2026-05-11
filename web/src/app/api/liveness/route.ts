import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // Try to fetch the URL with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      // 404 or 410 = dead link (red)
      if (response.status === 404 || response.status === 410) {
        return NextResponse.json({ status: 'dead' });
      }

      // 200-299 = likely alive (green)
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({ status: 'live' });
      }

      // Other 4xx/5xx = uncertain (yellow)
      if (response.status >= 400) {
        return NextResponse.json({ status: 'uncertain' });
      }

      return NextResponse.json({ status: 'live' });
    } catch (fetchError) {
      clearTimeout(timeout);
      // Timeout or network error = uncertain
      return NextResponse.json({ status: 'uncertain' });
    }
  } catch (error) {
    console.error('Liveness check error:', error);
    return NextResponse.json({ status: 'uncertain' });
  }
}

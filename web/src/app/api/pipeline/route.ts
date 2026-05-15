import { NextResponse } from 'next/server';
import { getFileOrNull, putFile } from '@/lib/github';

export const dynamic = 'force-dynamic';

const PIPELINE_PATH = 'data/pipeline.md';
const PIPELINE_HEADER = '# Pipeline\n\nInbox of pending URLs to evaluate.\n\n';

interface AddCompanyBody {
  company: string;
  role: string;
  careerUrl?: string;
  jdUrl?: string;
  jdText?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddCompanyBody;
    const { company, role, careerUrl, jdUrl, jdText } = body;

    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
    }

    const result = await getFileOrNull(PIPELINE_PATH);
    const existing = result?.content ?? PIPELINE_HEADER;
    const sha = result?.sha ?? '';

    const date = new Date().toISOString().slice(0, 10);
    const url = jdUrl || careerUrl || '';
    const jdNote = jdText ? ` [JD pasted]` : '';
    const newEntry = `- [ ] ${company} — ${role} | ${url}${jdNote} (added ${date})\n`;

    const updated = existing.trimEnd() + '\n' + newEntry;

    await putFile(
      PIPELINE_PATH,
      updated,
      sha,
      `dashboard: add ${company} (${role}) to pipeline`
    );

    // If JD text was provided, save it as a separate file
    if (jdText?.trim()) {
      const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const jdPath = `data/jds/${slug}-${date}.txt`;
      // File won't exist yet, so sha is empty
      await putFile(jdPath, jdText.trim(), '', `dashboard: save JD for ${company}`);
    }

    return NextResponse.json({ ok: true, company, role }, { status: 201 });
  } catch (error) {
    console.error('Failed to add to pipeline:', error);
    return NextResponse.json({ error: 'Failed to add to pipeline' }, { status: 500 });
  }
}

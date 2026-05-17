import { NextResponse } from 'next/server';
import { getFileOrNull, putFile } from '@/lib/github';

export const dynamic = 'force-dynamic';

const PIPELINE_PATH = 'data/pipeline.md';
const PORTALS_PATH = 'portals.yml';
const PIPELINE_HEADER = '# Pipeline\n\nInbox of pending URLs to evaluate.\n\n';

interface AddCompanyBody {
  company: string;
  role: string;
  careerUrl?: string;
  jdUrl?: string;
  jdText?: string;
  monitor?: boolean;
  atsType?: 'greenhouse' | 'ashby' | 'lever' | 'other';
}

function buildPortalsEntry(company: string, careerUrl: string, atsType: string, date: string): string {
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let entry = `\n  - name: ${company}\n    careers_url: ${careerUrl}\n`;

  if (atsType === 'greenhouse') {
    // Try to extract slug from URL like job-boards.greenhouse.io/{slug}
    const match = careerUrl.match(/greenhouse\.io\/([^/?#]+)/);
    const ghSlug = match ? match[1] : slug;
    entry += `    api: https://boards-api.greenhouse.io/v1/boards/${ghSlug}/jobs\n`;
  } else if (atsType === 'ashby') {
    entry += `    scan_method: websearch\n`;
    entry += `    scan_query: 'site:jobs.ashbyhq.com/${slug}'\n`;
  } else if (atsType === 'lever') {
    entry += `    scan_method: websearch\n`;
    entry += `    scan_query: 'site:jobs.lever.co/${slug}'\n`;
  } else {
    entry += `    scan_method: websearch\n`;
    entry += `    scan_query: '"${company}" careers jobs engineer intern werkstudent site:${careerUrl.replace(/https?:\/\//, '').split('/')[0]}'\n`;
  }

  entry += `    notes: "Added from dashboard ${date}."\n`;
  entry += `    enabled: true\n`;
  return entry;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddCompanyBody;
    const { company, role, careerUrl, jdUrl, jdText, monitor, atsType } = body;

    if (!company?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
    }

    const date = new Date().toISOString().slice(0, 10);
    const url = jdUrl || careerUrl || '';
    const jdNote = jdText ? ` [JD pasted]` : '';
    const newEntry = `- [ ] ${company} — ${role} | ${url}${jdNote} (added ${date})\n`;

    // Write to pipeline.md
    const pipelineResult = await getFileOrNull(PIPELINE_PATH);
    const existing = pipelineResult?.content ?? PIPELINE_HEADER;
    const pipelineSha = pipelineResult?.sha ?? '';
    await putFile(
      PIPELINE_PATH,
      existing.trimEnd() + '\n' + newEntry,
      pipelineSha,
      `dashboard: add ${company} (${role}) to pipeline`
    );

    // Save JD text if provided
    if (jdText?.trim()) {
      const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await putFile(`data/jds/${slug}-${date}.txt`, jdText.trim(), '', `dashboard: save JD for ${company}`);
    }

    // Append to portals.yml if monitoring requested
    if (monitor && careerUrl?.trim()) {
      const portalsResult = await getFileOrNull(PORTALS_PATH);
      if (portalsResult) {
        const entry = buildPortalsEntry(company, careerUrl.trim(), atsType ?? 'other', date);
        const updatedPortals = portalsResult.content.trimEnd() + entry;
        await putFile(
          PORTALS_PATH,
          updatedPortals,
          portalsResult.sha,
          `dashboard: add ${company} to portals for monitoring`
        );
      }
    }

    return NextResponse.json({ ok: true, company, role, monitored: !!(monitor && careerUrl) }, { status: 201 });
  } catch (error) {
    console.error('Failed to add to pipeline:', error);
    return NextResponse.json({ error: 'Failed to add to pipeline' }, { status: 500 });
  }
}

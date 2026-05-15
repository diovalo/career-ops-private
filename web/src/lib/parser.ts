import { Application, Status } from './types';

const reReportLink = /\[(\d+)\]\(([^)]+)\)/;
const reScoreValue = /(\d+\.?\d*)\/5/;

export function parseApplications(content: string): Application[] {
  const lines = content.split('\n');
  const apps: Application[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip header lines, separators, column headers
    if (
      !trimmed ||
      trimmed.startsWith('# ') ||
      trimmed.startsWith('|---') ||
      trimmed.startsWith('| #')
    ) {
      continue;
    }

    // Must be a pipe-delimited row
    if (!trimmed.startsWith('|')) {
      continue;
    }

    // Split by pipes and clean up
    const fields = trimmed
      .split('|')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Need at least 8 fields: # | Date | Company | Role | Score | Status | PDF | Report | Notes
    if (fields.length < 8) {
      continue;
    }

    try {
      const num = parseInt(fields[0], 10);
      const date = fields[1];
      const company = fields[2];
      const role = fields[3];

      // Extract numeric score from "4.5/5"
      const scoreMatch = fields[4].match(reScoreValue);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

      const status = normalizeStatus(fields[5]);
      const pdf = fields[6];

      // Report link: extract from "[011](reports/...)"
      const reportLink = fields[7];
      const reportMatch = reportLink.match(reReportLink);
      const report = reportMatch ? `[${reportMatch[1]}](${reportMatch[2]})` : reportLink;

      const notes = fields[8] || '';
      const cvMatch = notes.match(/cover-[\w-]+\.pdf/);
      const cvFile = cvMatch ? cvMatch[0] : undefined;

      apps.push({
        num,
        date,
        company,
        role,
        score,
        status,
        pdf,
        report,
        notes,
        cvFile,
      });
    } catch {
      // Silently skip malformed rows
      continue;
    }
  }

  return apps;
}

export function normalizeStatus(status: string): Status {
  const s = status.trim().toLowerCase();
  const map: Record<string, Status> = {
    evaluated: 'Evaluated',
    applied: 'Applied',
    responded: 'Responded',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    discarded: 'Discarded',
    skip: 'SKIP',
  };
  return map[s] || ('Evaluated' as Status);
}

/**
 * Find and replace status in a specific row of applications.md
 * Preserves formatting and other fields exactly
 */
export function replaceStatusInLine(
  content: string,
  appNumber: number,
  newStatus: Status
): string {
  const lines = content.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip non-data lines
    if (
      !trimmed ||
      trimmed.startsWith('# ') ||
      trimmed.startsWith('|---') ||
      trimmed.startsWith('| #') ||
      !trimmed.startsWith('|')
    ) {
      result.push(line);
      continue;
    }

    // Parse this row
    const fields = trimmed
      .split('|')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (fields.length < 6) {
      result.push(line);
      continue;
    }

    const num = parseInt(fields[0], 10);

    if (num === appNumber) {
      // Replace status (field 5, 0-indexed)
      fields[5] = newStatus;
      // Reconstruct the row
      const newLine = '| ' + fields.join(' | ') + ' |';
      result.push(newLine);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

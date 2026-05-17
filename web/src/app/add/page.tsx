'use client';

import { useState } from 'react';

export default function AddCompanyPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [careerUrl, setCareerUrl] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [monitor, setMonitor] = useState(false);
  const [atsType, setAtsType] = useState<'greenhouse' | 'ashby' | 'lever' | 'other'>('other');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; company?: string; monitored?: boolean } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, careerUrl, jdUrl, jdText, monitor, atsType }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; company: string; monitored: boolean };
        setResult(data);
        setCompany(''); setRole(''); setCareerUrl('');
        setJdUrl(''); setJdText(''); setMonitor(false);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to add company');
      }
    } catch {
      setError('Network error — check your connection');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-6 md:max-w-lg">
      <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-flex items-center gap-1">
        ← Dashboard
      </a>

      <h1 className="text-2xl font-bold text-white mt-4 mb-2">Add Company</h1>
      <p className="text-gray-500 text-sm mb-6">
        Saves to <code className="text-gray-400">data/pipeline.md</code>. Run{' '}
        <code className="text-gray-400">git pull</code> then{' '}
        <code className="text-gray-400">/career-ops pipeline</code> to evaluate.
      </p>

      {result?.ok && (
        <div className="mb-6 p-4 bg-green-950 border border-green-800 rounded-lg text-green-300 text-sm">
          <p className="font-semibold">Added {result.company} to pipeline ✓</p>
          {result.monitored && (
            <p className="text-green-500 mt-0.5">Also added to portals.yml for ongoing monitoring ✓</p>
          )}
          <p className="mt-1 text-green-500">
            Run <code>git pull</code> then <code>/career-ops pipeline</code> to evaluate.
          </p>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-green-600 hover:text-green-400">
            Add another →
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Company name <span className="text-red-500">*</span></label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Infineon" required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Role <span className="text-red-500">*</span></label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Working Student Software Development" required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Career page URL</label>
          <input type="url" value={careerUrl} onChange={(e) => setCareerUrl(e.target.value)}
            placeholder="https://company.com/careers"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Job posting URL</label>
          <input type="url" value={jdUrl} onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://company.com/jobs/12345"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Job description text <span className="text-gray-600">(paste to save for CLI evaluation)</span>
          </label>
          <textarea value={jdText} onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..." rows={5}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none" />
        </div>

        {/* Monitor toggle */}
        <div className="bg-[#161b22] border border-gray-800 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={monitor}
              onChange={(e) => setMonitor(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-gray-200">Monitor for future postings</span>
              <p className="text-xs text-gray-500 mt-0.5">
                Adds this company to <code>portals.yml</code> so{' '}
                <code>/career-ops scan</code> checks it automatically
              </p>
            </div>
          </label>

          {monitor && (
            <div className="mt-3 ml-8">
              <label className="block text-xs text-gray-500 mb-1">ATS platform</label>
              <select
                value={atsType}
                onChange={(e) => setAtsType(e.target.value as typeof atsType)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="greenhouse">Greenhouse (job-boards.greenhouse.io)</option>
                <option value="ashby">Ashby (jobs.ashbyhq.com)</option>
                <option value="lever">Lever (jobs.lever.co)</option>
                <option value="other">Other / Unknown</option>
              </select>
              {!careerUrl && (
                <p className="text-xs text-orange-400 mt-1">⚠ Fill in the career page URL above to enable monitoring</p>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !company.trim() || !role.trim()}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold transition text-base"
        >
          {submitting ? 'Adding...' : 'Add to Pipeline'}
        </button>
      </form>
    </div>
  );
}

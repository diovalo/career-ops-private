'use client';

import { useState } from 'react';

export default function AddCompanyPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [careerUrl, setCareerUrl] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; company?: string } | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, careerUrl, jdUrl, jdText }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; company: string };
        setResult(data);
        setCompany('');
        setRole('');
        setCareerUrl('');
        setJdUrl('');
        setJdText('');
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
    <div className="p-6 max-w-lg">
      <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-flex items-center gap-1">
        ← Dashboard
      </a>

      <h1 className="text-2xl font-bold text-white mt-4 mb-2">Add Company</h1>
      <p className="text-gray-500 text-sm mb-6">
        Saves to <code className="text-gray-400">data/pipeline.md</code> on GitHub. Run{' '}
        <code className="text-gray-400">git pull</code> then{' '}
        <code className="text-gray-400">/career-ops pipeline</code> to evaluate.
      </p>

      {result?.ok && (
        <div className="mb-6 p-4 bg-green-950 border border-green-800 rounded-lg text-green-300 text-sm">
          <p className="font-semibold">Added {result.company} to pipeline ✓</p>
          <p className="mt-1 text-green-500">
            Run <code>git pull</code> then <code>/career-ops pipeline</code> to evaluate.
          </p>
          <button
            onClick={() => setResult(null)}
            className="mt-2 text-xs text-green-600 hover:text-green-400"
          >
            Add another →
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Celonis"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Backend Engineer (Werkstudent)"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Career page URL</label>
          <input
            type="url"
            value={careerUrl}
            onChange={(e) => setCareerUrl(e.target.value)}
            placeholder="https://company.com/careers"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Job posting URL (direct link)</label>
          <input
            type="url"
            value={jdUrl}
            onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://company.com/jobs/12345"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Job description text{' '}
            <span className="text-gray-600">(paste if you have it — saved for CLI evaluation)</span>
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={6}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
          />
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

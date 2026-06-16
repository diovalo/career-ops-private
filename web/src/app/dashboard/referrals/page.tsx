'use client';

import { useEffect, useState } from 'react';
import { Referrer } from '@/lib/types';

const STATUS_LABEL: Record<Referrer['status'], string> = {
  done: 'Done',
  in_progress: 'In Progress',
  yet_to_contact: 'Yet to Contact',
};

const STATUS_BADGE: Record<Referrer['status'], string> = {
  done: 'bg-green-900/50 text-green-400 border border-green-700',
  in_progress: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  yet_to_contact: 'bg-gray-800 text-gray-500 border border-gray-700',
};

const STATUS_CYCLE: Record<Referrer['status'], Referrer['status']> = {
  yet_to_contact: 'in_progress',
  in_progress: 'done',
  done: 'yet_to_contact',
};

const STATUS_ORDER: Referrer['status'][] = ['in_progress', 'yet_to_contact', 'done'];

export default function ReferralsPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Referrer['status'] | null>(null);

  useEffect(() => {
    fetch('/api/referrals')
      .then((r) => r.json())
      .then((data: Referrer[]) => {
        setReferrers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function cycleStatus(id: string, current: Referrer['status']) {
    const next = STATUS_CYCLE[current];
    setSaving(id);
    setReferrers((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: next } : x))
    );
    try {
      await fetch(`/api/referrals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      setReferrers((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: current } : x))
      );
    } finally {
      setSaving(null);
    }
  }

  function toggleFilter(status: Referrer['status']) {
    setActiveFilter((prev) => (prev === status ? null : status));
  }

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  const done = referrers.filter((r) => r.status === 'done').length;
  const inProgress = referrers.filter((r) => r.status === 'in_progress').length;
  const yetToContact = referrers.filter((r) => r.status === 'yet_to_contact').length;

  const visible = (activeFilter ? referrers.filter((r) => r.status === activeFilter) : referrers)
    .slice()
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-1">Referrals</h1>
        <p className="text-sm text-gray-500">Click a filter to show only that group. Click a status badge on a card to advance it.</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => toggleFilter('done')}
          className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer select-none ${
            activeFilter === 'done'
              ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40'
              : 'bg-green-900/30 border-green-800 text-green-400 hover:bg-green-900/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          {done} Done
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('in_progress')}
          className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer select-none ${
            activeFilter === 'in_progress'
              ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-900/40'
              : 'bg-yellow-900/30 border-yellow-800 text-yellow-400 hover:bg-yellow-900/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
          {inProgress} In Progress
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('yet_to_contact')}
          className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer select-none ${
            activeFilter === 'yet_to_contact'
              ? 'bg-gray-600 border-gray-400 text-white shadow-lg shadow-gray-900/40'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
          {yetToContact} Yet to Contact
        </button>

        {activeFilter && (
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className="relative z-10 px-3 py-1.5 rounded-full border border-gray-700 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all cursor-pointer select-none"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {visible.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-gray-800 bg-[#161b22] p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-gray-100">{r.name}</span>
              <button
                type="button"
                onClick={() => cycleStatus(r.id, r.status)}
                disabled={saving === r.id}
                title="Click to advance status"
                className={`relative z-10 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer disabled:opacity-50 transition-all select-none ${STATUS_BADGE[r.status]}`}
              >
                {saving === r.id ? '...' : STATUS_LABEL[r.status]}
              </button>
            </div>

            {r.companies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {r.companies.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-700">No companies listed</span>
            )}

            {r.outcome && (
              <p className="text-xs text-gray-400 leading-relaxed">{r.outcome}</p>
            )}

            {r.notes && (
              <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-800 pt-2 mt-1">
                {r.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

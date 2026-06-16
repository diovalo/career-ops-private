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

const STATUS_ORDER: Referrer['status'][] = ['in_progress', 'yet_to_contact', 'done'];

export default function ReferralsPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referrals')
      .then((r) => r.json())
      .then((data: Referrer[]) => {
        setReferrers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  const done = referrers.filter((r) => r.status === 'done').length;
  const inProgress = referrers.filter((r) => r.status === 'in_progress').length;
  const yetToContact = referrers.filter((r) => r.status === 'yet_to_contact').length;

  const sorted = [...referrers].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Referrals</h1>
        <p className="text-sm text-gray-500">Network contacts who can provide referrals</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/40 border border-green-800">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-green-400 font-medium">{done} Done</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-900/40 border border-yellow-800">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-sm text-yellow-400 font-medium">{inProgress} In Progress</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          <span className="text-sm text-gray-500 font-medium">{yetToContact} Yet to Contact</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-gray-800 bg-[#161b22] p-4 flex flex-col gap-2"
          >
            {/* Name + badge */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-gray-100">{r.name}</span>
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>

            {/* Company chips */}
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

            {/* Outcome */}
            {r.outcome && (
              <p className="text-xs text-gray-400 leading-relaxed">{r.outcome}</p>
            )}

            {/* Notes */}
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

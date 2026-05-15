'use client';

import { useEffect, useState } from 'react';
import { Application, Status } from '@/lib/types';

const COLUMNS: Status[] = ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected'];

const COLUMN_COLORS: Record<string, string> = {
  Evaluated: 'border-blue-800',
  Applied: 'border-purple-800',
  Responded: 'border-teal-800',
  Interview: 'border-orange-800',
  Offer: 'border-green-800',
  Rejected: 'border-red-900',
};

const HEADER_COLORS: Record<string, string> = {
  Evaluated: 'text-blue-400',
  Applied: 'text-purple-400',
  Responded: 'text-teal-400',
  Interview: 'text-orange-400',
  Offer: 'text-green-400',
  Rejected: 'text-red-400',
};

export default function PipelinePage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data: Application[]) => {
        setApps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  const grouped: Record<string, Application[]> = {};
  for (const col of COLUMNS) grouped[col] = [];
  // Discarded and SKIP go into Rejected column visually
  const discardedSkip: Application[] = [];

  for (const app of apps) {
    if (COLUMNS.includes(app.status as Status)) {
      grouped[app.status].push(app);
    } else if (app.status === 'Discarded' || app.status === 'SKIP') {
      discardedSkip.push(app);
    }
  }
  grouped['Rejected'].push(...discardedSkip);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <a
          href="/dashboard"
          className="text-sm px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          Table view
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = grouped[col];
          return (
            <div
              key={col}
              className={`flex-shrink-0 w-52 rounded-lg border ${COLUMN_COLORS[col]} bg-[#161b22]`}
            >
              <div className="px-3 py-2.5 border-b border-gray-800">
                <span className={`text-sm font-semibold ${HEADER_COLORS[col]}`}>{col}</span>
                <span className="ml-2 text-xs text-gray-600">({cards.length})</span>
              </div>
              <div className="p-2 space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto">
                {cards.map((app) => (
                  <a
                    key={app.num}
                    href={`/applications/${app.num}`}
                    className="block p-2.5 rounded bg-gray-800/60 hover:bg-gray-700/60 transition border border-gray-700/50"
                  >
                    <p className="text-sm font-medium text-gray-200 truncate">{app.company}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{app.role}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-blue-400 font-semibold">{app.score.toFixed(1)}</span>
                      <span className="text-xs text-gray-600">{app.date.slice(5)}</span>
                    </div>
                  </a>
                ))}
                {cards.length === 0 && (
                  <p className="text-xs text-gray-700 text-center py-4">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

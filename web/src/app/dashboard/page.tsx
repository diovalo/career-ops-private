'use client';

import { useEffect, useState } from 'react';
import { Application, AppContextMap } from '@/lib/types';
import ApplicationTable from '@/components/ApplicationTable';

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [contextMap, setContextMap] = useState<AppContextMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [appsRes, ctxRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/context'),
      ]);
      if (!appsRes.ok) throw new Error('Failed to fetch applications');
      const data = await appsRes.json() as Application[];
      setApps(data);
      const ctx = ctxRes.ok ? await ctxRes.json() as AppContextMap : {};
      setContextMap(ctx);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-6">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300">
          Error: {error}
        </div>
      </div>
    );
  }

  const total = apps.length;
  const responded = apps.filter((a) => ['Responded', 'Interview', 'Offer'].includes(a.status)).length;
  const interview = apps.filter((a) => ['Interview', 'Offer'].includes(a.status)).length;
  const applied = apps.filter((a) => a.status !== 'Evaluated' && a.status !== 'SKIP' && a.status !== 'Discarded').length;
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;
  const interviewRate = applied > 0 ? Math.round((interview / applied) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const overdueFollowUps = Object.entries(contextMap).filter(
    ([, ctx]) => ctx.followUpDate && ctx.followUpDate <= today
  );

  return (
    <div className="p-4 md:p-8">
      {/* Follow-up banner */}
      {overdueFollowUps.length > 0 && (
        <div className="mb-6 px-4 py-3 bg-orange-950 border border-orange-800 rounded-lg flex items-center gap-3">
          <span className="text-orange-400 text-lg">⏰</span>
          <div>
            <span className="text-orange-300 text-sm font-semibold">
              {overdueFollowUps.length} follow-up{overdueFollowUps.length > 1 ? 's' : ''} overdue
            </span>
            <span className="text-orange-500 text-sm ml-2">
              {overdueFollowUps
                .slice(0, 3)
                .map(([id]) => {
                  const app = apps.find((a) => a.num === parseInt(id, 10));
                  return app?.company ?? `#${id}`;
                })
                .join(', ')}
              {overdueFollowUps.length > 3 ? ` +${overdueFollowUps.length - 3} more` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Header + stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tracker</h1>
          <a
            href="/dashboard/pipeline"
            className="text-sm px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition shrink-0"
          >
            Pipeline view
          </a>
        </div>

        {/* Stats row — wraps on mobile */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div>
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-gray-500 text-sm ml-2">total</span>
          </div>
          <div className="border-l border-gray-800 pl-4">
            <span className="text-2xl font-bold text-teal-400">{responseRate}%</span>
            <span className="text-gray-500 text-sm ml-2">response rate</span>
          </div>
          <div className="border-l border-gray-800 pl-4">
            <span className="text-2xl font-bold text-orange-400">{interviewRate}%</span>
            <span className="text-gray-500 text-sm ml-2">interview rate</span>
          </div>
        </div>
      </div>

      <ApplicationTable applications={apps} contextMap={contextMap} onStatusChange={fetchData} />
    </div>
  );
}

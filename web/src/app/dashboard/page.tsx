'use client';

import { useEffect, useState } from 'react';
import { Application } from '@/lib/types';
import ApplicationTable from '@/components/ApplicationTable';

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApps(data);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
        <p className="text-gray-600 mt-2">{apps.length} applications</p>
      </div>

      <ApplicationTable applications={apps} onStatusChange={fetchApplications} />
    </div>
  );
}

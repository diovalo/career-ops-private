'use client';

import { useState, useRef, useEffect } from 'react';
import { Application, AppContextMap, Status } from '@/lib/types';

interface Props {
  applications: Application[];
  contextMap?: AppContextMap;
  onStatusChange: () => void;
}

function NotePopover({
  appId,
  initialNote,
  onClose,
}: {
  appId: number;
  initialNote: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/context/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: note }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-72 max-w-[calc(100vw-2rem)] bg-[#1c2333] border border-gray-700 rounded-lg shadow-xl p-3"
    >
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={save}
        autoFocus
        rows={4}
        placeholder="Quick note..."
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-600">{saving ? 'Saving...' : 'Autosaves on blur'}</span>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300">Done</button>
      </div>
    </div>
  );
}

export default function ApplicationTable({ applications, contextMap = {}, onStatusChange }: Props) {
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'company'>('score');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [openNoteId, setOpenNoteId] = useState<number | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  let filtered = applications;
  if (filter !== 'All') filtered = filtered.filter((app) => app.status === filter);
  if (search) {
    filtered = filtered.filter(
      (app) =>
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase())
    );
  }
  filtered.sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'date') return b.date.localeCompare(a.date);
    return a.company.localeCompare(b.company);
  });

  async function handleStatusChange(appId: number, newStatus: Status) {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onStatusChange();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  const statuses: Status[] = ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded', 'SKIP'];

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'company')}
            className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Score</option>
            <option value="date">Date</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      {/* Mobile: card view */}
      <div className="md:hidden space-y-2">
        {filtered.map((app) => {
          const ctx = contextMap[String(app.num)];
          const isOverdue = ctx?.followUpDate && ctx.followUpDate <= today;
          const hasNote = !!ctx?.notes;

          return (
            <div
              key={app.num}
              className="bg-[#161b22] rounded-lg border border-gray-800 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/applications/${app.num}`}
                    className="text-blue-400 font-semibold hover:underline text-base block truncate"
                  >
                    {app.company}
                  </a>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{app.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-blue-400 font-bold text-sm">{app.score.toFixed(1)}</span>
                  <div className="relative">
                    <button
                      onClick={() => setOpenNoteId(openNoteId === app.num ? null : app.num)}
                      className={`text-base ${hasNote ? 'opacity-100' : 'opacity-30'}`}
                    >
                      📝
                    </button>
                    {openNoteId === app.num && (
                      <NotePopover
                        appId={app.num}
                        initialNote={ctx?.notes ?? ''}
                        onClose={() => setOpenNoteId(null)}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.num, e.target.value as Status)}
                  disabled={updatingId === app.num}
                  className="flex-1 min-w-0 text-sm px-2 py-2 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                  {isOverdue && (
                    <span title={`Follow-up: ${ctx.followUpDate}`} className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                  )}
                  <span>{app.date.slice(5)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table view */}
      <div className="hidden md:block overflow-x-auto bg-[#161b22] rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">#</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">Company</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">Score</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-400">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => {
              const ctx = contextMap[String(app.num)];
              const isOverdue = ctx?.followUpDate && ctx.followUpDate <= today;
              const hasNote = !!ctx?.notes;

              return (
                <tr key={app.num} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-400">{app.num}</td>
                  <td className="px-6 py-4">
                    <a href={`/applications/${app.num}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                      {app.company}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{app.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(app.score / 5) * 100}%` }} />
                      </div>
                      <span className="font-semibold text-gray-200">{app.score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.num, e.target.value as Status)}
                      disabled={updatingId === app.num}
                      className="text-sm px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      {isOverdue && (
                        <span title={`Follow-up: ${ctx.followUpDate}`} className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block shrink-0" />
                      )}
                      {app.date}
                    </div>
                  </td>
                  <td className="px-4 py-4 relative">
                    <button
                      onClick={() => setOpenNoteId(openNoteId === app.num ? null : app.num)}
                      className={`text-base leading-none transition ${hasNote ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}
                      title={hasNote ? 'View/edit note' : 'Add note'}
                    >
                      📝
                    </button>
                    {openNoteId === app.num && (
                      <NotePopover
                        appId={app.num}
                        initialNote={ctx?.notes ?? ''}
                        onClose={() => setOpenNoteId(null)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-600">No applications found</div>
      )}
    </div>
  );
}

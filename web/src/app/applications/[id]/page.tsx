'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Application, AppContext, Status } from '@/lib/types';

const PIPELINE_STEPS: Status[] = ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer'];
const CAREER_OPS_MODES = ['oferta', 'deep', 'contacto', 'apply', 'pdf', 'interview-prep', 'patterns', 'followup'];

function PipelineStepper({ status }: { status: string }) {
  const isTerminal = status === 'Rejected' || status === 'Discarded' || status === 'SKIP';
  if (isTerminal) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
        <span>✕</span>
        <span>Status: {status}</span>
      </div>
    );
  }

  const currentIdx = PIPELINE_STEPS.indexOf(status as Status);

  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STEPS.map((step, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isPast
                    ? 'bg-green-600 border-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0f1117]'
                    : 'bg-transparent border-gray-700 text-gray-600'
                }`}
              >
                {isPast ? '✓' : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  isCurrent ? 'text-blue-400' : isPast ? 'text-green-500' : 'text-gray-600'
                }`}
              >
                {step}
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 mb-4 mx-1 ${
                  i < currentIdx ? 'bg-green-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InlineField({
  label,
  value,
  placeholder,
  type = 'text',
  onSave,
  href,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onSave: (val: string) => void;
  href?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  if (!editing && !local) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 w-28 shrink-0">{label}</span>
      {editing || !local ? (
        <input
          type={type}
          value={local}
          placeholder={placeholder}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => {
            setEditing(false);
            if (local !== value) onSave(local);
          }}
          autoFocus={editing}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-gray-200 hover:text-blue-400 truncate"
        >
          {href ? (
            <a
              href={local}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {local}
            </a>
          ) : (
            local
          )}
          <span className="ml-2 text-gray-600 text-xs">✎</span>
        </button>
      )}
    </div>
  );
}

function AddFieldButton({ label, onReveal }: { label: string; onReveal: () => void }) {
  return (
    <button
      onClick={onReveal}
      className="text-xs text-gray-600 hover:text-gray-400 transition"
    >
      + Add {label}
    </button>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [ctx, setCtx] = useState<AppContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [saveIndicator, setSaveIndicator] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [copied, setCopied] = useState(false);

  const statuses: Status[] = ['Evaluated', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected', 'Discarded', 'SKIP'];

  const saveCtx = useCallback(async (patch: Partial<AppContext>) => {
    setSaveIndicator('Saving...');
    try {
      const res = await fetch(`/api/context/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json() as AppContext;
        setCtx(updated);
        setSaveIndicator('Saved');
        setTimeout(() => setSaveIndicator(''), 2000);
      }
    } catch {
      setSaveIndicator('Error');
    }
  }, [id]);

  async function handleStatusChange(newStatus: Status) {
    if (!app) return;
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setApp({ ...app, status: newStatus });
    }
  }

  function copyCommand() {
    if (!ctx?.plannedMode) return;
    const note = ctx.plannedNote ? ` — ${ctx.plannedNote}` : '';
    const cmd = `/career-ops ${ctx.plannedMode}${note}`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, ctxRes] = await Promise.all([
          fetch('/api/applications'),
          fetch(`/api/context/${id}`),
        ]);
        const apps = await appsRes.json() as Application[];
        const found = apps.find((a) => a.num === parseInt(id, 10));
        const ctxData = await ctxRes.json() as AppContext;
        setApp(found ?? null);
        setCtx(ctxData);
        setNotesText(ctxData.notes ?? '');
        if (ctxData.contactName || ctxData.contactLinkedIn) setShowContact(true);
        if (ctxData.companyUrl) setShowWebsite(true);
        if (ctxData.followUpDate) setShowFollowUp(true);
        if (ctxData.salaryRange) setShowSalary(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-gray-400">Loading...</div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 text-gray-400">Application #{id} not found.</div>
    );
  }

  const reportMatch = app.report.match(/\[(\d+)\]\(([^)]+)\)/);

  return (
    <div className="p-6 max-w-2xl">
      {/* Back link */}
      <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300 mb-6 inline-flex items-center gap-1">
        ← Dashboard
      </a>

      {/* Header */}
      <div className="mt-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{app.company}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold text-blue-400">{app.score.toFixed(1)}</span>
            <span className="text-gray-600 text-sm">/ 5</span>
          </div>
        </div>
        <p className="text-gray-400 mt-1">{app.role}</p>
        <p className="text-gray-600 text-sm mt-1">{app.date}</p>
      </div>

      {/* Status + chips row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={app.status}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
          className="text-sm px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {app.cvFile && (
          <span className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-400 font-mono">
            📄 {app.cvFile}
          </span>
        )}

        <span className="text-sm">{app.pdf === '✅' ? '✅ PDF' : '❌ No PDF'}</span>

        {reportMatch && (
          <a
            href={reportMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 text-blue-400 hover:text-blue-300"
          >
            Report #{reportMatch[1]}
          </a>
        )}
      </div>

      {/* Pipeline stepper */}
      <div className="mb-8">
        <PipelineStepper status={app.status} />
      </div>

      {/* Context fields */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 p-4 mb-4">
        <div className="space-y-3">
          {showWebsite ? (
            <InlineField
              label="Website"
              value={ctx?.companyUrl ?? ''}
              placeholder="https://company.com"
              onSave={(v) => saveCtx({ companyUrl: v })}
              href={ctx?.companyUrl}
            />
          ) : (
            <AddFieldButton label="website" onReveal={() => setShowWebsite(true)} />
          )}

          {showContact ? (
            <>
              <InlineField
                label="Contact"
                value={ctx?.contactName ?? ''}
                placeholder="Recruiter name"
                onSave={(v) => saveCtx({ contactName: v })}
              />
              <InlineField
                label="LinkedIn"
                value={ctx?.contactLinkedIn ?? ''}
                placeholder="https://linkedin.com/in/..."
                onSave={(v) => saveCtx({ contactLinkedIn: v })}
                href={ctx?.contactLinkedIn}
              />
            </>
          ) : (
            <AddFieldButton label="contact" onReveal={() => setShowContact(true)} />
          )}

          {showFollowUp ? (
            <InlineField
              label="Follow-up"
              value={ctx?.followUpDate ?? ''}
              placeholder=""
              type="date"
              onSave={(v) => saveCtx({ followUpDate: v })}
            />
          ) : (
            <AddFieldButton label="follow-up date" onReveal={() => setShowFollowUp(true)} />
          )}

          {showSalary ? (
            <InlineField
              label="Salary range"
              value={ctx?.salaryRange ?? ''}
              placeholder="e.g. 45k–55k"
              onSave={(v) => saveCtx({ salaryRange: v })}
            />
          ) : (
            <AddFieldButton label="salary range" onReveal={() => setShowSalary(true)} />
          )}
        </div>

        {saveIndicator && (
          <p className="text-xs text-gray-500 mt-3">{saveIndicator}</p>
        )}
      </div>

      {/* Mode selector */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 p-4 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Next career-ops action</p>
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Mode</label>
            <select
              value={ctx?.plannedMode ?? ''}
              onChange={(e) => saveCtx({ plannedMode: e.target.value })}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— select mode —</option>
              {CAREER_OPS_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Note</label>
            <input
              type="text"
              value={ctx?.plannedNote ?? ''}
              placeholder="e.g. ask about remote policy"
              onChange={(e) => setCtx((c) => c ? { ...c, plannedNote: e.target.value } : c)}
              onBlur={(e) => saveCtx({ plannedNote: e.target.value })}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={copyCommand}
            disabled={!ctx?.plannedMode}
            className="px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm transition"
          >
            {copied ? 'Copied!' : 'Copy command'}
          </button>
        </div>
        {ctx?.plannedMode && (
          <code className="mt-2 block text-xs text-gray-500 font-mono">
            /career-ops {ctx.plannedMode}{ctx.plannedNote ? ` — ${ctx.plannedNote}` : ''}
          </code>
        )}
      </div>

      {/* Notes */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800 p-4">
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-gray-200"
        >
          <span>Notes</span>
          <span>{notesOpen ? '▾' : '▸'}</span>
        </button>
        {notesOpen && (
          <div className="mt-3">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              onBlur={() => saveCtx({ notes: notesText })}
              rows={5}
              placeholder="Your research notes, apply angle, anything useful..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">{notesText.length} chars</p>
          </div>
        )}
      </div>
    </div>
  );
}

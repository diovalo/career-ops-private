export default function GuidePage() {
  const modes = [
    {
      command: '/career-ops {JD}',
      name: 'Auto-pipeline',
      description: 'Full evaluation: paste a JD or URL and get a score, CV, report, and tracker entry — all in one go.',
      example: 'Paste a LinkedIn job posting → get a 4.2/5 score + tailored CV',
    },
    {
      command: '/career-ops oferta',
      name: 'Evaluate offer',
      description: 'Detailed A-F scoring of a single job. No PDF generated. Use when you want analysis only.',
      example: 'Quickly check if a role is worth pursuing before committing',
    },
    {
      command: '/career-ops ofertas',
      name: 'Compare offers',
      description: 'Side-by-side ranking of multiple offers. Good for when you have 2–3 live options.',
      example: 'Compare Celonis vs SAP vs startup — which to prioritize?',
    },
    {
      command: '/career-ops pdf',
      name: 'Generate CV',
      description: 'ATS-optimized PDF CV tailored to a specific JD. Uses your cv.md as the base.',
      example: 'Generate a German-language CV variant for a DACH role',
    },
    {
      command: '/career-ops contacto',
      name: 'LinkedIn outreach',
      description: 'Find the right person to contact at a company and draft a personalized LinkedIn message.',
      example: 'Identify the Engineering Manager and write a 300-char cold message',
    },
    {
      command: '/career-ops deep',
      name: 'Deep research',
      description: 'Full company research: funding, team, tech stack, culture signals, news.',
      example: 'Research Personio before your interview next Thursday',
    },
    {
      command: '/career-ops apply',
      name: 'Application assistant',
      description: 'Reads an open application form and generates tailored answers for each field.',
      example: 'Open a Greenhouse form → get pre-filled answers for every question',
    },
    {
      command: '/career-ops interview-prep',
      name: 'Interview prep',
      description: 'Company-specific prep report: likely questions, STAR stories to use, red flags to address.',
      example: 'Prep for a Celonis Product Engineer loop — 5 likely questions + answers',
    },
    {
      command: '/career-ops scan',
      name: 'Scan portals',
      description: 'Hits Greenhouse / Ashby / Lever APIs for your target companies. Zero LLM cost, fast.',
      example: 'Find new Werkstudent postings across 45 companies in 30 seconds',
    },
    {
      command: '/career-ops pipeline',
      name: 'Process inbox',
      description: 'Evaluates pending URLs from data/pipeline.md. Use after adding companies on mobile.',
      example: 'You added 3 companies on your phone → run pipeline to evaluate them all',
    },
    {
      command: '/career-ops tracker',
      name: 'Status overview',
      description: 'Shows a summary of your application pipeline: counts per status, recent activity.',
      example: 'Quick check: how many applied, how many in interview?',
    },
    {
      command: '/career-ops patterns',
      name: 'Rejection patterns',
      description: 'Analyzes your tracker to find patterns in rejections and improve targeting.',
      example: 'Why are you rejected by all fintech roles? Find the pattern.',
    },
    {
      command: '/career-ops followup',
      name: 'Follow-up cadence',
      description: 'Flags overdue follow-ups and generates polite nudge messages.',
      example: 'Applied to 5 places 2 weeks ago — generate follow-up emails',
    },
    {
      command: '/career-ops training',
      name: 'Evaluate course/cert',
      description: 'Scores a training or certification against your career North Star.',
      example: 'Is the AWS Solutions Architect cert worth 3 months of prep?',
    },
    {
      command: '/career-ops project',
      name: 'Portfolio project',
      description: 'Evaluates a portfolio project idea — ROI, signal quality, time investment.',
      example: 'Should you build a RAG chatbot demo or a distributed systems toy project?',
    },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Career-Ops Guide</h1>
      <p className="text-gray-500 text-sm mb-8">
        All commands available in the CLI. Run them in your terminal in the project directory.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {modes.map((m) => (
          <div
            key={m.command}
            className="bg-[#161b22] border border-gray-800 rounded-lg p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <code className="text-blue-400 text-sm font-mono">{m.command}</code>
              <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">{m.name}</span>
            </div>
            <p className="text-gray-300 text-sm">{m.description}</p>
            <p className="text-gray-600 text-xs mt-2 italic">{m.example}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[#161b22] border border-gray-800 rounded-lg">
        <p className="text-gray-500 text-sm font-semibold mb-2">Inbox workflow</p>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>Add a company on your phone via the <a href="/add" className="text-blue-400 hover:underline">Add Company</a> page</li>
          <li>Run <code className="text-gray-300">git pull</code> on your laptop to get the new entry</li>
          <li>Run <code className="text-gray-300">/career-ops pipeline</code> to evaluate all pending URLs</li>
          <li>Push the results back with <code className="text-gray-300">git push</code></li>
          <li>The dashboard refreshes automatically</li>
        </ol>
      </div>
    </div>
  );
}

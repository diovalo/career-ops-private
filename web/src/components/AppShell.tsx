'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/pipeline',
    label: 'Pipeline',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="4" height="16" rx="1" /><rect x="9" y="4" width="4" height="12" rx="1" />
        <rect x="16" y="4" width="4" height="8" rx="1" />
      </svg>
    ),
  },
  {
    href: '/add',
    label: 'Add Company',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: '/guide',
    label: 'Guide',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Persist desktop collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('sidebar-collapsed', String(!c));
      return !c;
    });
  }

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close mobile drawer on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    function onClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) ?? false;
  }

  return (
    <div className="bg-[#0f1117] min-h-screen md:flex md:h-screen">

      {/* ── Desktop sidebar ── */}
      <div
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-r border-gray-800 bg-[#161b22] transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-64'
        }`}
      >
        {/* Header row */}
        <div className={`flex items-center h-14 border-b border-gray-800 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <span className="text-lg font-bold text-white">Career-Ops</span>}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <><polyline points="9 18 15 12 9 6" /></>
                : <><polyline points="15 18 9 12 15 6" /></>
              }
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition text-sm ${
                isActive(link.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="shrink-0">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </a>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-800 text-xs text-gray-600">
            <p>Syncing with GitHub</p>
          </div>
        )}
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 md:overflow-auto min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#161b22] border-b border-gray-800">
          <span className="text-lg font-bold text-white">Career-Ops</span>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {children}
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#161b22] border-r border-gray-800 flex flex-col p-6 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-xl font-bold text-white">Career-Ops</span>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded text-gray-500 hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                isActive(link.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800 text-xs text-gray-600">
          <p>Syncing with GitHub</p>
        </div>
      </div>
    </div>
  );
}

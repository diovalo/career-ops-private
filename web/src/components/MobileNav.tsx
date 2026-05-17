'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/pipeline', label: 'Pipeline' },
  { href: '/add', label: 'Add Company' },
  { href: '/guide', label: 'Guide' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      {/* Top bar — mobile only */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#161b22] border-b border-gray-800">
        <span className="text-lg font-bold text-white">Career-Ops</span>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#161b22] border-r border-gray-800 flex flex-col p-6 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-xl font-bold text-white">Career-Ops</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded text-gray-500 hover:text-white"
            aria-label="Close menu"
          >
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
              className={`block px-4 py-3 rounded-lg text-sm transition ${
                pathname === link.href || pathname?.startsWith(link.href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800 text-xs text-gray-600">
          <p>Syncing with GitHub</p>
        </div>
      </div>
    </>
  );
}

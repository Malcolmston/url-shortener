import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScissors, faLinkSimple, faCloudArrowUp,
  faChartLine, faGear, faBars, faXmark, faUser
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
  { label: 'My Links',  href: '/links',     icon: faLinkSimple },
  { label: 'Files',     href: '/files',      icon: faCloudArrowUp },
  { label: 'Analytics', href: '/analytics',  icon: faChartLine },
  { label: 'Settings',  href: '/settings',   icon: faGear },
];

export default function AppShell({ children }) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans flex">

      {/* ── Sidebar ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={[
        'fixed inset-y-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:static md:z-auto',
      ].join(' ')}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg text-gray-900 dark:text-slate-50">
            <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <FontAwesomeIcon icon={faScissors} className="text-white text-sm" />
            </span>
            Snip
          </Link>
          <button
            className="ml-auto md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50',
                ].join(' ')}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 text-center flex-shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex-shrink-0">
          <Link
            to="/account"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faUser} className="text-violet-600 dark:text-violet-400 text-xs" />
            </span>
            Account
          </Link>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 flex items-center px-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-base text-gray-900 dark:text-slate-50 ml-3">
            <span className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faScissors} className="text-white text-xs" />
            </span>
            Snip
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

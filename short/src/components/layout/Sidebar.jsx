import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScissors, faGrid2, faLinkSimple, faFile, faCloudArrowUp,
  faChartLine, faGear, faBell, faKey, faTrash, faSearch,
  faSignOut, faCircleUser, faChevronDown, faMoon, faSun,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../hooks/useTheme';

// NOTE: Import from free-solid icons since pro may not be installed.
// If faGrid2 isn't available, use faTableCells or faHome instead.

const NAV = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: faGrid2 || faChartLine, path: '/dashboard' },
      { label: 'My Links', icon: faLinkSimple, path: '/links' },
      { label: 'My Files', icon: faFile, path: '/files' },
      { label: 'Upload', icon: faCloudArrowUp, path: '/upload' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Analytics', icon: faChartLine, path: '/analytics' },
      { label: 'Notifications', icon: faBell, path: '/notifications' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { label: 'Account', icon: faGear, path: '/account' },
      { label: 'API Keys', icon: faKey, path: '/account?tab=security' },
      { label: 'Trash', icon: faTrash, path: '/trash' },
    ],
  },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  return (
    <Link
      to={item.path}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
        isActive
          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50',
      ].join(' ')}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
      <FontAwesomeIcon
        icon={item.icon}
        className={['w-5 flex-shrink-0', isActive ? 'text-violet-600 dark:text-violet-400' : ''].join(' ')}
        aria-hidden="true"
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-20 w-64 flex flex-col',
          'bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800',
          'transition-transform duration-250 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faScissors} className="text-white text-sm" aria-hidden="true" />
          </div>
          <span className="font-display font-bold text-lg text-gray-900 dark:text-slate-50">Snip</span>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faScissors} className="text-sm" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin" aria-label="Main navigation">
          {NAV.map((group, gi) => (
            <div key={group.section} className={gi > 0 ? 'mt-6' : ''}>
              <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => (
                  <li key={item.path}>
                    <NavItem item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-50 transition-colors"
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} className="w-5" aria-hidden="true" />
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {/* User + logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <FontAwesomeIcon icon={faSignOut} className="w-5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

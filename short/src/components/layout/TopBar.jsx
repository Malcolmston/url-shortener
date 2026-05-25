import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function TopBar({ onMenuClick, user }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 flex items-center px-4 sm:px-6 gap-4">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Open navigation"
      >
        <FontAwesomeIcon icon={faBars} aria-hidden="true" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-sm" aria-hidden="true" />
          </span>
          <input
            type="search"
            placeholder="Search links, files… (⌘K)"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-colors"
            aria-label="Global search"
            readOnly
            onClick={() => {/* TODO: open command palette */}}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <FontAwesomeIcon icon={faBell} aria-hidden="true" />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" aria-label="Unread notifications" />
        </Link>

        {/* User avatar */}
        <Link
          to="/account"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Account settings"
        >
          <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
            <FontAwesomeIcon icon={faCircleUser} className="text-violet-600 dark:text-violet-400 text-sm" aria-hidden="true" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-300 max-w-[120px] truncate">
            {user?.username || 'Account'}
          </span>
        </Link>
      </div>
    </header>
  );
}

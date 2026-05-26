import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useNavigate } from 'react-router-dom';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/user')
      .then(r => {
        if (r.status === 401 || r.status === 403) {
          navigate('/login');
          return null;
        }
        return r.json();
      })
      .then(data => { if (data) setUser(data); })
      .catch(() => navigate('/login'));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} user={user} />

        <main
          id="main-content"
          className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy-load pages for code splitting
const Landing    = lazy(() => import('./pages/Landing'));
const Login      = lazy(() => import('./pages/Login'));
const Signup     = lazy(() => import('./Signup'));
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const LinksPage  = lazy(() => import('./pages/Links'));
const FilesPage  = lazy(() => import('./files'));
const UploadPage = lazy(() => import('./upload'));
const AccountPage = lazy(() => import('./account'));
const NotFound   = lazy(() => import('./404'));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-400">Loading…</p>
      </div>
    </div>
  );
}

// Theme initializer
function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('snip-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />

          {/* App (authenticated) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/links"     element={<LinksPage />} />
          <Route path="/files"     element={<FilesPage />} />
          <Route path="/upload"    element={<UploadPage />} />
          <Route path="/account"   element={<AccountPage />} />

          {/* Fallback */}
          <Route path="*"          element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

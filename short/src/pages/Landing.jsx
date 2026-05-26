import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScissors, faLinkSimple, faChartLine, faCloudArrowUp,
  faLock, faKey, faBars, faXmark, faArrowRight,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    icon: faLinkSimple,
    color: 'violet',
    title: 'Smart Short Links',
    desc: 'Custom slugs, automatic slug generation, QR codes, expiry dates, and redirect type control.',
  },
  {
    icon: faChartLine,
    color: 'emerald',
    title: 'Real-Time Analytics',
    desc: 'Track clicks, geographic distribution, devices, browsers, and referrer sources.',
  },
  {
    icon: faCloudArrowUp,
    color: 'sky',
    title: 'File Hosting',
    desc: 'Upload any file type — images, documents, code, archives. Control public or private visibility.',
  },
  {
    icon: faLock,
    color: 'amber',
    title: 'Link Protection',
    desc: 'Password-protect any link. Set expiry dates. Show preview interstitials before redirecting.',
  },
  {
    icon: faKey,
    color: 'rose',
    title: 'Developer API',
    desc: 'Full REST API with API key authentication. Webhooks for real-time event notifications.',
  },
  {
    icon: faScissors,
    color: 'indigo',
    title: 'One-Click Copy',
    desc: 'Instantly copy your short URL to clipboard. Share anywhere in seconds.',
  },
];

const COLOR_MAP = {
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950/40',  icon: 'text-violet-600 dark:text-violet-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'text-emerald-600 dark:text-emerald-400' },
  sky:     { bg: 'bg-sky-50 dark:bg-sky-950/40',         icon: 'text-sky-600 dark:text-sky-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/40',     icon: 'text-amber-600 dark:text-amber-400' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/40',       icon: 'text-rose-600 dark:text-rose-400' },
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-950/40',   icon: 'text-indigo-600 dark:text-indigo-400' },
};

const STEPS = [
  { n: '01', title: 'Paste your URL', desc: 'Drop any long URL into the Snip input — or upload a file.' },
  { n: '02', title: 'Customise', desc: 'Choose a custom slug, set an expiry date, or add a password.' },
  { n: '03', title: 'Share & track', desc: 'Copy your short link and watch clicks roll in on the analytics dashboard.' },
];

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">

      {/* ── NAVBAR ── */}
      <header className={[
        'sticky top-0 z-30 h-16 flex items-center border-b transition-all duration-200',
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-gray-200 dark:border-slate-800 shadow-xs'
          : 'bg-transparent border-transparent',
      ].join(' ')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-gray-900 dark:text-slate-50">
            <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faScissors} className="text-white text-sm" />
            </span>
            Snip
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="px-4 py-2 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-16 inset-x-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex flex-col gap-2 md:hidden shadow-md">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                {l.label}
              </a>
            ))}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-1 flex flex-col gap-2">
              <Link to="/login" className="px-3 py-2.5 text-sm font-medium text-center text-gray-700 dark:text-slate-300 rounded-lg border border-gray-200 dark:border-slate-700">Sign in</Link>
              <Link to="/signup" className="px-3 py-2.5 text-sm font-semibold text-center bg-violet-600 text-white rounded-lg hover:bg-violet-700">Get started free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300 mb-8">
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
          Now with real-time analytics
        </div>

        <h1 className="font-display text-display-lg md:text-display-xl lg:text-display-2xl font-extrabold text-gray-900 dark:text-slate-50 leading-tight max-w-4xl mx-auto">
          Shorten. Share.{' '}
          <span className="text-violet-600 dark:text-violet-400">Snip.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create short links, host files, and track every click — all in one clean, fast dashboard.
          No fluff. Just results.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/25 text-base">
            Create free account
            <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
          </Link>
          <a href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-base">
            See how it works
          </a>
        </div>

        {/* Hero mockup */}
        <div className="mt-16 mx-auto max-w-4xl rounded-2xl bg-gray-900 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 dark:bg-slate-700 border-b border-gray-700 dark:border-slate-600">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-2 text-xs text-gray-400 font-mono">snip.io/dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Links', value: '1,284', color: 'violet' },
              { label: 'Total Files', value: '342', color: 'sky' },
              { label: 'Clicks Today', value: '8,921', color: 'emerald' },
              { label: 'Storage Used', value: '2.4 GB', color: 'amber' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 dark:bg-slate-700 rounded-xl p-4 border border-gray-700 dark:border-slate-600">
                <p className={`text-xl font-bold font-display ${
                  s.color === 'violet' ? 'text-violet-400' :
                  s.color === 'sky' ? 'text-sky-400' :
                  s.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                }`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '10M+', label: 'Links created' },
            { value: '99.9%', label: 'Uptime' },
            { value: '150+', label: 'Countries reached' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl md:text-4xl font-bold font-display text-gray-900 dark:text-slate-50">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-display-md font-display font-bold text-gray-900 dark:text-slate-50">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mt-4 text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            A focused set of tools for managing links and files — without the bloat.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => {
            const { bg, icon } = COLOR_MAP[f.color];
            return (
              <div key={f.title}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-200">
                <div className={['w-11 h-11 rounded-xl flex items-center justify-center mb-4', bg].join(' ')}>
                  <FontAwesomeIcon icon={f.icon} className={['text-lg', icon].join(' ')} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-50 font-display">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-display-md font-display font-bold text-gray-900 dark:text-slate-50">Up and running in seconds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-0 h-px bg-gray-200 dark:bg-slate-700" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-bold font-display text-lg flex items-center justify-center shadow-lg shadow-violet-600/25 mb-4">
                    {s.n}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-slate-50 font-display">{s.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-violet-600 px-4 text-center">
        <h2 className="text-display-md font-display font-bold text-white">Start shortening in seconds.</h2>
        <p className="text-violet-200 mt-3 text-base">No credit card required. Free forever.</p>
        <Link to="/signup"
          className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-violet-700 font-bold rounded-xl hover:bg-violet-50 transition-colors shadow-xl text-lg">
          Create free account
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 font-display font-bold text-lg text-white mb-3">
                <span className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center">
                  <FontAwesomeIcon icon={faScissors} className="text-white text-xs" />
                </span>
                Snip
              </div>
              <p className="text-sm leading-relaxed">Short links. Big control.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'API Docs', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © 2026 Snip · All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

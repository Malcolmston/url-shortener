import { Suspense } from 'react';
import { getUser } from '@/lib/session';
import { Link, File as FileModel, Click } from '@/lib/models';
import { StatCard } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

async function DashboardStats({ userId }: { userId: number }) {
  const { Op } = await import('sequelize');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalLinks, totalFiles, userLinks] = await Promise.all([
    Link.count({ where: { userId } }),
    FileModel.count({ where: { userId } }),
    Link.findAll({ where: { userId }, attributes: ['id'], raw: true }),
  ]);

  const linkIds = userLinks.map((l: any) => l.id);
  const totalClicks = linkIds.length
    ? await Click.count({ where: { linkId: { [Op.in]: linkIds } } })
    : 0;
  const recentClicks = linkIds.length
    ? await Click.count({ where: { linkId: { [Op.in]: linkIds }, createdAt: { [Op.gte]: thirtyDaysAgo } } })
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Total links"
        value={totalLinks}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        }
      />
      <StatCard
        label="Total files"
        value={totalFiles}
        colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
      />
      <StatCard
        label="Total clicks"
        value={totalClicks.toLocaleString()}
        colorClass="text-blue-600 bg-blue-50 dark:bg-blue-950"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        }
      />
      <StatCard
        label="Clicks (30 days)"
        value={recentClicks.toLocaleString()}
        colorClass="text-purple-600 bg-purple-50 dark:bg-purple-950"
        delta="Last 30 days"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstname ?? 'there'}!
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Here&apos;s an overview of your activity.</p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 h-24 animate-pulse" />
          ))}
        </div>
      }>
        <DashboardStats userId={user!.id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick actions</h2>
          <div className="space-y-3">
            <a href="/links" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Create a new link</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Shorten and track a URL</p>
              </div>
            </a>
            <a href="/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Upload a file</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Share files up to 50 MB</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Getting started</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              Create your first short link from the Links page
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              Share it and watch the clicks roll in
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              Explore analytics for detailed insights
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              Generate an API key in Account settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

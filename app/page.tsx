import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950 px-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/25">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Short links.{' '}
          <span className="text-brand-600">Big control.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          Create branded short links, track clicks with real analytics,
          and manage your files — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold text-lg hover:bg-brand-700 transition-colors duration-200 shadow-lg shadow-brand-600/20"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-semibold text-lg hover:bg-brand-50 transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

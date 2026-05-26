import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
      <div className="text-center">
        <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-4">404 error</p>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or the short link has expired.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

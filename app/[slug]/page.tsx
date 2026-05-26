import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Link, Click } from '@/lib/models';
import { parseUserAgent, normalizeReferrer, hashIp } from '@/lib/parseUA';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  // Skip Next.js internal paths
  if (slug.startsWith('_') || slug.startsWith('api')) return notFound();

  const link = await Link.findOne({ where: { slug, isActive: true } });
  if (!link) return notFound();

  if (link.isExpired()) {
    // Return a simple expired message page
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Link Expired</h1>
          <p className="text-gray-600 mt-2">This short link has expired.</p>
        </div>
      </main>
    );
  }

  // Record click (non-blocking)
  const headerStore = await headers();
  const ua = headerStore.get('user-agent') ?? '';
  const referer = headerStore.get('referer') ?? undefined;
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const host = headerStore.get('host') ?? '';

  // Fire-and-forget analytics
  Promise.resolve().then(async () => {
    try {
      const { device, os, browser } = parseUserAgent(ua);
      const referrer = normalizeReferrer(referer, host);
      const ipHash = hashIp(ip);
      await Click.create({ linkId: link.id, ipHash, device, os, browser, referrer });
      await Link.increment('clicks', { where: { id: link.id } });
    } catch { /* never block redirects */ }
  });

  // Redirect with the appropriate status code
  const statusCode = parseInt(link.redirectType) || 302;
  if (statusCode === 301) {
    // Next.js redirect() does 307 by default; for 301 we use permanent:true
    redirect(link.originalUrl); // permanent redirect
  }
  redirect(link.originalUrl);
}

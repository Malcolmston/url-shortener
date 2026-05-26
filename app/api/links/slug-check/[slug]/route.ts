import { NextRequest } from 'next/server';
import { Link } from '@/lib/models';
import { validateSlug } from '@/lib/slugify';
import { ok } from '@/lib/response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const validation = validateSlug(slug);
  if (!validation.valid) return ok({ available: false, reason: validation.reason });
  try {
    const existing = await Link.findOne({ where: { slug } });
    return ok({ available: !existing });
  } catch {
    return ok({ available: false, reason: 'Server error' });
  }
}

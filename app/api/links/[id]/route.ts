import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { Link } from '@/lib/models';
import { validateUrl } from '@/lib/slugify';
import { ok, err, notFound, serverError } from '@/lib/response';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const link = await Link.findOne({ where: { id: parseInt(id), userId: user.id } });
    if (!link) return notFound('Link');
    const { url, expiresAt, redirectType, hasPreview, isActive } = await request.json();
    if (url) {
      if (!validateUrl(url)) return err('Invalid URL');
      link.set('originalUrl', url);
    }
    if (expiresAt !== undefined) link.set('expiresAt', expiresAt ? new Date(expiresAt) : null);
    if (redirectType && ['301','302','307'].includes(redirectType)) link.set('redirectType', redirectType);
    if (hasPreview  !== undefined) link.set('hasPreview',  !!hasPreview);
    if (isActive    !== undefined) link.set('isActive',    !!isActive);
    await link.save();
    return ok({ link });
  } catch (e) { return serverError(e); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const link = await Link.findOne({ where: { id: parseInt(id), userId: user.id } });
    if (!link) return notFound('Link');
    await link.destroy();
    return ok({ message: 'Link deleted' });
  } catch (e) { return serverError(e); }
}

import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { Link } from '@/lib/models';
import { generateSlug, validateSlug, validateUrl } from '@/lib/slugify';
import { ok, err, serverError } from '@/lib/response';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const links = await Link.findAll({
      where: { userId: sessionUser.id },
      order: [['createdAt', 'DESC']],
      paranoid: false,
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`;
    return ok({ links: links.map((l: any) => ({
      id: l.id, slug: l.slug,
      shortUrl: `${baseUrl}/${l.slug}`,
      originalUrl: l.originalUrl, redirectType: l.redirectType,
      hasPreview: l.hasPreview, isPasswordProtected: l.isPasswordProtected,
      expiresAt: l.expiresAt, isActive: l.isActive, clicks: l.clicks,
      createdAt: l.createdAt, deletedAt: l.deletedAt, isExpired: l.isExpired(),
    }))});
  } catch (e) { return serverError(e); }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const { url, customSlug, expiresAt, password, redirectType = '302', hasPreview = false } = await request.json();

    if (!validateUrl(url)) return err('Invalid URL — must start with http:// or https://');

    let slug = customSlug as string | undefined;
    if (slug) {
      const v = validateSlug(slug);
      if (!v.valid) return err(v.reason!);
      const exists = await Link.findOne({ where: { slug } });
      if (exists) return err('Slug already taken', 409);
    } else {
      let attempts = 0;
      do {
        slug = generateSlug(6 + Math.floor(attempts / 5));
        attempts++;
      } while (await Link.findOne({ where: { slug } }) && attempts < 20);
    }

    const linkData: Record<string, unknown> = {
      slug, originalUrl: url, userId: sessionUser.id,
      redirectType: ['301','302','307'].includes(redirectType) ? redirectType : '302',
      hasPreview: !!hasPreview,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPasswordProtected: !!password,
    };
    if (password) {
      linkData.passwordHash = await bcrypt.hash(password, parseInt(process.env.SALT ?? '10'));
    }

    const link = await Link.create(linkData);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get('host')}`;
    return ok({ link: { id: link.id, slug: link.slug, shortUrl: `${baseUrl}/${link.slug}`, originalUrl: link.originalUrl, redirectType: link.redirectType, hasPreview: link.hasPreview, isPasswordProtected: link.isPasswordProtected, expiresAt: link.expiresAt, clicks: link.clicks, createdAt: link.createdAt } }, 201);
  } catch (e) { return serverError(e); }
}

import { randomBytes } from 'crypto';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** Generate a random base-62 slug of the given length. */
export function generateSlug(length = 6): string {
  const bytes = randomBytes(length * 2);
  let slug = '';
  for (let i = 0; slug.length < length; i++) {
    const idx = bytes[i % bytes.length] % 62;
    slug += BASE62[idx];
  }
  return slug;
}

const RESERVED = new Set([
  'login', 'logout', 'signup', 'register', 'dashboard', 'admin', 'api',
  'user', 'users', 'account', 'settings', 'profile', 'files', 'upload',
  'uploads', 'links', 'analytics', 'health', 'static', 'favicon',
  'robots', 'sitemap', 'cdn', 'assets', 'public', 'private', 'null',
  'undefined', 'help', 'docs', 'support', 'about', 'terms', 'privacy',
]);

const SLUG_RE = /^[a-zA-Z0-9_-]{3,60}$/;

export interface SlugValidation {
  valid: boolean;
  reason?: string;
}

/** Validate a custom slug. */
export function validateSlug(slug: string): SlugValidation {
  if (!SLUG_RE.test(slug)) {
    return { valid: false, reason: 'Slug must be 3–60 chars, letters, numbers, _ or -' };
  }
  if (RESERVED.has(slug.toLowerCase())) {
    return { valid: false, reason: 'That slug is reserved' };
  }
  return { valid: true };
}

/** Validate a destination URL. */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

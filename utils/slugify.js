/**
 * Slug generation utilities for Snip URL shortener
 */

const BASE62_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Reserved slugs that cannot be used as custom short codes
const RESERVED_SLUGS = new Set([
  'api', 'dashboard', 'login', 'signup', 'logout', 'admin', 'static',
  'uploads', 'files', 'links', 'account', 'settings', 'health', 'welcome',
  'analytics', 'notifications', 'trash', 'search', 'u', 'p', 'l', 's',
  'help', 'support', 'terms', 'privacy', 'about', 'contact', 'blog',
]);

/**
 * Generate a random base62 slug of the specified length
 */
function generateSlug(length = 6) {
  let slug = '';
  const array = new Uint8Array(length);
  // Use crypto if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    const nodeCrypto = require('crypto');
    const buf = nodeCrypto.randomBytes(length);
    for (let i = 0; i < length; i++) array[i] = buf[i];
  }
  for (let i = 0; i < length; i++) {
    slug += BASE62_CHARS[array[i] % BASE62_CHARS.length];
  }
  return slug;
}

/**
 * Validate a custom slug
 */
function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') return { valid: false, reason: 'Slug is required' };
  if (slug.length < 3) return { valid: false, reason: 'Slug must be at least 3 characters' };
  if (slug.length > 50) return { valid: false, reason: 'Slug must be 50 characters or fewer' };
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return { valid: false, reason: 'Slug can only contain letters, numbers, hyphens, and underscores' };
  if (RESERVED_SLUGS.has(slug.toLowerCase())) return { valid: false, reason: 'This slug is reserved' };
  return { valid: true };
}

/**
 * Validate a URL
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { generateSlug, validateSlug, validateUrl, RESERVED_SLUGS };

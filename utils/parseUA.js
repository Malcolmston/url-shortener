/**
 * Lightweight UA/referrer/IP parser — no external deps.
 * Privacy-safe: IP is hashed with HMAC-SHA256, never stored raw.
 */
const crypto = require('crypto');

/**
 * Parse a User-Agent string into { device, os, browser }
 * @param {string} ua
 * @returns {{ device: string, os: string, browser: string }}
 */
function parseUserAgent(ua = '') {
  if (!ua) return { device: 'unknown', os: 'Other', browser: 'Other' };

  const s = ua.toLowerCase();

  // --- device ---
  let device = 'desktop';
  if (/bot|crawl|spider|slurp|archive|facebookexternalhit|wget|curl/i.test(ua)) {
    device = 'bot';
  } else if (/tablet|ipad|kindle|silk|playbook/i.test(s)) {
    device = 'tablet';
  } else if (/mobile|android(?!.*tablet)|iphone|ipod|blackberry|windows phone|iemobile|opera mini/i.test(s)) {
    device = 'mobile';
  }

  // --- OS ---
  let os = 'Other';
  if (/windows nt/i.test(ua))         os = 'Windows';
  else if (/mac os x|macos/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua))        os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua))          os = 'Linux';
  else if (/cros/i.test(ua))           os = 'ChromeOS';

  // --- browser (order matters — Edge must come before Chrome) ---
  let browser = 'Other';
  if (/edg\//i.test(ua))              browser = 'Edge';
  else if (/opr\//i.test(ua))         browser = 'Opera';
  else if (/chrome\//i.test(ua))      browser = 'Chrome';
  else if (/firefox\//i.test(ua))     browser = 'Firefox';
  else if (/safari\//i.test(ua))      browser = 'Safari';
  else if (/msie|trident/i.test(ua))  browser = 'IE';
  else if (/curl/i.test(ua))          browser = 'cURL';

  return { device, os, browser };
}

/**
 * Normalise a referrer URL to scheme + host only.
 * Returns null for same-origin or missing referrers.
 * @param {string|undefined} referrer
 * @param {string} host  — current request host
 * @returns {string|null}
 */
function normalizeReferrer(referrer, host = '') {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.host === host) return null; // same-origin — skip
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/**
 * HMAC-SHA256 hash of an IP address using the SESSION secret.
 * This is a one-way pseudonymisation: the same IP always produces the same
 * hash, but the IP cannot be recovered from the hash.
 * @param {string} ip
 * @returns {string}  64-char hex digest
 */
function hashIp(ip = '') {
  const secret = process.env.SESSION || 'analytics-secret';
  return crypto.createHmac('sha256', secret).update(ip).digest('hex');
}

module.exports = { parseUserAgent, normalizeReferrer, hashIp };

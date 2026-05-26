import { createHmac } from 'crypto';

export interface ParsedUA {
  device:  'mobile' | 'tablet' | 'desktop' | 'bot';
  os:      string;
  browser: string;
}

/** Parse a User-Agent string into device/OS/browser without external deps. */
export function parseUserAgent(ua: string): ParsedUA {
  const s = ua.toLowerCase();

  // Device
  let device: ParsedUA['device'] = 'desktop';
  if (/bot|crawl|spider|slurp|googlebot|bingbot/i.test(ua)) device = 'bot';
  else if (/mobile|android(?!.*tablet)|iphone|ipod|blackberry|windows phone/i.test(ua)) device = 'mobile';
  else if (/tablet|ipad|android/i.test(ua)) device = 'tablet';

  // OS
  let os = 'Other';
  if      (/windows nt/i.test(ua))  os = 'Windows';
  else if (/mac os x/i.test(ua))    os = 'macOS';
  else if (/android/i.test(ua))     os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua))       os = 'Linux';
  else if (/cros/i.test(ua))        os = 'ChromeOS';

  // Browser (order matters — check Edge/OPR before Chrome)
  let browser = 'Other';
  if      (s.includes('edg/') || s.includes('edge/')) browser = 'Edge';
  else if (s.includes('opr/')  || s.includes('opera')) browser = 'Opera';
  else if (s.includes('firefox'))  browser = 'Firefox';
  else if (s.includes('chrome'))   browser = 'Chrome';
  else if (s.includes('safari'))   browser = 'Safari';
  else if (s.includes('msie') || s.includes('trident')) browser = 'IE';
  else if (s.includes('curl'))     browser = 'cURL';

  return { device, os, browser };
}

/** Strip path/query from a referrer; return null if same-origin. */
export function normalizeReferrer(ref: string | undefined, host: string): string | null {
  if (!ref) return null;
  try {
    const u = new URL(ref);
    if (u.hostname === host) return null; // same-origin
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** One-way HMAC-SHA256 hash of an IP address using the SESSION secret. */
export function hashIp(ip: string): string {
  const secret = process.env.SESSION ?? 'dev-secret';
  return createHmac('sha256', secret).update(ip).digest('hex');
}

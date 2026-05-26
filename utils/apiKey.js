const crypto = require('crypto');

/**
 * Generate a new API key
 * Returns { rawKey, keyHash, keyPrefix }
 * rawKey is shown once to the user — never stored
 * keyHash is stored in the database
 */
function generateApiKey() {
  const randomBytes = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const rawKey      = `sk_snp_${randomBytes}`;
  const keyHash     = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix   = rawKey.substring(0, 12); // "sk_snp_XXXX"
  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hash a raw key for database lookup
 */
function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

module.exports = { generateApiKey, hashApiKey };

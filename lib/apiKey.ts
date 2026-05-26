import { randomBytes, createHash } from 'crypto';

export interface GeneratedKey {
  rawKey:    string;
  keyHash:   string;
  keyPrefix: string;
}

/** Generate a new API key. Raw key is shown once and never stored. */
export function generateApiKey(): GeneratedKey {
  const raw       = `sk_snp_${randomBytes(32).toString('hex')}`;
  const keyHash   = createHash('sha256').update(raw).digest('hex');
  const keyPrefix = raw.slice(0, 12);
  return { rawKey: raw, keyHash, keyPrefix };
}

/** Hash an existing raw key for lookup. */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

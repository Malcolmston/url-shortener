import { hashApiKey } from '@/lib/apiKey';
import { ApiKey, User } from '@/lib/models';

/**
 * Verify a Bearer API key from the Authorization header.
 * Returns the associated User if valid, or null.
 */
export async function getApiKeyUser(request: Request): Promise<InstanceType<typeof User> | null> {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  const rawKey = auth.slice(7).trim();
  if (!rawKey) return null;

  const keyHash = hashApiKey(rawKey);
  const apiKey = await ApiKey.findOne({
    where: { keyHash, isActive: true },
    include: [{ model: User, as: 'user' }],
  });

  if (!apiKey || (apiKey as any).isExpired()) return null;

  // Update last-used timestamp (fire and forget)
  void ApiKey.update({ lastUsedAt: new Date() }, { where: { id: (apiKey as any).id } });

  return (apiKey as any).user ?? null;
}

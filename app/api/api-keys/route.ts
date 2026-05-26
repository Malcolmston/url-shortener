import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { ApiKey } from '@/lib/models';
import { generateApiKey } from '@/lib/apiKey';
import { err, serverError } from '@/lib/response';

const MAX_KEYS_PER_USER = 20;

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const keys = await ApiKey.findAll({
      where: { userId: sessionUser.id, isActive: true },
      attributes: { exclude: ['keyHash'] },
      order: [['createdAt', 'DESC']],
    });
    return NextResponse.json({ ok: true, keys });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const { label, scopes = [], expiresAt = null } = await request.json();
    if (!label) return err('Label is required');

    // Enforce max keys
    const count = await ApiKey.count({ where: { userId: sessionUser.id, isActive: true } });
    if (count >= MAX_KEYS_PER_USER) return err(`Maximum of ${MAX_KEYS_PER_USER} active API keys allowed`, 400);

    const { rawKey, keyHash, keyPrefix } = generateApiKey();
    const key = await ApiKey.create({
      userId: sessionUser.id,
      keyHash,
      keyPrefix,
      label,
      scopes: JSON.stringify(scopes),
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json({
      ok: true,
      key: {
        id: (key as any).id,
        keyPrefix,
        label,
        scopes,
        createdAt: (key as any).createdAt,
      },
      rawKey, // Shown ONCE — not stored
    }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

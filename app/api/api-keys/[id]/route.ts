import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { ApiKey } from '@/lib/models';
import { ok, notFound, serverError } from '@/lib/response';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await requireUser();
    const key = await ApiKey.findOne({
      where: { id: parseInt(id, 10), userId: sessionUser.id, isActive: true },
    });
    if (!key) return notFound('API key');
    await (key as any).update({ isActive: false });
    await (key as any).destroy();
    return ok({ message: 'API key revoked' });
  } catch (e) {
    return serverError(e);
  }
}

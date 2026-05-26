import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { UserSession } from '@/lib/models';
import { ok, notFound, serverError } from '@/lib/response';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await requireUser();
    const session = await UserSession.findOne({
      where: { id: parseInt(id, 10), userId: sessionUser.id },
    });
    if (!session) return notFound('Session');
    await (session as any).destroy();
    return ok({ message: 'Session revoked' });
  } catch (e) {
    return serverError(e);
  }
}

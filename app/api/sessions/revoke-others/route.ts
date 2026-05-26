import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { UserSession } from '@/lib/models';
import { serverError } from '@/lib/response';

export async function POST() {
  try {
    const sessionUser = await requireUser();
    await UserSession.destroy({ where: { userId: sessionUser.id } });
    return NextResponse.json({ ok: true, message: 'All sessions revoked' });
  } catch (e) {
    return serverError(e);
  }
}

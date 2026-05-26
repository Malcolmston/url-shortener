import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { UserSession } from '@/lib/models';
import { serverError } from '@/lib/response';

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const sessions = await UserSession.findAll({
      where: { userId: sessionUser.id },
      order: [['lastActivityAt', 'DESC']],
      limit: 50,
    });
    return NextResponse.json({ ok: true, sessions });
  } catch (e) {
    return serverError(e);
  }
}

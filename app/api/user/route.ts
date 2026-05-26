import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { User } from '@/lib/models';
import { ok, serverError } from '@/lib/response';

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const user = await User.findOne({
      where: { id: sessionUser.id },
      attributes: { exclude: ['password'] },
    });
    if (!user) return ok({ user: null }, 404);
    const files = await user.getFiles({ raw: true });
    return ok({ ...user.toJSON(), files });
  } catch (e) { return serverError(e); }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const { username, firstname, lastname } = await request.json();
    const user = await User.findByPk(sessionUser.id);
    if (!user) return ok({ user: null }, 404);
    const updates: Record<string, unknown> = {};
    if (username  !== undefined) updates.username  = username;
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname  !== undefined) updates.lastname  = lastname;
    await user.update(updates);
    const refreshed = await User.findOne({ where: { id: user.id }, attributes: { exclude: ['password'] } });
    return ok({ message: 'Profile updated', user: refreshed!.toJSON() });
  } catch (e) { return serverError(e); }
}

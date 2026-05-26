import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { User } from '@/lib/models';
import { ok, err, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { firstname, lastname, username, password } = await request.json();
    if (!firstname || !lastname || !username || !password)
      return err('All fields are required');
    if (password.length < 8)
      return err('Password must be at least 8 characters');

    const existing = await User.findOne({ where: { username }, paranoid: false });
    if (existing && existing.isSoftDeleted()) {
      await existing.restore();
      await existing.update({ firstname, lastname, password });
      const session = await getSession();
      session.user = { id: existing.id, username: existing.username, firstname: existing.firstname, lastname: existing.lastname };
      await session.save();
      return ok({ location: '/dashboard', user: session.user }, 200);
    }
    if (existing) return err('Username already taken', 409);

    // NOTE: User.ts beforeCreate hook bcrypt-hashes the password automatically.
    // Do NOT pre-hash here.
    const user = await User.create({ firstname, lastname, username, password });
    const session = await getSession();
    session.user = { id: user.id, username: user.username, firstname: user.firstname, lastname: user.lastname };
    await session.save();
    return ok({ location: '/dashboard', user: session.user }, 201);
  } catch (e) { return serverError(e); }
}

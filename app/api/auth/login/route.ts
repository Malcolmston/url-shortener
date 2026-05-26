import { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { User } from '@/lib/models';
import { ok, err, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return err('Username and password are required');

    const user = await User.findOne({ where: { username } });
    if (!user) return err('Invalid username or password', 401);
    if (user.isSoftDeleted()) return err('Account is disabled', 403);
    if (!(await user.isValidPassword(password))) return err('Invalid username or password', 401);

    const session = await getSession();
    session.user = { id: user.id, username: user.username, firstname: user.firstname, lastname: user.lastname };
    await session.save();

    return ok({ location: '/dashboard', user: session.user });
  } catch (e) { return serverError(e); }
}

import { getUser } from '@/lib/session';
import { User } from '@/lib/models';
import { ok, unauthorized, serverError } from '@/lib/response';

export async function GET() {
  try {
    const sessionUser = await getUser();
    if (!sessionUser) return unauthorized();
    const user = await User.findOne({ where: { id: sessionUser.id }, attributes: { exclude: ['password'] } });
    if (!user) return unauthorized();
    return ok({ user: user.toJSON() });
  } catch (e) { return serverError(e); }
}

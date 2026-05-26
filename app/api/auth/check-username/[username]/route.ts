import { NextRequest } from 'next/server';
import { User } from '@/lib/models';
import { ok, serverError } from '@/lib/response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const existing = await User.findOne({ where: { username } });
    return ok({ available: !existing });
  } catch (e) { return serverError(e); }
}

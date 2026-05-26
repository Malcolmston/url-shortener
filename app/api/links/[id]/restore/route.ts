import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { Link } from '@/lib/models';
import { ok, notFound, serverError } from '@/lib/response';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const link = await Link.findOne({ where: { id: parseInt(id), userId: user.id }, paranoid: false });
    if (!link) return notFound('Link');
    await link.restore();
    return ok({ message: 'Link restored' });
  } catch (e) { return serverError(e); }
}

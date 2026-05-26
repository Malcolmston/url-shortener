import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { File as FileModel } from '@/lib/models';
import { ok, notFound, serverError } from '@/lib/response';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const file = await FileModel.findOne({ where: { id: parseInt(id), userId: user.id }, paranoid: false });
    if (!file) return notFound('File');
    await file.restore();
    return ok({ message: 'File restored' });
  } catch (e) { return serverError(e); }
}

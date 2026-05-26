import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { File as FileModel } from '@/lib/models';
import { ok, err, notFound, serverError } from '@/lib/response';

type Params = { params: Promise<{ id: string }> };

async function getFile(id: string, userId: number) {
  return FileModel.findOne({ where: { id: parseInt(id), userId }, paranoid: false });
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const file = await getFile(id, user.id);
    if (!file) return notFound('File');
    // Don't return the buffer in JSON — just metadata
    return ok({ file: { id: file.id, uuid: file.uuid, name: file.name, type: file.type, visibility: file.visibility, createdAt: file.createdAt } });
  } catch (e) { return serverError(e); }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const file = await getFile(id, user.id);
    if (!file) return notFound('File');
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name      !== undefined) updates.name       = body.name;
    if (body.visibility !== undefined) updates.visibility = !!body.visibility;
    await file.update(updates);
    return ok({ file: { id: file.id, name: file.name, visibility: file.visibility } });
  } catch (e) { return serverError(e); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const file = await getFile(id, user.id);
    if (!file) return notFound('File');
    await file.destroy();
    return ok({ message: 'File deleted' });
  } catch (e) { return serverError(e); }
}

import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/session';
import { User, File as FileModel } from '@/lib/models';
import { ok, serverError } from '@/lib/response';

// GET /api/files — list authenticated user's files
export async function GET() {
  try {
    const sessionUser = await requireUser();
    const user = await User.findByPk(sessionUser.id);
    if (!user) return ok({ files: [] });
    const files = await user.getFiles({ order: [['createdAt', 'DESC']], paranoid: false });
    return ok({ files: files.map((f: any) => ({
      id: f.id, uuid: f.uuid, name: f.name, type: f.type,
      visibility: f.visibility, createdAt: f.createdAt, deletedAt: f.deletedAt,
    }))});
  } catch (e) { return serverError(e); }
}

// POST /api/files — upload files (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await requireUser();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) return ok({ ok: false, message: 'No files uploaded' }, 400);

    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    const saved: { id: number; name: string; uuid: string; visibility: boolean }[] = [];

    for (const f of files) {
      if (f.size > MAX_SIZE) continue; // skip oversized
      const buffer = Buffer.from(await f.arrayBuffer());
      const record = await FileModel.create({
        name: f.name, file: buffer, type: f.type,
        visibility: true, userId: sessionUser.id,
      });
      saved.push({ id: record.id, name: record.name, uuid: record.uuid, visibility: record.visibility });
    }
    return ok({ message: 'Files uploaded', files: saved }, 200);
  } catch (e) { return serverError(e); }
}

import { NextRequest, NextResponse } from 'next/server';
import mime from 'mime-types';
import { getUser } from '@/lib/session';
import { File as FileModel } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    // Find by uuid (the URL name)
    const file = await FileModel.findOne({ where: { uuid: name } });
    if (!file) return new NextResponse('Not found', { status: 404 });

    if (!file.visibility) {
      const user = await getUser();
      if (!user || user.id !== file.userId) {
        return new NextResponse('Unauthorized', { status: 403 });
      }
    }

    const contentType = mime.lookup(file.name) || 'application/octet-stream';
    return new NextResponse(file.file as Buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.name)}"`,
        'Cache-Control': file.visibility ? 'public, max-age=31536000' : 'private, no-cache',
      },
    });
  } catch {
    return new NextResponse('Server error', { status: 500 });
  }
}

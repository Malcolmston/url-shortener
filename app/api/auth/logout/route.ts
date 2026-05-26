import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ ok: true, message: 'Logged out', location: '/' });
  } catch {
    return NextResponse.json({ ok: true, message: 'Logged out', location: '/' });
  }
}

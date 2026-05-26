import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';

export async function GET() {
  try {
    await sequelize.authenticate();
    return NextResponse.json({ status: 'ready', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { status: 'not_ready', db: 'disconnected', error: String(e) },
      { status: 503 }
    );
  }
}

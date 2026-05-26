import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    name: 'snip',
    version: process.env.npm_package_version ?? '2.0.0',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

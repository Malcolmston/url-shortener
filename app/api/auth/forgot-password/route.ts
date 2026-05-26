import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { User, PasswordResetToken } from '@/lib/models';
import { err, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    if (!username) return err('Username is required');

    const user = await User.findOne({ where: { username } });
    // Always return success to avoid user enumeration
    if (!user) {
      return NextResponse.json({ ok: true, message: 'If that account exists, a reset link has been sent.' });
    }

    // Invalidate any existing tokens for this user
    await PasswordResetToken.destroy({ where: { userId: (user as any).id } });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await PasswordResetToken.create({ userId: (user as any).id, token, expiresAt });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // In production: send email. For now, log the URL.
    console.log(`[Password Reset] User: ${username} | URL: ${resetUrl}`);

    return NextResponse.json({ ok: true, message: 'If that account exists, a reset link has been sent.' });
  } catch (e) {
    return serverError(e);
  }
}

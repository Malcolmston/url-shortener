import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetToken, User } from '@/lib/models';
import { err, serverError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return err('Token and new password are required');
    if (password.length < 8) return err('Password must be at least 8 characters');

    const resetToken = await PasswordResetToken.findOne({ where: { token } });
    if (!resetToken) return err('Invalid or expired reset token', 400);
    if ((resetToken as any).isExpired()) return err('Reset token has expired', 400);
    if ((resetToken as any).isUsed()) return err('Reset token has already been used', 400);

    const user = await User.findByPk((resetToken as any).userId);
    if (!user) return err('User not found', 404);

    // Update password — User.ts beforeUpdate hook will hash it automatically
    await (user as any).update({ password });
    await (resetToken as any).update({ usedAt: new Date() });

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (e) {
    return serverError(e);
  }
}

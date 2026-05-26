import { getIronSession, type IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
}

export interface SessionData {
  user?: SessionUser;
}

export const SESSION_OPTIONS = {
  password: process.env.SESSION ?? 'dev-secret-must-be-at-least-32-chars!!',
  cookieName: 'snip-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
} as const;

/** Get the current session (server-side only). */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

/** Returns the session user or null. */
export async function getUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user ?? null;
}

/** Throws a 401 JSON response if the user is not authenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) {
    throw new Response(
      JSON.stringify({ ok: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return user;
}

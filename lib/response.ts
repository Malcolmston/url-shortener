import { NextResponse } from 'next/server';

/** Success response */
export function ok<T extends object>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/** Error response */
export function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 401 Unauthorized */
export const unauthorized = () => err('Not authenticated', 401);

/** 403 Forbidden */
export const forbidden = () => err('Forbidden', 403);

/** 404 Not Found */
export const notFound = (thing = 'Resource') => err(`${thing} not found`, 404);

/** 500 Internal Server Error */
export const serverError = (e?: unknown) =>
  err(
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : String((e as Error)?.message ?? e),
    500
  );

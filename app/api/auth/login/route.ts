import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, getSelfHostedProfile, SESSION_COOKIE } from '@/lib/selfhost-auth';

export async function POST(request: NextRequest) {
  const configuredPassword = process.env.REMAINDERS_ADMIN_PASSWORD;
  if (!configuredPassword) {
    return NextResponse.json(
      { error: 'REMAINDERS_ADMIN_PASSWORD is not configured' },
      { status: 500 }
    );
  }

  const { password } = await request.json().catch(() => ({ password: '' }));
  if (password !== configuredPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    user: getSelfHostedProfile(),
    userProfile: getSelfHostedProfile(),
  });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

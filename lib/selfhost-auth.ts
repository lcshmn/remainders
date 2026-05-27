import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'remainders_session';

function getSecret() {
  return process.env.REMAINDERS_AUTH_SECRET || process.env.REMAINDERS_ADMIN_PASSWORD || '';
}

export function getAdminUsername() {
  return (process.env.REMAINDERS_USERNAME || 'lucas').toLowerCase();
}

export function createSessionToken() {
  const secret = getSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update('remainders:selfhost:admin').digest('hex');
}

export function isValidSessionToken(token?: string) {
  const expected = createSessionToken();
  if (!token || !expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function isAuthenticated() {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

export function getSelfHostedProfile() {
  const username = getAdminUsername();
  return {
    uid: 'selfhost-admin',
    email: process.env.REMAINDERS_ADMIN_EMAIL || `${username}@localhost`,
    displayName: process.env.REMAINDERS_DISPLAY_NAME || username,
    username,
    role: 'admin',
    plan: 'pro',
    planExpiresAt: null,
  };
}

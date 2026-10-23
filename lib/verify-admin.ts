/**
 * Server-side admin request verification for the single-user self-hosted mode.
 * Only the signed session cookie counts; the Authorization header the admin UI
 * sends is not a credential.
 */

import { NextRequest } from 'next/server';
import { getSelfHostedProfile, isAuthenticated } from '@/lib/selfhost-auth';

export interface AdminCaller {
  uid: string;
}

export async function verifyAdminRequest(_request: NextRequest): Promise<AdminCaller | null> {
  if (!(await isAuthenticated())) return null;

  return { uid: getSelfHostedProfile().uid };
}

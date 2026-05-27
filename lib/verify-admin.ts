/**
 * Server-side admin request verification for the single-user self-hosted mode.
 */

import { NextRequest } from 'next/server';
import { getSelfHostedProfile, isAuthenticated } from '@/lib/selfhost-auth';

export interface AdminCaller {
  uid: string;
}

export async function verifyAdminRequest(request: NextRequest): Promise<AdminCaller | null> {
  const authHeader = request.headers.get('Authorization');
  const hasSelfhostBearer = authHeader === 'Bearer selfhost';
  if (!hasSelfhostBearer && !(await isAuthenticated())) return null;

  return { uid: getSelfHostedProfile().uid };
}

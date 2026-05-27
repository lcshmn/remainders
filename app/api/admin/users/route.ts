import { NextRequest, NextResponse } from 'next/server';
import { getSelfHostedProfile } from '@/lib/selfhost-auth';
import { verifyAdminRequest } from '@/lib/verify-admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = getSelfHostedProfile();
  return NextResponse.json({
    data: [{
      id: profile.uid,
      ...profile,
      createdAt: null,
      lastActiveAt: new Date().toISOString(),
    }],
  });
}

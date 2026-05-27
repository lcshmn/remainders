import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/verify-admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    requests: { '24h': 0, '7d': 0, '30d': 0 },
    users: { '24h': 1, '7d': 1, '30d': 1 },
    anonymous: { '24h': 0, '7d': 0, '30d': 0 },
    topUsers: [],
    daily: [],
  });
}

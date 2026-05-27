import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/verify-admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

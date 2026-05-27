import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/verify-admin';
import { deleteStoredBackground } from '@/lib/selfhost-store';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ backgroundId: string }> }
) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { backgroundId } = await params;
  if (!backgroundId) {
    return NextResponse.json({ error: 'backgroundId is required' }, { status: 400 });
  }

  try {
    await deleteStoredBackground(backgroundId);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

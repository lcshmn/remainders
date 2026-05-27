import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyAdminRequest } from '@/lib/verify-admin';
import { getStoredBackgrounds, saveStoredBackground } from '@/lib/selfhost-store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backgrounds = await getStoredBackgrounds();
  return NextResponse.json({ data: backgrounds });
}

export async function POST(request: NextRequest) {
  const caller = await verifyAdminRequest(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const name = (formData.get('name') as string)?.trim();
  const isFree = formData.get('isFree') === 'true';
  const category = (formData.get('category') as string)?.trim() || 'general';

  if (!file || !name) {
    return NextResponse.json({ error: 'file and name are required' }, { status: 400 });
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, or WebP.' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 5MB.' }, { status: 400 });
  }

  try {
    const backgroundId = `preset_${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `data:${file.type};base64,${buffer.toString('base64')}`;
    const background = {
      id: backgroundId,
      name,
      url,
      thumbnailUrl: url,
      isFree,
      category,
      storagePath: `selfhost:${randomUUID()}`,
      createdAt: new Date(),
    };

    await saveStoredBackground(background);
    return NextResponse.json({ ok: true, id: backgroundId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

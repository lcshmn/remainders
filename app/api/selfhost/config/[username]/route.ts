import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/selfhost-auth';
import { getStoredUserConfig, saveStoredUserConfig } from '@/lib/selfhost-store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const data = await getStoredUserConfig(username);
  return NextResponse.json({ data, error: data ? null : 'Config not found' }, { status: data ? 200 : 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await params;
  const config = await request.json();
  try {
    const data = await saveStoredUserConfig(username, config);
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to save config' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSelfHostedProfile, isAuthenticated } from '@/lib/selfhost-auth';

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({
    authenticated,
    user: authenticated ? getSelfHostedProfile() : null,
    userProfile: authenticated ? getSelfHostedProfile() : null,
  });
}

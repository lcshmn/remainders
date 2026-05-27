/** Returns a self-hosted bearer marker when the admin cookie session exists. */
export async function getAuthToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' });
    const session = await res.json();
    return session.authenticated ? 'selfhost' : null;
  } catch {
    return null;
  }
}

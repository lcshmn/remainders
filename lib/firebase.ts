import type { PresetBackground, UserPlan } from './types';

export const auth: any = undefined;
export const db: any = undefined;
export const storage: any = undefined;

export async function signInWithGoogle() {
  return { user: null, error: 'Google sign-in is disabled in self-hosted mode' };
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST' });
  return { error: null };
}

export function onAuthChange(callback: (user: any | null) => void) {
  fetch('/api/auth/session')
    .then((res) => res.json())
    .then((session) => callback(session.user))
    .catch(() => callback(null));
  return () => {};
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const res = await fetch(`/api/selfhost/config/${encodeURIComponent(username)}`, { cache: 'no-store' });
  return res.status === 404;
}

export async function getUserProfile(_userId?: string) {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  const session = await res.json();
  return { data: session.userProfile, error: session.userProfile ? null : 'Not signed in' };
}

export async function getUserConfigByUsername(username: string) {
  const res = await fetch(`/api/selfhost/config/${encodeURIComponent(username)}`, { cache: 'no-store' });
  if (!res.ok) return { data: null, error: 'Config not found' };
  return res.json();
}

export async function saveUserProfile(
  _userId?: string,
  _username?: string,
  _displayName?: string,
  _email?: string
) {
  return { success: true, error: null };
}

export async function saveUserConfig(username: string, config: any) {
  const res = await fetch(`/api/selfhost/config/${encodeURIComponent(username)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error || 'Failed to save config' };
  }
  return { success: true, error: null };
}

export async function getAvailablePlugins(_userId?: string) {
  return { data: [], error: null };
}

export async function getPlugin(_pluginId?: string) {
  return { data: null, error: 'Custom plugin marketplace is disabled in self-hosted mode' };
}

export async function applyPendingKofiGrant(
  _userId?: string,
  _email?: string,
  _username?: string
): Promise<boolean> {
  return true;
}

export function subscribeToUserProfile(_userId: string, callback: (data: any | null) => void): () => void {
  fetch('/api/auth/session')
    .then((res) => res.json())
    .then((session) => callback(session.userProfile))
    .catch(() => callback(null));
  return () => {};
}

export async function updateLastActive(): Promise<void> {}

export async function uploadUserBackground(
  _userId: string,
  file: File
): Promise<{ url: string; storagePath: string; error: string | null }> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { url: '', storagePath: '', error: 'Invalid file type. Use JPG, PNG, or WebP.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: '', storagePath: '', error: 'File size must be under 5MB.' };
  }

  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

  return { url, storagePath: `selfhost:${file.name}`, error: null };
}

export async function deleteUserBackground(_storagePath?: string): Promise<{ error: string | null }> {
  return { error: null };
}

export async function getPresetBackgrounds(): Promise<{ data: PresetBackground[]; error: string | null }> {
  const res = await fetch('/api/admin/backgrounds', { cache: 'no-store' });
  if (!res.ok) return { data: [], error: 'Failed to load backgrounds' };
  return res.json();
}

export async function adminGetAllUsers(): Promise<{ data: any[]; error: string | null }> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  const session = await res.json();
  return { data: session.userProfile ? [session.userProfile] : [], error: null };
}

export async function adminUpdateUserPlan(
  _userId: string,
  _plan: UserPlan,
  _username?: string,
  _expiresAt?: Date | null
): Promise<{ error: string | null }> {
  return { error: null };
}

export async function adminClearUserBackground(_username?: string): Promise<void> {}

export async function adminUploadPresetBackground(
  _file?: File,
  _name?: string,
  _isFree?: boolean,
  _category?: string
): Promise<{ error: string | null }> {
  return { error: 'Preset background management is disabled in self-hosted mode' };
}

export async function adminDeletePresetBackground(
  _backgroundId?: string,
  _storagePath?: string
): Promise<{ error: string | null }> {
  return { error: 'Preset background management is disabled in self-hosted mode' };
}

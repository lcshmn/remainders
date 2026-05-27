import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { UserConfig } from '@/lib/types';

const DATA_DIR = process.env.REMAINDERS_DATA_DIR || '/data';

function sanitizeUsername(username: string) {
  return username.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}

function configPath(username: string) {
  return path.join(DATA_DIR, 'configs', `${sanitizeUsername(username)}.json`);
}

export async function getStoredUserConfig(username: string): Promise<UserConfig | null> {
  try {
    const raw = await fs.readFile(configPath(username), 'utf8');
    return JSON.parse(raw) as UserConfig;
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export async function saveStoredUserConfig(username: string, config: Partial<UserConfig>) {
  const cleaned = sanitizeUsername(username);
  const file = configPath(cleaned);
  await fs.mkdir(path.dirname(file), { recursive: true });

  const existing = await getStoredUserConfig(cleaned);
  const data = {
    ...existing,
    ...config,
    userId: config.userId || existing?.userId || 'selfhost-admin',
    username: cleaned,
    role: 'admin',
    plan: 'pro',
    planExpiresAt: null,
    updatedAt: new Date(),
  };

  await fs.writeFile(file, JSON.stringify(data, null, 2));
  return data as unknown as UserConfig;
}

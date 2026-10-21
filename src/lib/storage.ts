import fs from 'fs';
import path from 'path';
import os from 'os';
import { GuestRegistration } from '@/types/checkin';

// Import seed checkins bundled directly into Next.js build
import defaultSeedCheckins from '../../data/checkins.json';

// Declare global memory cache for warm serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __HOTEL_CHECKINS_CACHE__: GuestRegistration[] | undefined;
}

// Local project path (used in local development)
const localDataDir = path.join(process.cwd(), 'data');
const localFilePath = path.join(localDataDir, 'checkins.json');

// Writable /tmp path (guaranteed writable on Vercel / AWS Lambda / Serverless)
const tmpFilePath = path.join(os.tmpdir(), 'hotel_checkins.json');

/**
 * Safely parse JSON string into GuestRegistration array
 */
function safeParse(content: string): GuestRegistration[] | null {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as GuestRegistration[];
    }
  } catch (err) {
    console.warn('[Storage] Failed to parse JSON content:', err);
  }
  return null;
}

/**
 * Safely write data to /tmp file
 */
function tryWriteTmp(data: GuestRegistration[]) {
  try {
    const dir = path.dirname(tmpFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] Could not write to /tmp:', err);
  }
}

/**
 * Safely write data to local data folder (silently ignores EROFS in serverless environments)
 */
function tryWriteLocal(data: GuestRegistration[]) {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: any) {
    // EROFS (Read-only file system) is expected on Vercel/serverless environments.
    // Suppress error so it does not fail the API call.
    if (err?.code === 'EROFS' || err?.message?.includes('read-only')) {
      return;
    }
    console.warn('[Storage] Could not write to local file path:', err);
  }
}

/**
 * Ensure local directory & seed file exist if writable
 */
function ensureDataFile() {
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    if (!fs.existsSync(localFilePath)) {
      const seed = (defaultSeedCheckins as unknown as GuestRegistration[]) || [];
      fs.writeFileSync(localFilePath, JSON.stringify(seed, null, 2), 'utf-8');
    }
  } catch (err: any) {
    // Ignore read-only errors on serverless
    if (err?.code === 'EROFS' || err?.message?.includes('read-only')) {
      return;
    }
  }
}

/**
 * Reads checkins from the fastest and most reliable source:
 * 1. Global in-memory cache
 * 2. /tmp/hotel_checkins.json (writable disk)
 * 3. Local project checkins.json
 * 4. Bundled seed data
 */
export function getCheckins(): GuestRegistration[] {
  // 1. Check in-memory cache
  if (globalThis.__HOTEL_CHECKINS_CACHE__ && Array.isArray(globalThis.__HOTEL_CHECKINS_CACHE__)) {
    return globalThis.__HOTEL_CHECKINS_CACHE__;
  }

  // 2. Check /tmp/hotel_checkins.json
  try {
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = safeParse(data);
      if (parsed && parsed.length > 0) {
        globalThis.__HOTEL_CHECKINS_CACHE__ = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Error reading /tmp cache:', err);
  }

  // 3. Check local project file
  try {
    ensureDataFile();
    if (fs.existsSync(localFilePath)) {
      const data = fs.readFileSync(localFilePath, 'utf-8');
      const parsed = safeParse(data);
      if (parsed && parsed.length > 0) {
        globalThis.__HOTEL_CHECKINS_CACHE__ = parsed;
        tryWriteTmp(parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Error reading local file path:', err);
  }

  // 4. Fallback to bundled seed data
  const fallback = (defaultSeedCheckins as unknown as GuestRegistration[]) || [];
  globalThis.__HOTEL_CHECKINS_CACHE__ = fallback;
  tryWriteTmp(fallback);
  return fallback;
}

/**
 * Saves a new checkin record, prepending it to the list
 */
export function saveCheckin(registration: GuestRegistration): GuestRegistration[] {
  const current = getCheckins();
  // Filter out any duplicate id
  const updated = [registration, ...current.filter((item) => item.id !== registration.id)];

  // Update in-memory cache immediately
  globalThis.__HOTEL_CHECKINS_CACHE__ = updated;

  // Persist to writable /tmp
  tryWriteTmp(updated);

  // Persist to local project if writable (localhost)
  tryWriteLocal(updated);

  return updated;
}

/**
 * Updates an existing checkin record
 */
export function updateCheckin(id: string, updates: Partial<GuestRegistration>): GuestRegistration[] {
  const current = getCheckins();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));

  // Update in-memory cache immediately
  globalThis.__HOTEL_CHECKINS_CACHE__ = updated;

  // Persist to writable /tmp
  tryWriteTmp(updated);

  // Persist to local project if writable (localhost)
  tryWriteLocal(updated);

  return updated;
}

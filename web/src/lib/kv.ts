import { kv } from '@vercel/kv';
import { Insight } from './types';

/**
 * Get personal insight for an application
 */
export async function getInsight(appId: number): Promise<Insight | null> {
  const key = `insight:${appId}`;
  const data = await kv.get(key);
  return data as Insight | null;
}

/**
 * Save personal insight for an application
 */
export async function setInsight(appId: number, insight: Insight): Promise<void> {
  const key = `insight:${appId}`;
  await kv.set(key, insight);
}

/**
 * Delete insight (rarely used)
 */
export async function deleteInsight(appId: number): Promise<void> {
  const key = `insight:${appId}`;
  await kv.del(key);
}

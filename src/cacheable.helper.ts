import { Cache } from 'cache-manager';
import * as serialize from 'serialize-javascript';
import { CacheKeyBuilder } from './cacheable.interface';
import { createHash } from 'crypto';

let cacheManager: Cache | undefined;
export function setCacheManager(m: Cache) {
  cacheManager = m;
}
export function getCacheManager() {
  return cacheManager;
}

/**
 * try extract valid key from build function or fixed string
 */
function extract(keyBuilder: CacheKeyBuilder | string, args: any[]) {
  if (keyBuilder instanceof Function) {
    return keyBuilder(...args);
  }
  return keyBuilder;
}
/**
 * generateComposedKey
 * generate the final cache key, compose of use key and namespace(option), like 'namespace:key'
 */
export function generateComposedKey(options: {
  key?: string | CacheKeyBuilder;
  namespace?: string | CacheKeyBuilder;
  methodName: string;
  args: any[];
}) {
  let key: string;
  if (options.key) {
    key = extract(options.key, options.args);
  } else {
    const hash = createHash('md5')
      .update(serialize(options.args))
      .digest('hex');
    key = `${options.methodName}@${hash}`;
  }
  const namespace =
    options.namespace && extract(options.namespace, options.args);
  return namespace ? `${namespace}:${key}` : key;
}

const pendingCacheMap = new Map<string, Promise<any>>();
async function fetchCachedValue(key: string) {
  let pendingCachePromise = pendingCacheMap.get(key);
  if (!pendingCachePromise) {
    pendingCachePromise = getCacheManager().get(key);
    pendingCacheMap.set(key, pendingCachePromise);
  }
  let value;
  try {
    value = await pendingCachePromise;
  } catch (e) {
    throw e;
  } finally {
    pendingCacheMap.delete(key);
  }
  return value;
}

const pendingMethodCallMap = new Map<string, Promise<any>>();
export async function cacheableHandle(
  key: string,
  method: () => Promise<any>,
  ttl?: number,
) {
  try {
    const cachedValue = await fetchCachedValue(key);
    if (cachedValue !== undefined && cachedValue !== null) return cachedValue;
  } catch {}
  let pendingMethodCallPromise = pendingMethodCallMap.get(key);
  if (!pendingMethodCallPromise) {
    pendingMethodCallPromise = method();
    pendingMethodCallMap.set(key, pendingMethodCallPromise);
  }
  let value;
  try {
    value = await pendingMethodCallPromise;
  } catch (e) {
    throw e;
  } finally {
    pendingMethodCallMap.delete(key);
  }
  await cacheManager.set(key, value, ttl);
  return value;
}

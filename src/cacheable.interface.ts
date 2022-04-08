export type CacheKeyBuilder = (...args: any) => string;

export interface CacheableRegisterOptions {
  key?: string | CacheKeyBuilder;
  namespace?: string | CacheKeyBuilder;
  ttl?: number;
}
export interface CacheEvictRegisterOptions {
  key?: string | CacheKeyBuilder;
  namespace?: string | CacheKeyBuilder;
}

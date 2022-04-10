export type CacheKeyBuilder = (...args: any[]) => string;

export interface CacheableRegisterOptions {
  key?: string | CacheKeyBuilder;
  namespace?: string | CacheKeyBuilder;
  ttl?: number;
}
export type CacheEvictKeyBuilder = (...args: any[]) => string | string[];
export interface CacheEvictRegisterOptions {
  key?: string | CacheEvictKeyBuilder;
  namespace?: string | CacheKeyBuilder;
}

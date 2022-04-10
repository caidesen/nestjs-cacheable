import {
  cacheableHandle,
  generateComposedKey,
  getCacheManager,
} from './cacheable.helper';
import {
  CacheableRegisterOptions,
  CacheEvictRegisterOptions,
} from './cacheable.interface';

export function Cacheable(options: CacheableRegisterOptions): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod = descriptor.value as unknown as Function;
    return {
      ...descriptor,
      value: async function (...args: any[]) {
        const cacheManager = getCacheManager();
        if (!cacheManager) return originalMethod.apply(this, args);
        const composeOptions: Parameters<typeof generateComposedKey>[0] = {
          methodName: String(propertyKey),
          key: options.key,
          namespace: options.namespace,
          args,
        };
        const cacheKey = generateComposedKey(composeOptions);
        return cacheableHandle(
          cacheKey[0],
          () => originalMethod.apply(this, args),
          options.ttl,
        );
      } as any,
    };
  };
}

export function CacheEvict(
  ...options: CacheEvictRegisterOptions[]
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod = descriptor.value as unknown as Function;
    return {
      ...descriptor,
      value: async function (...args: any[]) {
        let value;
        try {
          value = await originalMethod();
        } catch (e) {
          throw e;
        } finally {
          try {
            await Promise.all(
              options.map((it) => {
                const cacheKey = generateComposedKey({
                  ...it,
                  methodName: propertyKey as string,
                  args,
                });
                if (Array.isArray(cacheKey))
                  return Promise.all(
                    cacheKey.map((it) => getCacheManager().del(it)),
                  );
                return getCacheManager().del(cacheKey);
              }),
            );
          } catch {}
        }
        return value;
      } as any,
    };
  };
}

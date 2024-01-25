import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cacheable, CacheEvict } from '../src';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  @Cacheable({
    key: (id: number) => `username-${id}`,
    namespace: 'user',
    ttl: 1000,
  })
  async getUserName(id: number) {
    await this.wait(100);
    return `xyz$${id}`;
  }

  @CacheEvict({
    key: (id: number) => `username-${id}`,
    namespace: 'user',
  })
  async resetUserInfo(id: number) {
    return true;
  }

  @CacheEvict({
    key: (ids: number[]) => ids.map((it) => `username-${it}`),
    namespace: 'user',
  })
  async resetUserInfos(ids: number[]) {
    return true;
  }
}

import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Cacheable } from '../src';
import { CacheEvict } from '../src';

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
  })
  async getUserName(id: number) {
    await this.wait(100);
    return `xyz`;
  }

  @CacheEvict({
    key: (id: number) => `username-${id}`,
    namespace: 'user',
  })
  async resetUserInfo(id: number) {
    return true;
  }
}

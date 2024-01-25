import { DynamicModule, Inject, Module } from '@nestjs/common';
import {
  setCacheManager,
  setCacheManagerIsv5OrGreater,
} from './cacheable.helper';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { loadPackage } from '@nestjs/common/utils/load-package.util';

@Module({})
export class CacheableModule {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    const cacheManagerPackage = loadPackage(
      'cache-manager',
      'CacheableModule',
      () => require('cache-manager'),
    );
    setCacheManagerIsv5OrGreater('memoryStore' in cacheManagerPackage);
    setCacheManager(this.cacheManager);
  }

  static register(): DynamicModule {
    return {
      module: CacheableModule,
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { CacheableModule } from '../src';
import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { Cache } from 'cache-manager';

describe('App', () => {
  let appService: AppService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        CacheableModule.register(),
        CacheModule.register({ isGlobal: true }),
      ],
      providers: [AppService],
    }).compile();
    await app.createNestApplication().init();
    appService = app.get<AppService>(AppService);
    cacheManager = app.get<Cache>(CACHE_MANAGER);
  });

  describe('main', () => {
    it('cache eq return', async () => {
      const res = await appService.getUserName(1);
      const cachedValue = await cacheManager.get('user:username-1');
      expect(res).toBe(cachedValue);
    });
    it('cache evict', async () => {
      const res = await appService.getUserName(1);
      const cachedValue = await cacheManager.get('user:username-1');
      expect(res).toBe(cachedValue);
      await appService.resetUserInfo(1);
      expect(await cacheManager.get('user:username-1')).toBeUndefined();
    });
    it('multiple cache key evict', async () => {
      for (let i = 0; i < 2; i++) {
        const res = await appService.getUserName(i);
        const cachedValue = await cacheManager.get(`user:username-${i}`);
        expect(res).toBe(cachedValue);
      }
      await appService.resetUserInfos([0, 1]);
      expect(await cacheManager.get('user:username-0')).toBeUndefined();
      expect(await cacheManager.get('user:username-1')).toBeUndefined();
    });
  });
});

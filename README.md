# nestjs-cacheable

## Description

a simple service level cache module in NestJs.

Caching is a great technique for your app's performance. NestJs provides a CacheModule in @nestjs/common, it only
support controller level cache. In practice, often happens services inner function call, we also need service level
cache.

Before that, you can be handled manually inside a function in service, that is great, but tedious.

This package use decorator handle service level cache.

It all becomes simple!

## Installation

```bash
$ npm install nestjs-cacheable
$ yarn add nestjs-cacheable
```

## How to use

This package based on CacheModule, you mush import CacheModule in your application.
All cache action based on CacheModule and cache-manager, you can use any cache store, as long as them supported.

```typescript
import { Module } from "@nestjs/common";
import { CacheModule } from '@nestjs/common';
@Module({
  imports: [
    CacheableModule.register(),
    CacheModule.register({ isGlobal: true }),
  ],
})
export class AppModule {}
```

```typescript
@Injectable()
export class UserService {
  // Cacheable will cache function return value
  @Cacheable({
    key: (id: number) => `username-${id}`,
    namespace: 'user',
    ttl: 5
  })
  async getUserName(id: number) {
    const res = await this.db.query({
      // ...
    });
    return res;
  }
  
  // CacheEvict will clear the cache at the end of function run.
  @CacheEvict({
    key: (id: number) => `username-${id}`,
    namespace: 'user',
  })
  async deleteUser(id: number) {
    await this.db.delete({
      // ...
    })
  }
}
```

## License

[MIT licensed](LICENSE).

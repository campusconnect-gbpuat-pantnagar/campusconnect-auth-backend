import { RedisRepositoryInterface } from './redis.interface';
import { Redis } from 'ioredis';
export class RedisService implements RedisRepositoryInterface {
  private _redisClient: Redis;
  constructor(redisClient: Redis) {
    this._redisClient = redisClient;
  }

  async get(prefix: string, key: string): Promise<string | null> {
    return this._redisClient.get(`${prefix}:${key}`);
  }

  async set(prefix: string, key: string, value: string): Promise<void> {
    this._redisClient.set(`${prefix}:${key}`, value);
  }

  async delete(prefix: string, key: string): Promise<void> {
    this._redisClient.del(`${prefix}:${key}`);
  }

  async setWithExpiry(prefix: string, key: string, value: string, expiry: number): Promise<void> {
    this._redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }
}

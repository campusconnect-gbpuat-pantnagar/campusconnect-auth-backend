import Redis from './dal.redis';
import { RedisEntityInterface } from './redis.entity';

export class RedisService implements RedisEntityInterface {
  private readonly redisClient = Redis;
  constructor() {}

  async get(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }

  async set(prefix: string, key: string, value: string): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value);
  }

  async delete(prefix: string, key: string): Promise<void> {
    await this.redisClient.del(`${prefix}:${key}`);
  }
  async deleteAll(prefix: string, pattern: string): Promise<void> {
    const client = this.redisClient;
    const keys = await client.keys(`${prefix}:${pattern}`);
    for (const key of keys) {
      await client.del(key);
    }
  }

  async setWithExpiry(prefix: string, key: string, value: string, expiry: number): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }
}

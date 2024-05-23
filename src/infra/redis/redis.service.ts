import redisClient from './dal.redis';
import { RedisEntityInterface } from './redis.entity';

async function get(prefix: string, key: string): Promise<string | null> {
  return redisClient.get(`${prefix}:${key}`);
}

async function set(prefix: string, key: string, value: string): Promise<void> {
  await redisClient.set(`${prefix}:${key}`, value);
}

async function deleteOne(prefix: string, key: string) {
  await redisClient.del(`${prefix}:${key}`);
}

async function deleteAll(prefix: string, pattern: string): Promise<void> {
  const client = redisClient;
  const keys = await client.keys(`${prefix}:${pattern}`);
  for (const key of keys) {
    await client.del(key);
  }
}

async function setWithExpiry(prefix: string, key: string, value: string, expiry: number): Promise<void> {
  await redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
}

export { setWithExpiry, set, deleteAll, deleteOne, get };

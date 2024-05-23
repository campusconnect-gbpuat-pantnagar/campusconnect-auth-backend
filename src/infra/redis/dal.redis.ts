import { getConfig } from '@/config';
import logger from '@/lib/logger';
import Redis from 'ioredis';

const redis = new Redis({
  host: getConfig().REDIS_CACHE_DB_HOST,
  port: getConfig().REDIS_CACHE_DB_PORT,
  username: getConfig().REDIS_CACHE_DB_USER,
  password: getConfig().REDIS_CACHE_DB_PASS,
});

export default redis;

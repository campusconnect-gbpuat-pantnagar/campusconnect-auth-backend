import { getConfig } from '@/config';
import logger from '@/lib/logger';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: getConfig().REDIS_CACHE_DB_HOST,
  port: getConfig().REDIS_CACHE_DB_PORT,
  username: getConfig().REDIS_CACHE_DB_USER,
  password: getConfig().REDIS_CACHE_DB_PASS,
});

redisClient.on('connect', () => {
  console.log('Client connected to redis...');
});

redisClient.on('ready', () => {
  console.log('Client connected to redis and ready to use...');
});

redisClient.on('error', (err) => {
  console.log(err.message);
});

redisClient.on('end', () => {
  console.log('Client disconnected from redis');
});

process.on('SIGINT', () => {
  redisClient.quit();
});

export default redisClient;

import { getConfig } from '../../config';
import { RedisClient } from './dal.redis';
import { RedisService } from './redis.service';

// Creating Redis clients for different URLs
const redisClient1 = RedisClient.getInstance(getConfig().CAMPUSCONNECT_REDIS1_URL, '1');
const redisClient2 = RedisClient.getInstance(getConfig().CAMPUSCONNECT_REDIS2_URL, '2');

// Creating RedisService instances with different clients
// const redisService1 = new RedisService(redisClient1);
// const redisService2 = new RedisService(redisClient2);

export { redisClient1, redisClient2 };

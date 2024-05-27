import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { RedisService } from '@/infra/redis/redis.service';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { IUserDoc, NewRegisteredUser } from '@/infra/mongodb/models';
import mongoose, { Mongoose } from 'mongoose';

export class RefreshTokenController extends Api {
  constructor() {
    super();
  }

  public getUserPresence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {};
}

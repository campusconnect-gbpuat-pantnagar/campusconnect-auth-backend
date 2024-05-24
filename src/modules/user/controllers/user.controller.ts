import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { RedisService } from '@/infra/redis/redis.service';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { IUserDoc, NewRegisteredUser } from '@/infra/mongodb/models';
import { UserService } from '../services/user.service';
import mongoose, { Mongoose } from 'mongoose';

export class UserController extends Api {
  private readonly _redisService1: RedisService;
  private readonly _userService: UserService;
  constructor() {
    super();
    this._redisService1 = new RedisService(redisClient1);
    this._userService = new UserService();
  }

  public getUserPresence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = '664fe9bc4cb42fca1015c0f1';
      const userlastActivePresenceInRedis = await this._redisService1.get(REDIS_ENUM.USERNAME_PRESENCE, `${userId}`);
      const userPresenceDetails =
        userlastActivePresenceInRedis &&
        (JSON.parse(userlastActivePresenceInRedis) as unknown as Pick<
          IUserDoc,
          'gbpuatEmail' | 'gbpuatId' | 'lastActive'
        > & { mongoLastActivePresence: string });

      if (!userPresenceDetails) {
        return this.send(
          res,
          {
            user: {
              presence: false,
            },
          },
          `user ${userId} is offline`,
        );
      }

      this.send(
        res,
        {
          user: {
            presence: true,
          },
        },
        `user ${userPresenceDetails.gbpuatId} is online`,
      );
    } catch (err) {
      next(err);
    }
  };
  public updateUserPresence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = '664fe9bc4cb42fca1015c0f1';
      const userLastActivePresenceInRedis = await this._redisService1.get(REDIS_ENUM.USERNAME_PRESENCE, userId);
      let userPresenceDetails:
        | (Pick<IUserDoc, 'gbpuatEmail' | 'gbpuatId' | 'lastActive'> & { mongoLastActivePresence?: string })
        | null = null;

      if (userLastActivePresenceInRedis) {
        userPresenceDetails = JSON.parse(userLastActivePresenceInRedis) as unknown as Pick<
          IUserDoc,
          'gbpuatEmail' | 'gbpuatId' | 'lastActive'
        > & { mongoLastActivePresence: string };
      }

      if (!userPresenceDetails) {
        const updatedUserInMongodb = await this._userService.updateUserLastActive(new mongoose.Types.ObjectId(userId));
        if (updatedUserInMongodb) {
          userPresenceDetails = {
            gbpuatEmail: updatedUserInMongodb.gbpuatEmail,
            gbpuatId: updatedUserInMongodb.gbpuatId,
            lastActive: updatedUserInMongodb.lastActive,
            mongoLastActivePresence: updatedUserInMongodb.lastActive.toISOString(),
          };

          await this._redisService1.setWithExpiry(
            REDIS_ENUM.USERNAME_PRESENCE,
            userId,
            JSON.stringify(userPresenceDetails),
            30,
          );
        }
      }

      const currentTime = Date.now();
      const lastActivePresence = new Date(userPresenceDetails!.lastActive).getTime();
      const lastActivePresenceInMongodb = new Date(userPresenceDetails!.mongoLastActivePresence!).getTime();

      // Update Redis presence with every request
      await this._redisService1.setWithExpiry(
        REDIS_ENUM.USERNAME_PRESENCE,
        userId,
        JSON.stringify(userPresenceDetails),
        30,
      );

      // Check if MongoDB presence needs to be updated (every 10 minutes)
      if (currentTime - lastActivePresenceInMongodb > 30 * 60 * 1000) {
        const updatedUserInMongodb = await this._userService.updateUserLastActive(new mongoose.Types.ObjectId(userId));
        userPresenceDetails!.lastActive = updatedUserInMongodb!.lastActive;
        userPresenceDetails!.mongoLastActivePresence = updatedUserInMongodb!.lastActive.toUTCString();
      }

      return this.send(res, null, 'User online presence updated');
    } catch (err) {
      next(err);
    }
  };
}

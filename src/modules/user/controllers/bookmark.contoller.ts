import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { RedisService } from '@/infra/redis/redis.service';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { IUserDoc, NewRegisteredUser } from '@/infra/mongodb/models';
import { UserService } from '../services/user.service';
import mongoose, { Mongoose } from 'mongoose';
import ApiError from '@/exceptions/http.exception';
import { HttpStatusCode } from '@/enums';
import { BookmarkService } from '@/modules/bookmark/bookmark.service';

export class BookmarkController extends Api {
  private readonly _redisService1: RedisService;
  private readonly _bookmarkService: BookmarkService;
  constructor() {
    super();
    this._redisService1 = new RedisService(redisClient1);
    this._bookmarkService = new BookmarkService();
  }

  public addUserBookmarks: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role, gbpuatId } = req.user!;
      const { type, resourceId } = req.body;
      const bookmarks = await this._bookmarkService.addUserBookmark(id, type, resourceId);
      this.send(res, { bookmarks }, `${type} ${resourceId} added to bookmarks successfully.`);
    } catch (err) {
      next(err);
    }
  };
  public removeUserBookmarks: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role, gbpuatId } = req.user!;
      const { type, resourceId } = req.body;
      const bookmarks = await this._bookmarkService.removeUserBookmark(id, type, resourceId);
      this.send(res, { bookmarks }, `${type} ${resourceId} remove from  bookmarks successfully.`);
    } catch (err) {
      next(err);
    }
  };
  public getUserBookmarks: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role, gbpuatId } = req.user!;

      const bookmarks = await this._bookmarkService.findAllBookmarksByUserId(id);
      this.send(res, { bookmarks }, `users all bookmarks.`);
    } catch (err) {
      next(err);
    }
  };
}

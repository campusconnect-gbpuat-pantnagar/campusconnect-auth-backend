import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { UserController } from './controllers/user.controller';
import logger from '@/lib/logger';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import validate from '@/middlewares/validation.middleware';
import { userPresenceDto } from './dtos/user-presence.dto';

export class UserRoute implements Route {
  public readonly path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
    logger.debug('User Module initialized');
  }
  private initializeRoutes() {
    // this.router.get(`${this.path}/me`, AuthMiddleware, this.userController.getUserProfile);

    // this.router.get(`${this.path}/bookmarks`, AuthMiddleware, this.userController.getUserBookmarks);

    // this.router.post(`${this.path}/bookmarks`, AuthMiddleware, this.userController.addUserBookmarks);

    // this.router.patch(`${this.path}/bookmarks`, AuthMiddleware, this.userController.updateUserBookmarks);

    this.router.get(`${this.path}/presence`, AuthMiddleware, this.userController.updateUserPresence);

    this.router.get(
      `${this.path}/presence/:username`,
      validate(userPresenceDto),
      AuthMiddleware,
      this.userController.getUserPresence,
    );
  }
}

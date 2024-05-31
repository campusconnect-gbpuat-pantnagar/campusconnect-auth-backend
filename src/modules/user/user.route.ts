import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { UserController } from './controllers/user.controller';
import logger from '@/lib/logger';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import validate from '@/middlewares/validation.middleware';
import { userPresenceDto } from './dtos/user-presence.dto';
import { addAndRemoveBookmarksDto } from './dtos/user-bookmark.dto';
import { BoomarkController } from './controllers/bookmark.contoller';

export class UserRoute implements Route {
  public readonly path = '/users';
  public router = Router();
  public userController = new UserController();
  public boomarkController = new BoomarkController();

  constructor() {
    this.initializeRoutes();
    logger.info('User Module initialized');
  }
  private initializeRoutes() {
    this.router.get(`${this.path}/me`, AuthMiddleware, this.userController.getCurrentUserProfile);
    this.router.get(`${this.path}/profile/:username`, this.userController.getUserProfile);

    this.router.get(`${this.path}/bookmarks`, AuthMiddleware, this.boomarkController.getUserBookmarks);

    this.router.post(
      `${this.path}/bookmarks`,
      AuthMiddleware,
      validate(addAndRemoveBookmarksDto),
      this.boomarkController.addUserBookmarks,
    );

    this.router.patch(
      `${this.path}/bookmarks`,
      AuthMiddleware,
      validate(addAndRemoveBookmarksDto),
      this.boomarkController.removeUserBookmarks,
    );

    this.router.post(`${this.path}/presence`, AuthMiddleware, this.userController.updateUserPresence);

    this.router.get(
      `${this.path}/presence/:username`,
      AuthMiddleware,
      validate(userPresenceDto),
      this.userController.getUserPresence,
    );

    // ✅ TODO: Implement route for sending connections request to user
    this.router.post(`${this.path}/send-connection/:userId`, AuthMiddleware, this.userController.sendConnectionRequest);

    // ✅ TODO: Implement route for accepting connections request of user
    this.router.post(
      `${this.path}/accept-connection/:userId`,
      AuthMiddleware,
      this.userController.acceptConnectionRequest,
    );

    // ✅ TODO: Implement route for rejecting connections request of user
    this.router.post(
      `${this.path}/reject-connection/:userId`,
      AuthMiddleware,
      this.userController.rejectConnectionRequest,
    );

    //  ✅ TODO: Implement route for removing connections request of user
    this.router.post(`${this.path}/remove-connection/:userId`, AuthMiddleware, this.userController.removeConnection);
  }
}

import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { UserController } from './controllers/user.controller';
import logger from '@/lib/logger';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import validate from '@/middlewares/validation.middleware';
import { userPresenceDto } from './dtos/user-presence.dto';
import { addAndRemoveBookmarksDto } from './dtos/user-bookmark.dto';
import { BookmarkController } from './controllers/bookmark.contoller';
import { sendConnectionDto } from './dtos/send-connection.dto';
import { acceptConnectionDto } from './dtos/accept-connection.dto';
import { rejectConnectionDto } from './dtos/reject-connection.dto';
import { removeConnectionDto } from './dtos/remove-connection.dto';

export class UserRoute implements Route {
  public readonly path = '/users';
  public router = Router();
  public userController = new UserController();
  public bookmarkController = new BookmarkController();

  constructor() {
    this.initializeRoutes();
    logger.info('User Module initialized');
  }
  private initializeRoutes() {
    this.router.get(`${this.path}/me`, AuthMiddleware, this.userController.getCurrentUserProfile);
    this.router.get(`${this.path}/profile/:username`, this.userController.getUserProfile);

    this.router.get(`${this.path}/bookmarks`, AuthMiddleware, this.bookmarkController.getUserBookmarks);

    this.router.post(
      `${this.path}/bookmarks`,
      AuthMiddleware,
      validate(addAndRemoveBookmarksDto),
      this.bookmarkController.addUserBookmarks,
    );

    this.router.patch(
      `${this.path}/bookmarks`,
      AuthMiddleware,
      validate(addAndRemoveBookmarksDto),
      this.bookmarkController.removeUserBookmarks,
    );

    this.router.post(`${this.path}/presence`, AuthMiddleware, this.userController.updateUserPresence);

    this.router.get(
      `${this.path}/presence/:username`,
      AuthMiddleware,
      validate(userPresenceDto),
      this.userController.getUserPresence,
    );

    //  route for sending connections request to user
    this.router.post(
      `${this.path}/send-connection/:userId`,
      AuthMiddleware,
      validate(sendConnectionDto),
      this.userController.sendConnectionRequest,
    );

    //  route for accepting connections request of user
    this.router.post(
      `${this.path}/accept-connection/:userId`,
      AuthMiddleware,
      validate(acceptConnectionDto),
      this.userController.acceptConnectionRequest,
    );

    //  route for rejecting connections request of user
    this.router.post(
      `${this.path}/reject-connection/:userId`,
      AuthMiddleware,
      validate(rejectConnectionDto),
      this.userController.rejectConnectionRequest,
    );

    //    route for removing connections request of user
    this.router.post(
      `${this.path}/remove-connection/:userId`,
      AuthMiddleware,
      validate(removeConnectionDto),
      this.userController.removeConnection,
    );

    //    route for setting account for deletion period
    this.router.post(`${this.path}/account-deletion`, AuthMiddleware, this.userController.setAccountDeletion);

    // route for getting users connectionLists,receivedConnections,sentConnections for my network page
    // this.router.get(`${this.path}/my-network`, AuthMiddleware, this.userController.getUserNetwork);

    // route for update user account
    // this.router.patch(`${this.path}/account`, AuthMiddleware, this.userController.updateUserAccount);

    // route for connections suggestion
    // this.router.get(`${this.path}/suggestions`, AuthMiddleware, this.userController.getConnectionsSuggestions);

    // route for searching the user
    // this.router.get(`${this.path}/search/:username`, AuthMiddleware, this.userController.getUserByUsername);
  }
}

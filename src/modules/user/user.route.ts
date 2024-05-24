import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { UserController } from './controllers/user.controller';
import logger from '@/lib/logger';

export class UserRoute implements Route {
  public readonly path = '/users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
    logger.debug('User Module initialized');
  }
  private initializeRoutes() {
    this.router.get(`${this.path}/presence`, this.userController.updateUserPresence);
    this.router.get(`${this.path}/presence/:userId`, this.userController.getUserPresence);
  }
}

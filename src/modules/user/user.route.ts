import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { UserController } from './controllers/user.controller';

export class UserRoute implements Route {
  public readonly path = '/users';
  public router = Router();
  public authController = new UserController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // this.router.get(`${this.path}/signup`, this.authController.signupHandler);
  }
}

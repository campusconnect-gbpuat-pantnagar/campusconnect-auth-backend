import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import { ValidationPipe } from '../../middlewares/request-validation.middleware';
import { AuthController } from './controllers/auth.controller';

export class AuthRoute implements Route {
  public readonly path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}/signup`, this.authController.AuthHandler);
  }
}

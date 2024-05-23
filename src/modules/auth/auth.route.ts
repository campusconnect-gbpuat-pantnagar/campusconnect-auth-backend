import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import validate from '../../middlewares/validation.middleware';
import { AuthController } from './controllers/auth.controller';
import { registerDto } from './dtos/auth.register.dto';
import { loginDto } from './dtos/auth.login.dto';

export class AuthRoute implements Route {
  public readonly path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, validate(registerDto), this.authController.registerUser);
    this.router.post(`${this.path}/signin`, validate(loginDto), this.authController.loginUser);
    // this.router.post(`${this.path}/logout`, this.authController.signupHandler);
    // this.router.post(`${this.path}/forgot-password`, this.authController.signupHandler);
    // this.router.post(`${this.path}/reset-password`, this.authController.signupHandler);
    // this.router.post(`${this.path}/verify-email`, this.authController.signupHandler);
    // this.router.post(`${this.path}/send-verification-email`, this.authController.signupHandler);
  }
}

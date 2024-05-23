import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import validate from '../../middlewares/validation.middleware';
import { AuthController } from './controllers/auth.controller';
import { registerDto } from './dtos/auth.register.dto';
import { loginDto } from './dtos/auth.login.dto';
import { sendVerificationEmailDto } from './dtos/auth.send-verification-email.dto';
import { usernameDto } from './dtos/auth.username.dto';

export class AuthRoute implements Route {
  public readonly path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/check-username/:username`,
      validate(usernameDto),
      this.authController.checkUsernameAvailability,
    );
    this.router.post(`${this.path}/signup`, validate(registerDto), this.authController.registerUser);
    this.router.post(`${this.path}/signin`, validate(loginDto), this.authController.loginUser);
    this.router.post(
      `${this.path}/send-verification-email`,
      validate(sendVerificationEmailDto),
      this.authController.sendVerificationEmail,
    );
  }
}

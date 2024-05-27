import { Router } from 'express';
import type { Route } from '../../interfaces/route.interface';
import validate from '../../middlewares/validation.middleware';
import { AuthController } from './controllers/auth.controller';
import { registerDto } from './dtos/auth.register.dto';
import { loginDto } from './dtos/auth.login.dto';
import { verifyEmailDto } from './dtos/auth.verify-email.dto';
import { usernameDto } from './dtos/auth.username.dto';
import { sendVerificationEmailDto } from './dtos/auth.send-verification-email.dto copy';
import logger from '@/lib/logger';

export class AuthRoute implements Route {
  public readonly path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
    logger.debug('Auth Module initialized');
  }
  private initializeRoutes() {
    this.router.get(
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
    this.router.post(`${this.path}/verify-email`, validate(verifyEmailDto), this.authController.verifyEmail);
  }
}

// ✅ TODO:
// 1. implement refresh token route for refreshing the tokens access token and refresh token.
//

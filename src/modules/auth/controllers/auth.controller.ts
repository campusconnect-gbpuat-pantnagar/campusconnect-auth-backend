import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { UserService } from '@/modules/user/services/user.service';
import { AuthService } from '../services/auth.service';

export class AuthController extends Api {
  private readonly _userService: UserService;
  private readonly _authService: AuthService;
  constructor() {
    super();
    this._userService = new UserService();
    this._authService = new AuthService();
  }

  public registerUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this._userService.registerUser(req.body);
      this.send(res, { user }, 'user created successfully');
    } catch (err) {
      next(err);
    }
  };
  public loginUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const user = await this._authService.loginUserWithUsernameAndPassword(username, password);
      // If gbpuatEmail is not verified then send them an email
      // if  verified then send tokens
      // ✅ TODO: Implement tokens functionality
      this.send(res, { user }, 'user created successfully');
    } catch (err) {
      next(err);
    }
  };
}

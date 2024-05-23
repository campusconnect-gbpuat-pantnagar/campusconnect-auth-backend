import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { UserService } from '@/modules/user/services/user.service';

export class AuthController extends Api {
  private readonly _authService: UserService;
  constructor() {
    super();
    this._authService = new UserService();
  }

  public signupHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this._authService.registerUser(req.body);
      this.send(res, user, 'user created successfully');
    } catch (err) {
      next(err);
    }
  };
}

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
      if (user.username) {
        await this._authService.addUsernameToRedis(user.username, {
          gbpuatId: user.gbpuatId,
          gbpuatEmail: user.gbpuatEmail,
        });
      }
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

  public sendVerificationEmail: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gbpuatEmail } = req.body;
      const user = await this._authService.sendVerificationEmail(gbpuatEmail);
      this.send(res, null, `Email Sent successfully to your mail ${user?.gbpuatEmail}`);
    } catch (err) {
      next(err);
    }
  };
  public checkUsernameAvailability: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      console.log(username);
      const isUsernameAvailable = await this._authService.isUsernameAvailable(username);
      this.send(
        res,
        { isUsernameAvailable },
        isUsernameAvailable ? `${username} is available.` : `Username ${username} is not available.`,
      );
    } catch (err) {
      next(err);
    }
  };
  public verifyEmail: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { gbpuatEmail, otp } = req.body;
      console.log(gbpuatEmail, otp);
      const user = await this._authService.verifyEmail(gbpuatEmail, otp);
      this.send(res, { user }, `account verification completed successfully`);
    } catch (err) {
      next(err);
    }
  };
}

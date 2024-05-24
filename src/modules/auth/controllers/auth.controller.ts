import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { UserService } from '@/modules/user/services/user.service';
import { AuthService } from '../services/auth.service';
import { HttpStatusCode } from '@/enums';

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
      // ✅ TODO: Implement  for sending the email notification  for verification of user email
      this.send(res, { user }, 'user created successfully', HttpStatusCode.CREATED);
    } catch (err) {
      next(err);
    }
  };
  public loginUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const user = await this._authService.loginUserWithUsernameAndPassword(username, password);
      // ✅ TODO : Implementation for  temporary blocked user  -> your account will be unblocked shortly.
      if (user.isTemporaryBlocked) {
        const lastActiveTime = new Date(user.lastActive).getTime();
        const sixHoursInMilliseconds = 6 * 60 * 60 * 1000;
        const unblockTime = lastActiveTime + sixHoursInMilliseconds;
        const currentTime = new Date().getTime();
        const remainingTime = unblockTime - currentTime;

        const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        return this.send(
          res,
          {
            user: {
              isTemporaryBlocked: user.isTemporaryBlocked,
            },
          },
          `Your account will be unblocked in approximately ${remainingHours} hour(s), ${remainingMinutes} minute(s), and ${remainingSeconds} second(s).`,
        );
      }

      // ✅ TODO : Implementation for  permanent blocked user  -> Your Account is Blocked contact admin.
      if (user.isPermanentBlocked) {
        return this.send(
          res,
          {
            user: {
              isPermanentBlocked: user.isPermanentBlocked,
            },
          },
          'Your account is permanently blocked. Please contact the admin for assistance.',
        );
      }

      // ✅ TODO : Handling maximum login attempts
      // ✅ TODO : Handling for user which has deleted his account ->  move user to reopen-account page for consent -> if User
      // ✅ TODO Handling if email is not verified

      // If gbpuatEmail is not verified then send them an email
      // if  verified then send tokens
      // ✅ TODO: Implement tokens functionality
      this.send(res, { user }, 'user login successfully');
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

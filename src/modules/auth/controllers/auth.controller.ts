import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { UserService } from '@/modules/user/services/user.service';
import { AuthService } from '../services/auth.service';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { addDays, format } from 'date-fns';
import { CryptoService } from '@/helpers/crypto.service';

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
      // // ✅ TODO : Handling maximum login attempts
      if (this._authService.isAccountBlocked(user) && user.failedLogin) {
        const blockedMinutesLeft = this._authService.getBlockedMinutesLeft(user.failedLogin.lastFailedAttempt);
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          `Account blocked, Please try again after ${blockedMinutesLeft} minutes`,
        );
      }

      // ✅  Handling for user which has deleted his account ->  move user to reopen-account page for consent -> if User
      if (user.isDeleted) {
        // Calculate the account deletion date
        const accountDeletedDate = addDays(new Date(user.lastActive), 30);

        // Format the date as "Month date, year"
        const formattedDate = format(accountDeletedDate, 'MMMM d, yyyy');

        return this.send(
          res,
          {
            user: { username: user.username, isDeleted: user.isDeleted, gbpuatEmail: user.gbpuatEmail },
          },
          `Your requested to delete ${user.username}. If you want to keep it, you have until ${formattedDate} to let us know. Otherwise, all your information will be deleted.`,
        );
      }

      // ✅  Implementation for  permanent blocked user  -> Your Account is Blocked contact admin.
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

      // ✅  Implementation for  temporary blocked user  -> your account will be unblocked shortly.
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

      // ✅  Handling if email is not verified
      if (!user.isEmailVerified) {
        return this.send(
          res,
          {
            user: {
              gbpuatEmail: user.gbpuatEmail,
              gbpuatId: user.gbpuatId,
              isEmailVerified: user.isEmailVerified,
            },
          },
          `Please verify your email ${user.gbpuatEmail}`,
        );
      }

      // if  verified then send tokens
      // ✅ TODO: Implement tokens functionality
      const { access_token, access_token_expires_at, refresh_token, refresh_token_expires_at } =
        await this._authService.getTokens(user);

      res.cookie('access_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('access_token_expires_at', access_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token_expires_at', refresh_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      const tokens = { access_token, access_token_expires_at };
      this.send(res, { user, tokens }, 'user login successfully');
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
      // console.log(gbpuatEmail, otp);
      const user = await this._authService.verifyEmail(gbpuatEmail, otp);
      // if  verified then send tokens
      // ✅ TODO: Implement tokens functionality
      const { access_token, access_token_expires_at, refresh_token, refresh_token_expires_at } =
        await this._authService.getTokens(user!);

      res.cookie('access_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('access_token_expires_at', access_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token_expires_at', refresh_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      const tokens = { access_token, access_token_expires_at };
      this.send(res, { user, tokens }, `account verification completed successfully`);
    } catch (err) {
      next(err);
    }
  };
  public keepAccount: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const user = await this._authService.loginUserWithUsernameAndPassword(username, password);
      // // ✅ TODO : Handling maximum login attempts
      if (this._authService.isAccountBlocked(user) && user.failedLogin) {
        const blockedMinutesLeft = this._authService.getBlockedMinutesLeft(user.failedLogin.lastFailedAttempt);
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          `Account blocked, Please try again after ${blockedMinutesLeft} minutes`,
        );
      }

      // ✅  Handling for user which has deleted his account ->  move user to reopen-account page for consent -> if User
      if (!user.isDeleted) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, 'FORBIDDEN');
      }
      // ✅  Implementation for  permanent blocked user  -> Your Account is Blocked contact admin.
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

      // ✅  Implementation for  temporary blocked user  -> your account will be unblocked shortly.
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
      // recover the user account from isDeleted

      const updatedUser = await this._userService.updateUserByGbpuatEmail(
        { gbpuatEmail: user.gbpuatEmail },
        {
          isDeleted: false,
        },
      );
      // console.log(updatedUser);

      // if  verified then send tokens
      // ✅ TODO: Implement tokens functionality
      const { access_token, access_token_expires_at, refresh_token, refresh_token_expires_at } =
        await this._authService.getTokens(user);

      res.cookie('access_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('access_token_expires_at', access_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token', refresh_token, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      res.cookie('refresh_token_expires_at', refresh_token_expires_at, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION,
      });

      const tokens = { access_token, access_token_expires_at };
      this.send(res, { user: { ...updatedUser }, tokens }, 'user login successfully');
    } catch (err) {
      next(err);
    }
  };
}

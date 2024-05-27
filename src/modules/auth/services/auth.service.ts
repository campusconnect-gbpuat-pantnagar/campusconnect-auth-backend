import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/infra/mongodb/models';
import User from '@/infra/mongodb/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { UserService } from '@/modules/user/services/user.service';
import mongoose from 'mongoose';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { CryptoService, JwtPayloadInterface } from '@/helpers/crypto.service';
import { RedisService } from '@/infra/redis/redis.service';
import { redisClient1, redisClient2 } from '@/infra/redis/redis-clients';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Queue } from 'bullmq';
import { EMAIL_AUTH_NOTIFICATION_QUEUE, JobPriority, QueueEventJobPattern, VerifyOtpJob } from '@/queues';
import { EMAIL_APP_NOTIFICATION_QUEUE } from '@/queues/app.notification.queue';
import logger from '@/lib/logger';
import { RefreshTokenService } from '@/modules/refresh-token/refresh-token.service';

export class AuthService {
  private BLOCKED_PERIOD_IN_MINUTES = 5;
  private MAX_LOGIN_ATTEMPTS = 5;
  private _user = User;
  private readonly _userService: UserService;
  private readonly _refreshTokenService: RefreshTokenService;
  private readonly _cryptoService: CryptoService;
  private readonly _redisService1: RedisService;
  private readonly _redisService2: RedisService;
  private readonly EMAIL_AUTH_NOTIFICATION_QUEUE: Queue;
  constructor() {
    this._userService = new UserService();
    this._refreshTokenService = new RefreshTokenService();
    this._cryptoService = new CryptoService();
    this._redisService1 = new RedisService(redisClient1);
    this._redisService2 = new RedisService(redisClient2);
    this.EMAIL_AUTH_NOTIFICATION_QUEUE = EMAIL_AUTH_NOTIFICATION_QUEUE;
  }
  /**
   * Login with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IUserDoc>}
   */
  public async loginUserWithUsernameAndPassword(username: string, password: string): Promise<IUserDoc> {
    const user = await this._userService.getUserByUsername(username);

    if (!user) {
      /**
       * maxWaitTime and minWaitTime(millisecond) are used to mimic the delay for server response times
       * received for existing users flow
       */
      const maxWaitTime = 110;
      const minWaitTime = 90;
      const randomWaitTime = Math.floor(Math.random() * (maxWaitTime - minWaitTime) + minWaitTime);
      await new Promise((resolve) => setTimeout(resolve, randomWaitTime)); // will wait randomly for the chosen time to sync response time
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'Invalid username or password');
    }
    const isMatched = await user.isPasswordMatch(password);
    if (!isMatched) {
      const failedAttempts = await this.updateFailedAttempts(user!);
      const remainingAttempts = Math.max(this.MAX_LOGIN_ATTEMPTS - failedAttempts, 0);
      console.log(remainingAttempts);
      if (remainingAttempts === 0 && user.failedLogin) {
        const blockedMinutesLeft = this.getBlockedMinutesLeft(user.failedLogin.lastFailedAttempt);
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          `Account blocked, Please try again after ${blockedMinutesLeft} minutes`,
        );
      }

      if (remainingAttempts < 3) {
        throw new ApiError(
          HttpStatusCode.UNAUTHORIZED,
          `Incorrect email or password provided. ${remainingAttempts} Attempts left`,
        );
      }
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'Invalid username or password');
    }
    return user;
  }

  public async sendVerificationEmail(gbpuatEmail: string) {
    const user = await this._userService.getUserByGbpuatEmail(gbpuatEmail);
    if (!user) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'UNAUTHORIZED');
    }
    const newOtp = await this._cryptoService.otpGenerator();
    const hashData = `${gbpuatEmail}${newOtp}`;

    const hash = await this._cryptoService.generateOtpHash(hashData);

    // console.log(newOtp, hash);
    const eventData: VerifyOtpJob['data'] = {
      email: gbpuatEmail,
      name: user.firstName,
      otp: newOtp,
    };

    // ✅  Implement the queue service and send the email to the user mail box
    await this.EMAIL_AUTH_NOTIFICATION_QUEUE.add(
      QueueEventJobPattern.VERIFY_OTP,
      { ...eventData },
      { priority: JobPriority.HIGHEST },
    );

    await this._redisService2.setWithExpiry(
      `${REDIS_ENUM.EMAIL_VERIFICATION}`,
      `${user.gbpuatEmail}:${hash}`,
      JSON.stringify({ newOtp, gbpuatEmail }),
      REDIS_TTL_ENUM.FIVE_MINUTES,
    );

    return user;
  }
  public async addUsernameToRedis(username: string, userBody: Pick<NewRegisteredUser, 'gbpuatEmail' | 'gbpuatId'>) {
    await this._redisService1.set(`${REDIS_ENUM.USERNAME_AVAILABLE}`, `${username}`, JSON.stringify({ ...userBody }));
  }
  public async isUsernameAvailable(username: string) {
    const user = await this._redisService1.get(`${REDIS_ENUM.USERNAME_AVAILABLE}`, `${username}`);
    const jsonUser = user && (JSON.parse(user) as unknown as Pick<NewRegisteredUser, 'gbpuatEmail' | 'gbpuatId'>);
    // console.log(user);
    if (!jsonUser || !jsonUser.gbpuatEmail) {
      return true;
    }

    return false;
  }
  public async verifyEmail(gbpuatEmail: string, otp: number) {
    const hashData = `${gbpuatEmail}${otp}`;

    const hash = await this._cryptoService.generateOtpHash(hashData);
    // console.log(`${gbpuatEmail}${hash}`);
    const isEmail = await this._redisService2.get(`${REDIS_ENUM.EMAIL_VERIFICATION}`, `${gbpuatEmail}:${hash}`);
    const isEmailValid = isEmail && (JSON.parse(isEmail) as unknown as { gbpuatEmail: string; otp: number });
    // console.log(isEmail);
    if (!isEmailValid) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'Invalid OTP (One time password)');
    }

    const user = await this._userService.updateUserByGbpuatEmail({ gbpuatEmail }, { isEmailVerified: true });
    // console.log(user);
    return user;
  }

  private getTimeDiffForAttempt(lastFailedAttempt: string) {
    // console.log('getTimeDiffForAttempt');
    const now = new Date();
    // console.log(parseISO('2024-05-24T13:11:09.256Z'), lastFailedAttempt);
    // const formattedLastAttempt = parseISO(lastFailedAttempt);
    // console.log(now, lastFailedAttempt);
    const diff = differenceInMinutes(now, lastFailedAttempt);
    return diff;
  }

  public getBlockedMinutesLeft(lastFailedAttempt: string) {
    const diff = this.getTimeDiffForAttempt(lastFailedAttempt);
    // console.log(diff);
    return this.BLOCKED_PERIOD_IN_MINUTES - diff;
  }
  public isAccountBlocked(user: IUserDoc) {
    const lastFailedAttempt = user?.failedLogin?.lastFailedAttempt;
    if (!lastFailedAttempt) return false;
    // console.log('isAccountBlocked');

    const diff = this.getTimeDiffForAttempt(lastFailedAttempt);

    return (
      user?.failedLogin && user?.failedLogin?.times >= this.MAX_LOGIN_ATTEMPTS && diff < this.BLOCKED_PERIOD_IN_MINUTES
    );
  }

  private async updateFailedAttempts(user: IUserDoc) {
    const now = new Date();
    let times = user?.failedLogin?.times ?? 1;
    const lastFailedAttempt = user?.failedLogin?.lastFailedAttempt;
    // console.log('updateFailedAttempts');
    // console.log(user.failedLogin?.lastFailedAttempt);
    if (lastFailedAttempt) {
      const diff = this.getTimeDiffForAttempt(lastFailedAttempt);
      times = diff < this.BLOCKED_PERIOD_IN_MINUTES ? times + 1 : 1;
    }
    await this._userService.updateFailedAttempts(user.id, times, now);
    return times;
  }

  public async getTokens(user: JwtPayloadInterface) {
    const access_token = await this._cryptoService.generateAccessToken(user);
    const refresh_token = await this._cryptoService.generateRefreshToken(user);

    // ✅ TODO: save refresh token to mongodb
    await this._refreshTokenService.createRefreshToken({ userId: user.id, refreshToken: refresh_token });
    // console.log('access_token', access_token);
    // console.log('\nrefresh_token', refresh_token);
    const refresh_token_expiration = getConfig().JWT_REFRESH_TOKEN_COOKIE_EXPIRATION;
    const acess_token_expiration = getConfig().JWT_ACCESS_TOKEN_COOKIE_EXPIRATION;
    const access_token_expires_at = new Date(Date.now() + Number(acess_token_expiration));
    const refresh_token_expires_at = new Date(Date.now() + Number(refresh_token_expiration));
    return {
      access_token,
      access_token_expires_at,
      refresh_token,
      refresh_token_expires_at,
    };
  }
}

import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/infra/mongodb/models';
import User from '@/infra/mongodb/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { UserService } from '@/modules/user/services/user.service';
import mongoose from 'mongoose';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { CryptoService } from '@/helpers/crypto.service';
import { RedisService } from '@/infra/redis/redis.service';
import { redisClient1, redisClient2 } from '@/infra/redis/redis-clients';

export class AuthService {
  private _user = User;
  private readonly _userService: UserService;
  private readonly _cryptoService: CryptoService;
  private readonly _redisService1: RedisService;
  private readonly _redisService2: RedisService;
  constructor() {
    this._userService = new UserService();
    this._cryptoService = new CryptoService();
    this._redisService1 = new RedisService(redisClient1);
    this._redisService2 = new RedisService(redisClient2);
  }
  /**
   * Login with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IUserDoc>}
   */
  public async loginUserWithUsernameAndPassword(username: string, password: string): Promise<IUserDoc> {
    const user = await this._userService.getUserByUsername(username);
    if (!user || !(await user.isPasswordMatch(password))) {
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

    console.log(newOtp, hash);
    // ✅ TODO : Implement the queue service and send the email to the user mail box

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
    console.log(user);
    if (!jsonUser || !jsonUser.gbpuatEmail) {
      return true;
    }

    return false;
  }
  public async verifyEmail(gbpuatEmail: string, otp: number) {
    const hashData = `${gbpuatEmail}${otp}`;

    const hash = await this._cryptoService.generateOtpHash(hashData);
    console.log(`${gbpuatEmail}${hash}`);
    const isEmail = await this._redisService2.get(`${REDIS_ENUM.EMAIL_VERIFICATION}`, `${gbpuatEmail}:${hash}`);
    const isEmailValid = isEmail && (JSON.parse(isEmail) as unknown as { gbpuatEmail: string; otp: number });
    console.log(isEmail);
    if (!isEmailValid) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'Invalid OTP (One time password)');
    }

    const user = await this._userService.getUserByGbpuatEmail(gbpuatEmail);
    return user;
  }
}

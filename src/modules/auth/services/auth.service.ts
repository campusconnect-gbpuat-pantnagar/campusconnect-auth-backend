import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/infra/mongodb/models';
import User from '@/infra/mongodb/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { UserService } from '@/modules/user/services/user.service';
import mongoose from 'mongoose';
import { setWithExpiry } from '@/infra/redis/redis.service';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { OtpService } from '@/helpers/otp.service';

export class AuthService {
  private _user = User;
  private readonly _userService: UserService;
  private readonly _otpService: OtpService;
  constructor() {
    this._userService = new UserService();
    this._otpService = new OtpService();
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
    const newOtp = await this._otpService.otpGenerator();
    console.log(newOtp);
    // ✅ TODO : Implement the queue service and send the email to the user mail box
    // setWithExpiry(
    //   REDIS_ENUM.EMAIL_VERIFICATION,
    //   `${user.gbpuatEmail}:${newOtp}`,
    //   JSON.stringify({ newOtp, gbpuatEmail }),
    //   REDIS_TTL_ENUM.FIVE_MINUTES,
    // );
    // ADD TO CACHE

    return user;
  }
}

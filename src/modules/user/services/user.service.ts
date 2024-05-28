import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/infra/mongodb/models';
import User from '@/infra/mongodb/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import { RedisService } from '@/infra/redis/redis.service';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { REDIS_ENUM } from '@/utils/redis.constants';

export class UserService {
  private _user = User;
  private readonly _redisService1: RedisService;
  constructor() {
    this._redisService1 = new RedisService(redisClient1);
  }

  /**
   * Create a user
   * @param {NewCreatedUser} userBody
   * @returns {Promise<IUserDoc>}
   */
  public async createUser(userBody: NewCreatedUser): Promise<IUserDoc> {
    if (await this._user.isEmailTaken(userBody.gbpuatEmail)) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'email is already taken');
    }
    return this._user.create(userBody);
  }
  /**
   * Register a user
   * @param {NewRegisteredUser} userBody
   * @returns {Promise<IUserDoc>}
   */
  public async registerUser(userBody: NewRegisteredUser): Promise<IUserDoc> {
    if (await this._user.isEmailTaken(userBody.gbpuatEmail)) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'Email already taken');
    }
    return this._user.create(userBody);
  }
  /**
   * Get user by id
   * @param {mongoose.Types.ObjectId} id
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserById(id: mongoose.Types.ObjectId): Promise<IUserDoc | null> {
    return this._user.findById(id);
  }

  /**
   * Get user by username
   * @param {string} id
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByUsername(username: string): Promise<IUserDoc | null> {
    return this._user.findOne({ username });
  }

  /**
   * Get user by gbpuatId
   * @param {number} gbpuatId
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByGbpuatId(gbpuatId: number): Promise<IUserDoc | null> {
    return this._user.findOne({ gbpuatId });
  }
  /**
   * Get user by gbpuatEmail
   * @param {string} gbpuatEmail
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByGbpuatEmail(gbpuatEmail: string): Promise<IUserDoc | null> {
    return this._user.findOne({ gbpuatEmail });
  }
  /**
   * update User by gbpuatEmail
   * @param {filter}
   * @param {update}
   * @returns {Promise<IUserDoc | null>}
   */
  public async updateUserByGbpuatEmail(
    filter: FilterQuery<IUserDoc>,
    update: UpdateQuery<IUserDoc>,
  ): Promise<IUserDoc | null> {
    const updatedUser = await this._user
      .findOneAndUpdate(
        filter,
        { $set: update },
        { new: true }, // This option returns the updated document
      )
      .exec();
    return updatedUser ? updatedUser.toJSON() : null;
  }

  /**
   * Update the User last Active timestamp in the database
   * @param {string} userId
   * @returns {Promise<IUserDoc | null>}
   */
  public async updateUserLastActive(userId: mongoose.Types.ObjectId): Promise<IUserDoc | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, 'User not found');
    }
    const updateUserLastActive = await this._user.findByIdAndUpdate(
      userId,
      {
        $set: { lastActive: new Date() },
      },
      { new: true },
    );

    return updateUserLastActive;
  }

  /**
   * Update the User updateFailed login  Attempts in the database
   * @param {string} userId
   * @returns {Promise<IUserDoc | null>}
   */

  public async updateFailedAttempts(
    userId: mongoose.Types.ObjectId,
    times: number,
    lastFailedAttempt: Date,
  ): Promise<IUserDoc | null> {
    const updateUserLastActive = await this._user.findByIdAndUpdate(
      userId,
      {
        $set: {
          failedLogin: {
            times,
            lastFailedAttempt: lastFailedAttempt,
          },
        },
      },
      { new: true },
    );

    return updateUserLastActive;
  }
}

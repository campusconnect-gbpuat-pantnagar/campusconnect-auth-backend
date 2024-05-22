import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/dal/models';
import User from '@/dal/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import mongoose from 'mongoose';

export class UserService {
  private _user = User;
  constructor() {}
  /**
   * Create a user
   * @param {NewCreatedUser} userBody
   * @returns {Promise<IUserDoc>}
   */
  public async createUser(userBody: NewCreatedUser): Promise<IUserDoc> {
    if (await this._user.isEmailTaken(userBody.gbpuatEmail)) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'Email already taken');
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
}

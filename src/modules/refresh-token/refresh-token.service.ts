import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import { UserService } from '../user/services/user.service';
import RefreshToken from '../../infra/mongodb/models/refresh-token/refresh-token.schema';
import ApiError from '../../exceptions/http.exception';
import { IRefreshToken, IRefreshTokenDoc } from '../../infra/mongodb/models/refresh-token/refresh-token.entity';
import { HttpStatusCode } from '../../enums';

export class RefreshTokenService {
  private _refreshToken = RefreshToken;
  private readonly _userService: UserService;

  constructor() {
    this._userService = new UserService();
  }

  /**
   *get User By Refresh Token for user
   * @param {string} refreshToken
   * @returns {Promise<IRefreshTokenDoc>}
   */
  public async getUserByRefreshToken(refresh_token: string) {
    const tokenDoc = await this._refreshToken.findOne({ refreshToken: refresh_token });
    if (!tokenDoc) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'refresh token not found');
    }
    const user = await this._userService.getUserById(tokenDoc.userId);

    return user;
  }
  /**
   * create  Refresh Token for user
   * @param {IRefreshToken} data
   * @returns {Promise<IRefreshTokenDoc>}
   */
  public async createRefreshToken(data: IRefreshToken): Promise<IRefreshTokenDoc> {
    const newRefreshToken = await this._refreshToken.create(data);
    return newRefreshToken;
  }
  /**
   * Delete Refresh Token of user
   * @param {IRefreshToken} data
   * @returns {Promise<void>}
   */
  public async deleteRefreshToken(data: IRefreshToken): Promise<void> {
    const isRefreshTokenExist = await this._refreshToken.findOne({
      userId: data.userId,
      refreshToken: data.refreshToken,
    });

    if (!isRefreshTokenExist) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'refresh token not found');
    }
    const newRefreshToken = await this._refreshToken.deleteOne({
      userId: data.userId,
      refreshToken: data.refreshToken,
    });
  }
  /**
   * Delete Refresh Token of user
   * @param {IRefreshToken} data
   * @returns {Promise<void>}
   */
  public async deleteAllRefreshTokenByUser(userId: string): Promise<void> {
    const deleteAllRefreshTokenBelongToUser = await this._refreshToken.deleteMany({
      userId,
    });
  }
}

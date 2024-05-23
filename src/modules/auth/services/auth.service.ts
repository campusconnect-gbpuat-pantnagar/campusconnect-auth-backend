import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/dal/models';
import User from '@/dal/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import { UserService } from '@/modules/user/services/user.service';
import mongoose from 'mongoose';

export class AuthService {
  private _user = User;
  private readonly _userService: UserService;
  constructor() {
    this._userService = new UserService();
  }
  /**
   * Login with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IUserDoc>}
   */
  public async loginUserWithUsernameAndPassword(username: string, password: string): Promise<IUserDoc> {
    const user = await this._userService.getUserByUsername(username);
    console.log(user);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, 'Invalid username or password');
    }
    return user;
  }
}

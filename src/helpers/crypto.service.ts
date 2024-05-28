import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { IUserDoc } from '../infra/mongodb/models';
import { getConfig } from '../config';

export type JwtPayloadInterface = Pick<IUserDoc, 'gbpuatId' | 'id' | 'role'>;
export class CryptoService {
  public async otpGenerator() {
    const newotp: number = crypto.randomInt(100000, 999999);
    return newotp;
  }
  public async generateOtpHash(data: string) {
    const valueWithSecret = (data + getConfig().ARGON_OTP_SECRET_PEPPER) as string;
    const hashed = await bcrypt.hash(valueWithSecret, getConfig().ARGON_OTP_SECRET_PEPPER);
    return hashed;
  }
  public async verifyHash(otphashed: string, data: string) {
    const valueWithSecret = (data + getConfig().ARGON_OTP_SECRET_PEPPER) as string;
    const isValid = await bcrypt.compare(otphashed, valueWithSecret);
    return isValid;
  }

  public async generateAccessToken(user: JwtPayloadInterface) {
    const options: jwt.SignOptions = {
      algorithm: 'HS256',
      expiresIn: getConfig().JWT_ACCESS_TOKEN_EXPIRATION,
      issuer: 'CampusConnect',
      audience: `user_${user.id}`,
      subject: 'accessToken',
    };
    const payload: JwtPayloadInterface = {
      gbpuatId: user.gbpuatId,
      id: user.id,
      role: user.role,
    };
    const accessToken = jwt.sign(payload, getConfig().JWT_ACCESS_TOKEN_SECRET, options);
    return accessToken;
  }
  public async generateRefreshToken(user: JwtPayloadInterface) {
    const options: jwt.SignOptions = {
      algorithm: 'HS256',
      expiresIn: getConfig().JWT_REFRESH_TOKEN_EXPIRATION,
      issuer: 'CampusConnect',
      audience: `user_${user.id}`,
      subject: 'refreshToken',
    };
    const payload: JwtPayloadInterface = {
      gbpuatId: user.gbpuatId,
      id: user.id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, getConfig().JWT_REFRESH_TOKEN_SECRET, options);
    return accessToken;
  }

  public async verifyAccessToken(token: string) {
    const options: jwt.SignOptions = {
      algorithm: 'HS256',
      issuer: 'CampusConnect',
    };

    const decoded = jwt.verify(token, getConfig().JWT_ACCESS_TOKEN_SECRET, options) as JwtPayloadInterface;

    return decoded;
  }

  public async verifyRefreshToken(token: string) {
    const options: jwt.SignOptions = {
      algorithm: 'HS256',
      issuer: 'CampusConnect',
    };

    const decoded = jwt.verify(token, getConfig().JWT_REFRESH_TOKEN_SECRET, options) as JwtPayloadInterface;

    return decoded;
  }
}

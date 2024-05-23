import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { getConfig } from '@/config';
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
}

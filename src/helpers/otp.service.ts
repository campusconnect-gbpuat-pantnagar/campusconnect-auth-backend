import crypto from 'crypto';

export class OtpService {
  public async otpGenerator() {
    const newotp: number = crypto.randomInt(100000, 999999);
    return newotp;
  }
}

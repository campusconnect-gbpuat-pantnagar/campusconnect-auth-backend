import { QueueEventJobPattern } from './job.pattern';

export interface VerifyOtpJob {
  pattern: QueueEventJobPattern.VERIFY_OTP;
  data: {
    email: string;
    otp: number;
    name: string;
  };
}

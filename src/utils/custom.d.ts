import { JwtPayloadInterface } from '@/helpers/crypto.service';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayloadInterface;
  }
}

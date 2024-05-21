import dotenv from 'dotenv';
import { Config } from '@/interfaces';
dotenv.config({ path: __dirname + `/../../.env.${process.env.NODE_ENV}` });
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
export const devConfig: Config = {
  env: String(process.env.NODE_ENV || 'development'),
  DATABASE_URL: String(process.env.DATABASE_URL),
  server: {
    protocol: String(process.env.PROTOCOL) || 'http',
    host: String(process.env.HOST) || 'localhost',
    port: Number(process.env.PORT) || 8080,
  },
  log: {
    format: 'dev',
    level: 'debug',
  },
  allowedOrigins: allowedOrigins,

  ARGON_SECRET_PEPPER: String(process.env.ARGON_SECRET_PEPPER),
  // jwt tokens

  JWT_ACCESS_TOKEN_EXPIRATION: String(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
  JWT_ACCESS_TOKEN_SECRET: String(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
  OTP_EXPIRE_IN_TIME: Number(process.env.OTP_EXPIRE_IN_TIME),
};

import { CorsOptions } from 'cors';
import { number } from 'joi';

export interface Config {
  env: string;
  DATABASE_URL: string;

  CAMPUSCONNECT_REDIS1_URL: string;
  CAMPUSCONNECT_REDIS2_URL: string;

  // redis config for auth notification queue
  REDIS_AUTH_NOTIFICATION_HOST: string;
  REDIS_AUTH_NOTIFICATION_PORT: number;
  REDIS_AUTH_NOTIFICATION_USER: string;
  REDIS_AUTH_NOTIFICATION_PASS: string;

  // redis config for app notification queue
  REDIS_APP_NOTIFICATION_HOST: string;
  REDIS_APP_NOTIFICATION_PORT: number;
  REDIS_APP_NOTIFICATION_USER: string;
  REDIS_APP_NOTIFICATION_PASS: string;
  server: {
    protocol: string;
    host: string;
    port: number;
  };
  log: {
    format: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
    level: 'error' | 'warn' | 'info' | 'http' | 'debug';
  };
  allowedOrigins: Array<string> | undefined;

  ARGON_SECRET_PEPPER: string;
  ARGON_OTP_SECRET_PEPPER: string;

  // for jwt token env
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION: string;
  JWT_ACCESS_TOKEN_COOKIE_EXPIRATION: number;

  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_EXPIRATION: string;
  JWT_REFRESH_TOKEN_COOKIE_EXPIRATION: number;

  OTP_EXPIRE_IN_TIME: number;
}

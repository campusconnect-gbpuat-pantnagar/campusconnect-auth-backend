import dotenv from 'dotenv';
import { Config } from '@/interfaces';
dotenv.config({ path: __dirname + `/../../.env.${process.env.NODE_ENV}` });
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
export const devConfig: Config = {
  env: String(process.env.NODE_ENV || 'development'),
  DATABASE_URL: String(process.env.DATABASE_URL),
  CAMPUSCONNECT_REDIS1_URL: String(process.env.CAMPUSCONNECT_REDIS1_URL),
  CAMPUSCONNECT_REDIS2_URL: String(process.env.CAMPUSCONNECT_REDIS2_URL),

  // redis config for auth notification queue
  REDIS_AUTH_NOTIFICATION_HOST: String(process.env.REDIS_AUTH_NOTIFICATION_HOST),
  REDIS_AUTH_NOTIFICATION_PORT: Number(process.env.REDIS_AUTH_NOTIFICATION_PORT),
  REDIS_AUTH_NOTIFICATION_USER: String(process.env.REDIS_AUTH_NOTIFICATION_USER),
  REDIS_AUTH_NOTIFICATION_PASS: String(process.env.REDIS_AUTH_NOTIFICATION_PASS),
  // redis config for app notification queue
  REDIS_APP_NOTIFICATION_HOST: String(process.env.REDIS_APP_NOTIFICATION_HOST),
  REDIS_APP_NOTIFICATION_PORT: Number(process.env.REDIS_APP_NOTIFICATION_PORT),
  REDIS_APP_NOTIFICATION_USER: String(process.env.REDIS_APP_NOTIFICATION_USER),
  REDIS_APP_NOTIFICATION_PASS: String(process.env.REDIS_APP_NOTIFICATION_PASS),
  server: {
    protocol: String(process.env.PROTOCOL) || 'http',
    host: String(process.env.HOST) || 'localhost',
    port: Number(process.env.PORT) || 8080,
  },
  BACKEND_URL: String(process.env.BACKEND_URL),
  log: {
    format: 'dev',
    level: 'debug',
  },
  allowedOrigins: allowedOrigins,

  ARGON_SECRET_PEPPER: String(process.env.ARGON_SECRET_PEPPER),
  ARGON_OTP_SECRET_PEPPER: String(process.env.ARGON_OTP_SECRET_PEPPER),
  // jwt tokens

  JWT_ACCESS_TOKEN_SECRET: String(process.env.JWT_ACCESS_TOKEN_SECRET),
  JWT_ACCESS_TOKEN_EXPIRATION: String(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
  JWT_ACCESS_TOKEN_COOKIE_EXPIRATION: Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRATION),

  JWT_REFRESH_TOKEN_SECRET: String(process.env.JWT_REFRESH_TOKEN_SECRET),
  JWT_REFRESH_TOKEN_EXPIRATION: String(process.env.JWT_REFRESH_TOKEN_EXPIRATION),
  JWT_REFRESH_TOKEN_COOKIE_EXPIRATION: Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRATION),

  OTP_EXPIRE_IN_TIME: Number(process.env.OTP_EXPIRE_IN_TIME),
  isDev: function () {
    return this.env === 'development';
  },
};

import { Config } from '@/interfaces';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + `/../../.env.${process.env.NODE_ENV}` });
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

export const productionConfig: Config = {
  env: String(process.env.NODE_ENV || 'production'),
  DATABASE_URL: String(process.env.DATABASE_URL),
  CAMPUSCONNECT_REDIS1_URL: String(process.env.CAMPUSCONNECT_REDIS1_URL),
  CAMPUSCONNECT_REDIS2_URL: String(process.env.CAMPUSCONNECT_REDIS2_URL),
  REDIS_CACHE_DB_HOST: String(process.env.REDIS_CACHE_DB_HOST),
  REDIS_CACHE_DB_PORT: Number(process.env.REDIS_CACHE_DB_PORT),
  REDIS_CACHE_DB_USER: String(process.env.REDIS_CACHE_DB_USER),
  REDIS_CACHE_DB_PASS: String(process.env.REDIS_CACHE_DB_PASS),
  server: {
    protocol: String(process.env.PROTOCOL) || 'https',
    host: String(process.env.HOST),
    port: Number(process.env.PORT) || 5000,
  },
  log: {
    format: 'tiny',
    level: 'info',
  },
  allowedOrigins: allowedOrigins,
  ARGON_SECRET_PEPPER: String(process.env.ARGON_SECRET_PEPPER),
  ARGON_OTP_SECRET_PEPPER: String(process.env.ARGON_OTP_SECRET_PEPPER),

  // jwt tokens

  JWT_ACCESS_TOKEN_EXPIRATION: String(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
  JWT_ACCESS_TOKEN_SECRET: String(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
  OTP_EXPIRE_IN_TIME: Number(process.env.OTP_EXPIRE_IN_TIME),
};

import mongoose from 'mongoose';
import validator from 'validator';

import bcrypt from 'bcryptjs';
import { getConfig } from '@/config';
import { boolean } from 'joi';
import { IRefreshTokenDoc, IRefreshTokenModel } from './refresh-token.entity';
const refreshTokenSchema = new mongoose.Schema<IRefreshTokenDoc, IRefreshTokenModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const RefreshToken = mongoose.model<IRefreshTokenDoc, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default RefreshToken;

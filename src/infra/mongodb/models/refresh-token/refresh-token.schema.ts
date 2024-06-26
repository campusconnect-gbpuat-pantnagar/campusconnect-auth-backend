import mongoose from 'mongoose';

import { IRefreshTokenDoc, IRefreshTokenModel } from './refresh-token.entity';
import toJSON from '../../plugins/toJSON/toJSON';
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

refreshTokenSchema.plugin(toJSON);
const RefreshToken = mongoose.model<IRefreshTokenDoc, IRefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default RefreshToken;

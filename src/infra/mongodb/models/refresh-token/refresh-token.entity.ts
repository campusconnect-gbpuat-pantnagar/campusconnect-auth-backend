import mongoose, { Document, Model } from 'mongoose';

export interface IRefreshToken {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
}
export type UpdateUserBody = Partial<IRefreshToken>;
export interface IRefreshTokenDoc extends IRefreshToken, Document {}
export interface IRefreshTokenModel extends Model<IRefreshTokenDoc> {}

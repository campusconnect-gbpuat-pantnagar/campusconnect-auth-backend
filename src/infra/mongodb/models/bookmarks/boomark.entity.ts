import mongoose, { Document, Model } from 'mongoose';

export interface IBookmarks {
  userId: mongoose.Types.ObjectId;
  posts: {
    postId: string;
  }[];
  blogs: {
    blogId: string;
  }[];
  ads: {
    adsId: string;
  }[];
  jobs: {
    jobId: string;
  }[];
}
export type UpdateUserBody = Partial<IBookmarks>;
export interface IBookmarksDoc extends IBookmarks, Document {}
export interface IBookmarksModel extends Model<IBookmarksDoc> {}

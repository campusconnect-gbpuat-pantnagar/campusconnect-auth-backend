import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON/toJSON';
import { IBookmarksDoc, IBookmarksModel } from './boomark.entity';
const boomarkSchema = new mongoose.Schema<IBookmarksDoc, IBookmarksModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    posts: [
      {
        _id: false,
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
          unique: true,
        },
      },
    ],
    blogs: [
      {
        _id: false,
        blogId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Blog',
          unique: true,
        },
      },
    ],
    ads: [
      {
        _id: false,
        adId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ads',
          unique: true,
        },
      },
    ],
    jobs: [
      {
        _id: false,
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
          unique: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

boomarkSchema.plugin(toJSON);
const Boomark = mongoose.model<IBookmarksDoc, IBookmarksModel>('Bookmark', boomarkSchema);

export default Boomark;

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
        postId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post',
        },
      },
    ],
    blogs: [
      {
        blogId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Blog',
        },
      },
    ],
    ads: [
      {
        adsId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ads',
        },
      },
    ],
    jobs: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
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

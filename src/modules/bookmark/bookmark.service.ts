import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import Boomark from '../../infra/mongodb/models/bookmarks/bookmark.schema';

export class BookmarkService {
  private _bookmark = Boomark;

  constructor() {}

  /**
   * Add a bookmark to user's bookmarks
   * @param {string} userId - The ID of the user
   * @param {string} type - The type of the resource (post, blog, ad, job)
   * @param {string} resourceId - The ID of the resource to be added to bookmarks
   * @returns {Promise<IBookmarksDoc | null>}
   */
  public async addUserBookmark(userId: mongoose.Types.ObjectId, type: string, resourceId: mongoose.Types.ObjectId) {
    const update: any = { $addToSet: {} };
    update.$addToSet[`${type}s`] = { [`${type}Id`]: resourceId };

    const updatedBookmarks = await this._bookmark.findOneAndUpdate({ userId }, update, {
      new: true,
      upsert: true,
    });

    return updatedBookmarks;
  }
  /**
   * Remove a boomark from  user's bookmarks
   * @param {string} userId - The ID of the user
   * @param {string} type - The type of the resource (post, blog, ad, job)
   * @param {string} resourceId - The ID of the resource to be remove from  bookmarks
   * @returns {Promise<IBookmarksDoc | null>}
   */
  public async removeUserBookmark(userId: mongoose.Types.ObjectId, type: string, resourceId: mongoose.Types.ObjectId) {
    const updateQuery = { $pull: { [`${type}s`]: { [`${type}Id`]: resourceId } } };

    const updatedBookmarks = await this._bookmark.findOneAndUpdate({ userId }, updateQuery, {
      new: true,
      upsert: true,
    });

    return updatedBookmarks;
  }
  /**
   * Find all bookmarks of a user by user ID, optionally filtered by type
   * @param {string} userId - The ID of the user
   * @param {string} [type] - The type of the resource (optional)
   * @returns {Promise<IBookmarksDoc | null>}
   */
  public async findAllBookmarksByUserId(userId: mongoose.Types.ObjectId, type?: string) {
    const bookmarks = await this._bookmark.findOne({
      userId,
    });

    return bookmarks;
  }
}

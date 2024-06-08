import { getConfig } from '@/config';
import { IUserDoc, NewCreatedUser, NewRegisteredUser } from '@/infra/mongodb/models';
import User from '@/infra/mongodb/models/users/user.schema';
import { HttpStatusCode } from '@/enums';
import ApiError from '@/exceptions/http.exception';
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';
import { RedisService } from '@/infra/redis/redis.service';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { REDIS_ENUM } from '@/utils/redis.constants';

export class UserService {
  private _user = User;
  private readonly _redisService1: RedisService;
  constructor() {
    this._redisService1 = new RedisService(redisClient1);
  }

  /**
   * Create a user
   * @param {NewCreatedUser} userBody
   * @returns {Promise<IUserDoc>}
   */
  public async createUser(userBody: NewCreatedUser): Promise<IUserDoc> {
    if (await this._user.isEmailTaken(userBody.gbpuatEmail)) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'email is already taken');
    }
    return this._user.create(userBody);
  }
  /**
   * Register a user
   * @param {NewRegisteredUser} userBody
   * @returns {Promise<IUserDoc>}
   */
  public async registerUser(userBody: NewRegisteredUser): Promise<IUserDoc> {
    if (await this._user.isEmailTaken(userBody.gbpuatEmail)) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, 'Email already taken');
    }
    return this._user.create(userBody);
  }
  /**
   * Get user by id
   * @param {mongoose.Types.ObjectId} id
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserById(id: mongoose.Types.ObjectId): Promise<IUserDoc | null> {
    return this._user.findById(id);
  }

  /**
   * Get user by username
   * @param {string} id
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByUsername(username: string): Promise<IUserDoc | null> {
    return this._user.findOne({ username });
  }

  /**
   * Get user by gbpuatId
   * @param {number} gbpuatId
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByGbpuatId(gbpuatId: number): Promise<IUserDoc | null> {
    return this._user.findOne({ gbpuatId });
  }
  /**
   * Get user by gbpuatEmail
   * @param {string} gbpuatEmail
   * @returns {Promise<IUserDoc | null>}
   */
  public async getUserByGbpuatEmail(gbpuatEmail: string): Promise<IUserDoc | null> {
    return this._user.findOne({ gbpuatEmail });
  }
  /**
   * update User by gbpuatEmail
   * @param {filter}
   * @param {update}
   * @returns {Promise<IUserDoc | null>}
   */
  public async updateUserByGbpuatEmail(
    filter: FilterQuery<IUserDoc>,
    update: UpdateQuery<IUserDoc>,
  ): Promise<IUserDoc | null> {
    const updatedUser = await this._user
      .findOneAndUpdate(
        filter,
        { $set: update },
        { new: true }, // This option returns the updated document
      )
      .exec();
    return updatedUser ? updatedUser.toJSON() : null;
  }
  /**
   * update User by Id
   * @param {userId}
   * @param {update}
   * @returns {Promise<IUserDoc | null>}
   */
  public async updateUserById(
    userId: mongoose.Types.ObjectId,
    update: UpdateQuery<IUserDoc>,
  ): Promise<IUserDoc | null> {
    const updatedUser = await this._user.findByIdAndUpdate(
      userId,
      update,
      { new: true, useFindAndModify: false }, // This option returns the updated document
    );

    return updatedUser;
  }

  /**
   * Update the User last Active timestamp in the database
   * @param {string} userId
   * @returns {Promise<IUserDoc | null>}
   */
  public async updateUserLastActive(userId: mongoose.Types.ObjectId): Promise<IUserDoc | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, 'User not found');
    }
    const updateUserLastActive = await this._user.findByIdAndUpdate(
      userId,
      {
        $set: { lastActive: new Date() },
      },
      { new: true },
    );

    return updateUserLastActive;
  }

  /**
   * Update the User updateFailed login  Attempts in the database
   * @param {string} userId
   * @returns {Promise<IUserDoc | null>}
   */

  public async updateFailedAttempts(
    userId: mongoose.Types.ObjectId,
    times: number,
    lastFailedAttempt: Date,
  ): Promise<IUserDoc | null> {
    const updateUserLastActive = await this._user.findByIdAndUpdate(
      userId,
      {
        $set: {
          failedLogin: {
            times,
            lastFailedAttempt: lastFailedAttempt,
          },
        },
      },
      { new: true },
    );

    return updateUserLastActive;
  }

  /**
   * get Dynamic Connection suggestions list using  userId
   * @param {string} userId
   * @returns {Promise<IUserDoc | null>}
   */

  public async suggestConnections(
    userId: string,
  ): Promise<Pick<IUserDoc, 'id' | 'username' | 'firstName' | 'lastName' | 'profilePicture'>[] | []> {
    const currentUser = await this._user.findById(userId);

    if (!currentUser) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, 'User not found');
    }

    const currentUserId = currentUser._id;

    // Exclude the current user and already connected users from suggestions
    const excludedUserIds = [
      currentUserId,
      ...(currentUser.connectionLists?.map((conn: { userId: string }) => conn.userId) || []),
      ...(currentUser.sentConnections?.map((conn: { userId: string }) => conn.userId) || []),
      ...(currentUser.receivedConnections?.map((conn: { userId: string }) => conn.userId) || []),
    ];

    // Query to find suggested connections
    const suggestedConnections = await this._user
      .find({
        _id: { $nin: excludedUserIds },
        $or: [
          // Mutual connections
          {
            connectionLists: {
              $elemMatch: {
                userId: {
                  $in: currentUser.connectionLists?.map((conn: { userId: string }) => conn.userId) || [],
                },
              },
            },
          },
          // Same department
          { 'academicDetails.department.departmentId': currentUser.academicDetails?.department?.departmentId },
          // Same batch year
          { 'academicDetails.batchYear': currentUser.academicDetails?.batchYear },
          // Same college
          { 'academicDetails.college.collegeId': currentUser.academicDetails?.college?.collegeId },
          // Same degree program
          {
            'academicDetails.degreeProgram.degreeProgramId':
              currentUser.academicDetails?.degreeProgram?.degreeProgramId,
          },
          // User interests from bio
          {
            bio: { $regex: new RegExp(currentUser.bio || '', 'i') },
          },
        ],
      })
      .select(
        '_id username firstName lastName academicDetails.college.name academicDetails.department.name profilePicture bio',
      )
      .lean();

    const weights = {
      mutualConnections: 0.4,
      sameDepartment: 0.2,
      sameBatchYear: 0.13,
      sameCollege: 0.13,
      sameDegreeProgram: 0.07,
      bioMatch: 0.07,
    };
    const scoredSuggestions = suggestedConnections.map((user) => {
      let score = 0;

      // Mutual connections
      if (
        currentUser.connectionLists?.some((conn) =>
          user.connectionLists?.some((innerConn) => innerConn.userId.toString() === conn.userId),
        )
      ) {
        score += weights.mutualConnections;
      }

      // Same department
      if (user.academicDetails?.department?.name === currentUser.academicDetails?.department?.name) {
        score += weights.sameDepartment;
      }

      // Same batch year
      if (user.academicDetails?.batchYear === currentUser.academicDetails?.batchYear) {
        score += weights.sameBatchYear;
      }

      // Same college
      if (user.academicDetails?.college?.name === currentUser.academicDetails?.college?.name) {
        score += weights.sameCollege;
      }

      // Same degree program
      if (user.academicDetails?.degreeProgram?.name === currentUser.academicDetails?.degreeProgram?.name) {
        score += weights.sameDegreeProgram;
      }

      // Bio match
      if (user.bio && currentUser.bio && new RegExp(currentUser.bio, 'i').test(user.bio)) {
        score += weights.bioMatch;
      }

      return {
        id: user._id.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        collegeName: user.academicDetails.college.name,
        departmenName: user.academicDetails.department.name,
        score,
      };
    });

    // Sort suggestions by descending score
    scoredSuggestions.sort((a, b) => b.score - a.score);

    const topSuggestions = scoredSuggestions.slice(0, 10);
    const remainingSuggestions = scoredSuggestions.slice(10);
    const randomSuggestions = remainingSuggestions
      .sort(() => Math.random() - 0.5) // shuffle the remaining suggestions randomly
      .slice(0, 10); // take the first 10 suggestions
    const combinedSuggestions = [...topSuggestions, ...randomSuggestions];
    return combinedSuggestions.map(
      ({ id, username, firstName, lastName, profilePicture, collegeName, departmenName, score }) => ({
        id,
        username,
        firstName,
        lastName,
        profilePicture,
        collegeName,
        departmenName,
        // score,
      }),
    );
  }
}

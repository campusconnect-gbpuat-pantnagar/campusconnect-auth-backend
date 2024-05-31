import { NextFunction, Request, RequestHandler, Response } from 'express';

import { getConfig } from '@/config';
import Api from '@/lib/api.response';
import { redisClient1 } from '@/infra/redis/redis-clients';
import { RedisService } from '@/infra/redis/redis.service';
import { REDIS_ENUM, REDIS_TTL_ENUM } from '@/utils/redis.constants';
import { IUser, IUserDoc, NewRegisteredUser } from '@/infra/mongodb/models';
import { UserService } from '../services/user.service';
import mongoose, { isValidObjectId, Mongoose } from 'mongoose';
import ApiError from '@/exceptions/http.exception';
import { HttpStatusCode } from '@/enums';

export class UserController extends Api {
  private readonly _redisService1: RedisService;
  private readonly _userService: UserService;
  constructor() {
    super();
    this._redisService1 = new RedisService(redisClient1);
    this._userService = new UserService();
  }

  public getUserPresence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const user = await this._userService.getUserByUsername(username);
      if (!user) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, 'Unable to find user');
      }

      const userlastActivePresenceInRedis = await this._redisService1.get(REDIS_ENUM.USERNAME_PRESENCE, `${user.id}`);
      const userPresenceDetails =
        userlastActivePresenceInRedis &&
        (JSON.parse(userlastActivePresenceInRedis) as unknown as Pick<
          IUserDoc,
          'gbpuatEmail' | 'gbpuatId' | 'lastActive'
        > & { mongoLastActivePresence: string });

      if (!userPresenceDetails) {
        return this.send(
          res,
          {
            user: {
              presence: false,
            },
          },
          `user ${username} is offline`,
        );
      }

      this.send(
        res,
        {
          user: {
            presence: true,
          },
        },
        `user ${userPresenceDetails.gbpuatId} is online`,
      );
    } catch (err) {
      next(err);
    }
  };
  public updateUserPresence: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: userId, role, gbpuatId } = req.user!;
      const user = await this._userService.getUserById(userId);
      if (!user) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, 'Unable to find user');
      }

      if (user.isDeleted) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, 'User account has deleted.');
      }

      const userLastActivePresenceInRedis = await this._redisService1.get(REDIS_ENUM.USERNAME_PRESENCE, userId);
      let userPresenceDetails:
        | (Pick<IUserDoc, 'gbpuatEmail' | 'gbpuatId' | 'lastActive'> & { mongoLastActivePresence?: string })
        | null = null;

      if (userLastActivePresenceInRedis) {
        userPresenceDetails = JSON.parse(userLastActivePresenceInRedis) as unknown as Pick<
          IUserDoc,
          'gbpuatEmail' | 'gbpuatId' | 'lastActive'
        > & { mongoLastActivePresence: string };
      }

      if (!userPresenceDetails) {
        const updatedUserInMongodb = await this._userService.updateUserLastActive(user.id);
        if (updatedUserInMongodb) {
          userPresenceDetails = {
            gbpuatEmail: updatedUserInMongodb.gbpuatEmail,
            gbpuatId: updatedUserInMongodb.gbpuatId,
            lastActive: updatedUserInMongodb.lastActive,
            mongoLastActivePresence: updatedUserInMongodb.lastActive.toISOString(),
          };

          await this._redisService1.setWithExpiry(
            REDIS_ENUM.USERNAME_PRESENCE,
            userId,
            JSON.stringify(userPresenceDetails),
            30,
          );
        }
      }

      const currentTime = Date.now();
      const lastActivePresence = new Date(userPresenceDetails!.lastActive).getTime();
      const lastActivePresenceInMongodb = new Date(userPresenceDetails!.mongoLastActivePresence!).getTime();

      // Update Redis presence with every request
      await this._redisService1.setWithExpiry(
        REDIS_ENUM.USERNAME_PRESENCE,
        userId,
        JSON.stringify(userPresenceDetails),
        30,
      );

      // Check if MongoDB presence needs to be updated (every 10 minutes)
      if (currentTime - lastActivePresenceInMongodb > 30 * 60 * 1000) {
        const updatedUserInMongodb = await this._userService.updateUserLastActive(user.id);
        userPresenceDetails!.lastActive = updatedUserInMongodb!.lastActive;
        userPresenceDetails!.mongoLastActivePresence = updatedUserInMongodb!.lastActive.toUTCString();
      }

      return this.send(res, null, 'User online presence updated');
    } catch (err) {
      next(err);
    }
  };

  public getCurrentUserProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, gbpuatId, role } = req.user!;
      const user = await this._userService.getUserById(id);
      this.send(res, { user }, `your profile details`);
    } catch (err) {
      next(err);
    }
  };

  public getUserProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params;
      const user = await this._userService.getUserByUsername(username);
      // check is user is deleted or permanent block

      if (!user || user?.isDeleted || user?.isPermanentBlocked) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `user with username ${username} not found. `);
      }

      const userData: Omit<IUser, 'password' | 'receivedConnections' | 'sentConnections'> & { id: string } = {
        gbpuatId: user.gbpuatId,
        username: user.username,
        gbpuatEmail: user.gbpuatEmail,
        isEmailVerified: user.isEmailVerified,
        firstName: user.firstName,
        academicDetails: {
          college: {
            name: user.academicDetails.college.name,
            collegeId: user.academicDetails.college.collegeId,
          },
          department: {
            name: user.academicDetails.department.name,
            departmentId: user.academicDetails.department.departmentId,
          },
          degreeProgram: {
            name: user.academicDetails.degreeProgram.name,
            degreeProgramId: user.academicDetails.degreeProgram.degreeProgramId,
          },
          batchYear: user.academicDetails.batchYear,
          designation: user.academicDetails.designation,
        },
        lastActive: user.lastActive,
        profilePicture: user.profilePicture,
        role: user.role,
        id: user.id,
        connectionLists: user.connectionLists,
      };
      this.send(res, { user: userData }, `${username} profile details`);
    } catch (err) {
      next(err);
    }
  };
  // Implement controller for sending connection request of user
  public sendConnectionRequest: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.id;
      if (!isValidObjectId(userId)) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid User Id`);
      }
      if (userId === currentUserId) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Operations not allowed`);
      }
      const user = await this._userService.getUserById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, `User not found. `);
      }

      const currentUser = await this._userService.getUserById(new mongoose.Types.ObjectId(currentUserId));
      if (!currentUser) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, `Current user not found.`);
      }
      // Check if the users are already connected
      const alreadyConnected =
        currentUser.connectionLists.some((connection) => connection.userId.toString() === userId) &&
        user.connectionLists.some((connection) => connection.userId.toString() === currentUserId);

      if (alreadyConnected) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Users are already connected.`);
      }

      const alreadySentConnection = currentUser.sentConnections.some(
        (connection) => connection.userId.toString() === userId,
      );

      const alreadyReceivedConnection = user.receivedConnections.some(
        (connection) => connection.userId.toString() === currentUserId,
      );

      if (alreadySentConnection || alreadyReceivedConnection) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Connection request already sent or received.`);
      }

      const updatedCurrentUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(currentUserId), {
        $addToSet: { sentConnections: { userId } },
      });
      const updatedUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(userId), {
        $addToSet: { receivedConnections: { userId: currentUserId } },
      });

      // TODO ✅ : Trigger an event for sending connection requests so that email notifications should be sent
      this.send(res, null, `connection request sent successfully`);
    } catch (err) {
      next(err);
    }
  };

  // Implement controller for accepting connection request of user
  public acceptConnectionRequest: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.id;
      if (!isValidObjectId(userId)) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid User Id`);
      }
      if (userId === currentUserId) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Operations not allowed`);
      }
      const user = await this._userService.getUserById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, `User not found. `);
      }
      const currentUser = await this._userService.getUserById(new mongoose.Types.ObjectId(currentUserId));
      if (!currentUser) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, `Current user not found.`);
      }
      // Check if the users are already connected
      const alreadyConnected =
        currentUser.connectionLists.some((connection) => connection.userId.toString() === userId) &&
        user.connectionLists.some((connection) => connection.userId.toString() === currentUserId);

      if (alreadyConnected) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Users are already connected.`);
      }

      // Check if the connection request exists
      const receivedConnection = currentUser.receivedConnections.some(
        (connection) => connection.userId.toString() === userId,
      );
      const sentConnection = user.sentConnections.some((connection) => connection.userId.toString() === currentUserId);

      if (!receivedConnection || !sentConnection) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `No connection request found.`);
      }

      const updatedCurrentUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(currentUserId), {
        $pull: { receivedConnections: { userId } },
        $addToSet: { connectionLists: { userId } },
      });
      const updatedUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(userId), {
        $pull: { sentConnections: { userId: currentUserId } },
        $addToSet: { connectionLists: { userId: currentUserId } },
      });
      // TODO ✅ : Trigger an event for accepting connection requests so that email notifications should be sent to users
      this.send(res, null, `connection request accepted successfully.`);
    } catch (err) {
      next(err);
    }
  };

  // Implement controller for rejecting connection request of user
  public rejectConnectionRequest: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.id;
      if (!isValidObjectId(userId)) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid User Id`);
      }
      if (userId === currentUserId) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Operations not allowed`);
      }
      const user = await this._userService.getUserById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, `User not found. `);
      }
      const currentUser = await this._userService.getUserById(new mongoose.Types.ObjectId(currentUserId));
      if (!currentUser) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, `Current user not found.`);
      }
      // Check if the connection request exists
      const receivedConnection = currentUser.receivedConnections.some(
        (connection) => connection.userId.toString() === userId,
      );
      const sentConnection = user.sentConnections.some((connection) => connection.userId.toString() === currentUserId);

      if (!receivedConnection || !sentConnection) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `No connection request found.`);
      }

      const updatedCurrentUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(currentUserId), {
        $pull: { receivedConnections: { userId } },
      });
      const updatedUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(userId), {
        $pull: { sentConnections: { userId: currentUserId } },
      });
      this.send(res, null, `connection request rejected successfully..`);
    } catch (err) {
      next(err);
    }
  };
  // Implement controller for removing connection request from user connectionList

  public removeConnection: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user!.id;
      if (!isValidObjectId(userId)) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid User Id`);
      }
      if (userId === currentUserId) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Operations not allowed`);
      }
      const user = await this._userService.getUserById(new mongoose.Types.ObjectId(userId));
      if (!user) {
        throw new ApiError(HttpStatusCode.NOT_FOUND, `User not found. `);
      }
      const currentUser = await this._userService.getUserById(new mongoose.Types.ObjectId(currentUserId));
      if (!currentUser) {
        throw new ApiError(HttpStatusCode.FORBIDDEN, `Current user not found.`);
      }

      // Check if the users are actually connected
      const isConnected =
        currentUser.connectionLists.some((connection) => connection.userId.toString() === userId) &&
        user.connectionLists.some((connection) => connection.userId.toString() === currentUserId);

      if (!isConnected) {
        throw new ApiError(HttpStatusCode.BAD_REQUEST, `Users are not connected.`);
      }

      const updatedCurrentUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(currentUserId), {
        $pull: { connectionLists: { userId } },
      });
      const updatedUser = await this._userService.updateUserById(new mongoose.Types.ObjectId(userId), {
        $pull: { connectionLists: { userId: currentUserId } },
      });
      this.send(res, null, `connection removed successfully..`);
    } catch (err) {
      next(err);
    }
  };
}

import mongoose, { Document, Model } from 'mongoose';

export interface IUser {
  // Basic Information
  gbpuatId: number;
  username: string;
  gbpuatEmail: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName?: string | null;
  password: string;
  profilePicture?: string | null;
  bio?: string;

  // Authentication and Security
  resetToken?: string;
  failedLogin?: {
    times: number;
    lastFailedAttempt: string;
  };

  // academic information
  academicDetails: {
    college: {
      name: string;
      collegeId: string;
    };
    department: {
      name: string;
      departmentId: string;
    };
    degreeProgram: {
      name: string;
      degreeProgramId: string;
    };
    batchYear: number;
    designation: string;
  };

  // Account Status
  isDeleted?: boolean;
  accountDeletionReason?: string;
  isTemporaryBlocked?: boolean;
  isPermanentBlocked?: boolean;
  lastActive: Date;

  // User Connections
  receivedConnections: {
    userId: string;
  }[];
  sentConnections: {
    userId: string;
  }[];
  connectionLists: {
    userId: string;
  }[];

  // User Role
  role?: string;

  // Onboarding
  showOnBoarding?: boolean;
  showOnBoardingTour?: number;
}

// Extending the IUser interface with Document from Mongoose
export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
}
export type UpdateUserBody = Partial<IUser>;
export type NewRegisteredUser = Omit<
  IUser,
  | 'role'
  | 'isEmailVerified'
  | 'profilePicture'
  | 'bio'
  | 'resetToken'
  | 'otp'
  | 'failedLogin'
  | 'isDeleted'
  | 'lastActive'
  | 'receivedConnections'
  | 'sentConnections'
  | 'connectionLists'
  | 'showOnBoarding'
  | 'showOnBoardingTour'
  | 'isPermanentBlocked'
  | 'isTemporaryBlocked'
>;
export type NewCreatedUser = Omit<IUser, 'isEmailVerified'>;

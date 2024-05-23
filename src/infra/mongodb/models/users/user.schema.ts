import mongoose from 'mongoose';
import { IUser, IUserDoc, IUserModel } from './user.entity';
import validator from 'validator';

import bcrypt from 'bcryptjs';
import { getConfig } from '@/config';
import { boolean } from 'joi';
import toJSON from '../../plugins/toJSON/toJSON';
const userSchema = new mongoose.Schema<IUserDoc, IUserModel>(
  {
    gbpuatId: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    gbpuatEmail: {
      unique: true,
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        const gbpuatEmailRegex = /@.*gbpuat.*\..+$/;
        if (!validator.isEmail(value) || !gbpuatEmailRegex.test(value)) {
          throw new Error('GBPUAT Email must be a gbpuat university email.');
        }
      },
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          throw new Error(
            'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character {@$#!%*?&}',
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
    },
    resetToken: {
      type: String,
      default: null,
    },
    failedLogin: {
      times: {
        type: Number,
      },
      lastFailedAttempt: {
        type: Date,
      },
    },

    academicDetails: {
      college: {
        name: {
          type: String,
          required: true,
        },
        collegeId: {
          type: String,
          required: true,
        },
      },
      department: {
        name: {
          type: String,
          required: true,
        },
        departmentId: {
          type: String,
          required: true,
        },
      },
      degreeProgram: {
        name: {
          type: String,
          required: true,
        },
        degreeProgramId: {
          type: String,
          required: true,
        },
      },
      batchYear: Number,
      designation: String,
    },
    showOnBoardingTour: {
      type: Number,
      default: 0,
    },
    showOnBoarding: {
      type: Boolean,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true,
      default: 'student',
    },
    receivedConnections: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    sentConnections: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    connectionLists: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.static(
  'isEmailTaken',
  async function (gbpuatEmail: string, excludeUserId: mongoose.ObjectId): Promise<boolean> {
    const user = await this.findOne({ gbpuatEmail, _id: { $ne: excludeUserId } });
    return !!user;
  },
);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.method('isPasswordMatch', async function (password: string): Promise<boolean> {
  const user = this;
  const passwordWithSecret = (password + getConfig().ARGON_SECRET_PEPPER) as string;

  return await bcrypt.compare(passwordWithSecret, user.password);
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    const passwordWithSecret = (user.password + getConfig().ARGON_SECRET_PEPPER) as string;
    user.password = await bcrypt.hash(passwordWithSecret, salt);
  }
  next();
});

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema);

export default User;

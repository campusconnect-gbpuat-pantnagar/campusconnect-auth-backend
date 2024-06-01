import Joi, { CustomHelpers } from 'joi';
import mongoose from 'mongoose';

const validateIdentifier = (value: string, helpers: CustomHelpers) => {
  // Check if the value is a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(value)) {
    return value;
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (usernameRegex.test(value)) {
    return value;
  }

  // If neither ObjectId nor username, throw error
  return helpers.message({
    custom: 'Identifier must be either a valid ObjectId or a username.',
  });
};

export const getUserProfileDto = {
  params: Joi.object({
    identifier: Joi.string().required().custom(validateIdentifier, 'valid identifier'),
  }),
};

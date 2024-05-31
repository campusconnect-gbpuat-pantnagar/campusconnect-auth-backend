import Joi, { custom } from 'joi';
import mongoose from 'mongoose';

export const acceptConnectionDto = {
  params: Joi.object({
    userId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message({ custom: 'Invalid UserId' });
        }
        return value;
      }, 'ObjectId validation'),
  }),
};

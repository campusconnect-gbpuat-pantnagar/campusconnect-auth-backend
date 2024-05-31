import { password, username } from '@/helpers/validate/custom.validation';
import Joi, { custom } from 'joi';

export const updateAccountDto = {
  body: Joi.object({
    profilePicture: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    username: Joi.string().optional().custom(username),
    bio: Joi.string().optional(),
  }),
};

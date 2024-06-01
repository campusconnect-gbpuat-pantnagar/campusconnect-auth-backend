import { username } from '@/helpers/validate/custom.validation';
import Joi, { custom } from 'joi';
import mongoose from 'mongoose';

export const getUserProfileByUsernameDto = {
  params: Joi.object({
    username: Joi.string().required().custom(username),
  }),
};

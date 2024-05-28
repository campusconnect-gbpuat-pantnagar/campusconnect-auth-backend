import Joi from 'joi';
import { username } from '../../../helpers/validate/custom.validation';
export const usernameDto = {
  params: {
    username: Joi.string().required().custom(username).max(60),
  },
};

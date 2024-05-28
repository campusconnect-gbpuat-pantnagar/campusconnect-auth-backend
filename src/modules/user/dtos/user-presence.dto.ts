import Joi from 'joi';
import { username } from '../../../helpers/validate/custom.validation';
export const userPresenceDto = {
  params: {
    username: Joi.string().required().custom(username),
  },
};

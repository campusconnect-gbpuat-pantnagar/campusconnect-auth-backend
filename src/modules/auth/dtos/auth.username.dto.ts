import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password, username } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const usernameDto = {
  params: {
    username: Joi.string().required().custom(username).max(60),
  },
};

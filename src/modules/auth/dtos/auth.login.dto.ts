import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password, username } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const loginDto = {
  body: {
    username: Joi.string().required().custom(username).max(60),
    password: Joi.string().required().custom(password),
  },
};

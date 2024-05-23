import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const loginDto = {
  body: {
    username: Joi.string().required(),
    password: Joi.string().required(),
  },
};

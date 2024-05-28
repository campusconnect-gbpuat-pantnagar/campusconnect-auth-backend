import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const keepAccountDto = {
  body: {
    username: Joi.string().required().max(60),
    password: Joi.string().required(),
  },
};

import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const usernameDto = {
  params: {
    username: Joi.string().required(),
  },
};

import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const verifyEmailDto = {
  body: {
    gbpuatEmail: Joi.string().required().custom(gbpuatEmail),
    otp: Joi.number().required(),
  },
};

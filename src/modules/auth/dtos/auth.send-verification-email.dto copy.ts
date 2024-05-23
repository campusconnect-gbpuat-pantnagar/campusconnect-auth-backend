import { NewRegisteredUser } from '@/infra/mongodb/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
export const sendVerificationEmailDto = {
  body: {
    gbpuatEmail: Joi.string().required().custom(gbpuatEmail),
  },
};

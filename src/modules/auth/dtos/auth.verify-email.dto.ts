import Joi from 'joi';
import { gbpuatEmail } from '../../../helpers/validate/custom.validation';
export const verifyEmailDto = {
  body: {
    gbpuatEmail: Joi.string().required().custom(gbpuatEmail),
    otp: Joi.number().required(),
  },
};

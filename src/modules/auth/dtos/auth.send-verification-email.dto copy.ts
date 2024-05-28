import Joi from 'joi';
import { gbpuatEmail } from '../../../helpers/validate/custom.validation';
export const sendVerificationEmailDto = {
  body: {
    gbpuatEmail: Joi.string().required().custom(gbpuatEmail),
  },
};

import { password } from '@/helpers/validate/custom.validation';
import Joi, { custom } from 'joi';

export const accountDeletionDto = {
  body: Joi.object({
    accountDeletionReason: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

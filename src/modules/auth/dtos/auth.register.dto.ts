import { NewRegisteredUser } from '@/dal/models/index';
import { gbpuatEmail, password } from '@/helpers/validate/custom.validation';
import Joi from 'joi';
const registerBody: Record<keyof NewRegisteredUser, any> = {
  gbpuatId: Joi.number().required(),
  gbpuatEmail: Joi.string().required().custom(gbpuatEmail),
  username: Joi.string().required(),
  password: Joi.string().required().custom(password),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  academicDetails: Joi.object({
    college: Joi.object({
      name: Joi.string().required(),
      collegeId: Joi.string().required(),
    }).required(),
    department: Joi.object({
      name: Joi.string().required(),
      departmentId: Joi.string().required(),
    }).required(),
    degreeProgram: Joi.object({
      name: Joi.string().required(),
      degreeProgramId: Joi.string().required(),
    }).required(),
    batchYear: Joi.number().required(),
    designation: Joi.string().required(),
  }).required(),
};

export const registerDto = {
  body: Joi.object().keys(registerBody),
};

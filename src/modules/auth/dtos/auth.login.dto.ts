import Joi from 'joi';
export const loginDto = {
  body: {
    username: Joi.string().required().max(60),
    password: Joi.string().required(),
  },
};

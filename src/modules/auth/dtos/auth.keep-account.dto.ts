import Joi from 'joi';
export const keepAccountDto = {
  body: {
    username: Joi.string().required().max(60),
    password: Joi.string().required(),
  },
};

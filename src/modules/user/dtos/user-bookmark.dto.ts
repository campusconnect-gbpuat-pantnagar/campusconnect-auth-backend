import Joi from 'joi';
export enum BookmarkType {
  Posts = 'post',
  Blogs = 'blog',
  Ads = 'ad',
  Jobs = 'job',
}

export const addAndRemoveBookmarksDto = {
  body: Joi.object({
    type: Joi.string()
      .valid(...Object.values(BookmarkType))
      .required()
      .messages({
        'string.base': '"type" should be a type of text',
        'string.empty': '"type" cannot be an empty field',
        'any.required': '"type" is a required field',
        'any.only': `"type" must be one of [${Object.values(BookmarkType).join(', ')}]`,
      }),
    resourceId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.base': '"resourceId" should be a type of text',
        'string.empty': '"resourceId" cannot be an empty field',
        'string.pattern.base': '"resourceId" must be a valid MongoDB ObjectId',
        'any.required': '"resourceId" is a required field',
      }),
  }),
};

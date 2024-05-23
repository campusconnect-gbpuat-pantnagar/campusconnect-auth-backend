import Joi, { ValidationErrorItem } from 'joi';
import { Request, Response, NextFunction } from 'express';
import pick from '@/helpers/pick';
import { ValidationException } from '@/exceptions/validation.exception';

const validate =
  (schema: Record<string, any>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' } })
      .validate(object, { abortEarly: false });

    if (error) {
      const errorMessage = error.details as ValidationErrorItem[];
      const validationErrors = errorMessage.map((item) => ({
        message: item.message,
        path: item.path.join('.'),
        // name: item.type,
        // isJoi: true,
        // details: [item],
        // annotate: () => '',
        // _original: error._original,
      }));

      console.log(error);
      return next(new ValidationException(validationErrors, 'Validation error'));
    }

    Object.assign(req, value);
    return next();
  };

export default validate;

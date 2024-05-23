import { custom, CustomHelpers } from 'joi';

export const objectId = (value: string, helpers: CustomHelpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message({ custom: '"{{#label}}" must be a valid mongo id' });
  }
  return value;
};

export const password = (value: string, helpers: CustomHelpers) => {
  if (value.length < 8) {
    return helpers.message({ custom: 'Password must be at least 8 characters' });
  }

  console.log(value);
  if (!value.match(/[a-z]/) || !value.match(/[A-Z]/) || !value.match(/\d/) || !value.match(/[@$!%*?&]/)) {
    return helpers.message({
      custom:
        'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character (@, $, !, %, *, ?, or &)',
    });
  }

  return value;
};

export const gbpuatEmail = (value: string, helpers: CustomHelpers) => {
  const gbpuatEmailRegex = /@.*gbpuat.*\..+$/;
  if (!gbpuatEmailRegex.test(value)) {
    return helpers.message({
      custom: 'GBPUAT Email must be a gbpuat university email.',
    });
  }

  return value;
};

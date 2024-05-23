import { ValidationError } from 'joi';
import ApiError from './http.exception';
export interface CustomValidationError {
  message: string;
  path: string;
  // name: string;
  // isJoi: boolean;
  // details: any[];
  // annotate: () => string;
  // _original: any;
}
export class ValidationException extends ApiError {
  public errors: CustomValidationError[];
  constructor(errors: CustomValidationError[], message: string) {
    super(400, message);
    this.errors = errors;
  }
}

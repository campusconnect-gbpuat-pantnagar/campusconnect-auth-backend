import { ValidationError } from 'class-validator';
import ApiError from './http.exception';
export class ValidationException extends ApiError {
  public errors: ValidationError[];
  constructor(errors: ValidationError[], message: string) {
    super(400, message);
    this.errors = errors;
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenValidationError extends HttpException {
  constructor(code: string, message: string, error?: any) {
    super({ code, message, error }, HttpStatus.BAD_REQUEST);
  }
}

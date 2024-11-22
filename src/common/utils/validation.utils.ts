import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';

export class ValidationUtils {
  static async validateDTO(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }
  }

  static validateRequiredFields(obj: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null) {
        throw new BadRequestException(`${field} is required`);
      }
    }
  }
}
